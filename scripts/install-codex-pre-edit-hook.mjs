#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hookScript = join(repoRoot, ".codex", "hooks", "pre-edit-git-sync.mjs");
const codexHome = process.env.CODEX_HOME || join(process.env.HOME || "", ".codex");
const hooksPath = join(codexHome, "hooks.json");
const nodePath = process.execPath;
const command = `${quote(nodePath)} ${quote(hookScript)}`;

const eventName = "PreToolUse";
const eventLabel = "pre_tool_use";
const managedHookPattern = /(?:^|[\\/])pre-edit-git-sync\.mjs(?:["'\s]|$)/;

function quote(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map((item) => canonicalJson(item));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])])
    );
  }
  return value;
}

function trustedHash(entry, hook) {
  const identity = {
    event_name: eventLabel,
    ...(entry.matcher ? { matcher: entry.matcher } : {}),
    hooks: [
      {
        type: "command",
        command: hook.command,
        timeout: Math.max(1, hook.timeout ?? 600),
        async: false,
        ...(hook.statusMessage ? { statusMessage: hook.statusMessage } : {}),
      },
    ],
  };
  return `sha256:${createHash("sha256").update(JSON.stringify(canonicalJson(identity))).digest("hex")}`;
}

function readHooksJson() {
  if (!existsSync(hooksPath)) return { hooks: {}, state: {} };
  const parsed = JSON.parse(readFileSync(hooksPath, "utf8"));
  if (!isPlainObject(parsed)) throw new Error(`${hooksPath} is not a JSON object`);
  parsed.hooks = isPlainObject(parsed.hooks) ? parsed.hooks : {};
  parsed.state = isPlainObject(parsed.state) ? parsed.state : {};
  return parsed;
}

function install() {
  if (!existsSync(hookScript)) {
    throw new Error(`Missing hook script: ${hookScript}`);
  }

  mkdirSync(dirname(hooksPath), { recursive: true });
  const config = readHooksJson();
  const entries = Array.isArray(config.hooks[eventName]) ? config.hooks[eventName] : [];
  const filteredEntries = entries.flatMap((entry) => {
    if (!isPlainObject(entry) || !Array.isArray(entry.hooks)) return [entry];
    const hooks = entry.hooks.filter((hook) => {
      return !(isPlainObject(hook)
        && hook.type === "command"
        && typeof hook.command === "string"
        && managedHookPattern.test(hook.command)
        && hook.command !== command);
    });
    return hooks.length > 0 ? [{ ...entry, hooks }] : [];
  });
  const exists = filteredEntries.some((entry) => {
    return isPlainObject(entry)
      && Array.isArray(entry.hooks)
      && entry.hooks.some((hook) => isPlainObject(hook) && hook.command === command);
  });

  if (!exists) {
    filteredEntries.push({
      hooks: [
        {
          type: "command",
          command,
        },
      ],
    });
  }
  config.hooks[eventName] = filteredEntries;

  for (const key of Object.keys(config.state)) {
    if (key.startsWith(`${hooksPath}:${eventLabel}:`)) {
      delete config.state[key];
    }
  }

  for (let groupIndex = 0; groupIndex < filteredEntries.length; groupIndex += 1) {
    const entry = filteredEntries[groupIndex];
    if (!isPlainObject(entry) || !Array.isArray(entry.hooks)) continue;
    for (let handlerIndex = 0; handlerIndex < entry.hooks.length; handlerIndex += 1) {
      const hook = entry.hooks[handlerIndex];
      if (!isPlainObject(hook) || hook.type !== "command" || hook.command !== command) continue;
      const key = `${hooksPath}:${eventLabel}:${groupIndex}:${handlerIndex}`;
      config.state[key] = { trusted_hash: trustedHash(entry, hook) };
    }
  }

  writeFileSync(hooksPath, JSON.stringify(config, null, 2) + "\n");
  process.stdout.write(`Installed Project-M Codex pre-edit hook:\n${command}\n`);
}

install();
