#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const scriptPath = join(import.meta.dirname, "pre-edit-git-sync.mjs");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
  if (options.check !== false && result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

function git(cwd, args) {
  return run("git", args, { cwd });
}

function invokeHook(cwd, payload, env = {}) {
  return run(process.execPath, [scriptPath], {
    cwd,
    input: JSON.stringify({
      hook_event_name: "PreToolUse",
      cwd,
      session_id: "test-session",
      ...payload,
    }),
    env: {
      ...process.env,
      CODEX_HOME: env.CODEX_HOME,
      HOME: env.HOME,
      PATH: process.env.PATH,
    },
    check: false,
  });
}

function parseJsonOutput(result) {
  assert.equal(result.status, 0);
  assert.notEqual(result.stdout.trim(), "");
  return JSON.parse(result.stdout);
}

function initRepo(path) {
  git(path, ["init", "-q"]);
  git(path, ["config", "user.email", "test@example.com"]);
  git(path, ["config", "user.name", "Test User"]);
}

function commitFile(repo, name, content, message) {
  writeFileSync(join(repo, name), content);
  git(repo, ["add", name]);
  git(repo, ["commit", "-q", "-m", message]);
}

function commitFileAs(repo, name, content, message, email) {
  writeFileSync(join(repo, name), content);
  git(repo, ["add", name]);
  run("git", [
    "-c",
    `user.email=${email}`,
    "-c",
    "user.name=Other User",
    "commit",
    "-q",
    "-m",
    message,
  ], { cwd: repo });
}

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "pre-edit-git-sync-test-"));
  const codexHome = join(root, "codex-home");
  mkdirSync(codexHome);

  const upstream = join(root, "upstream.git");
  git(root, ["init", "-q", "--bare", upstream]);

  const seed = join(root, "seed");
  mkdirSync(seed);
  initRepo(seed);
  commitFile(seed, "file.txt", "one\n", "initial");
  git(seed, ["branch", "-M", "main"]);
  git(seed, ["remote", "add", "origin", upstream]);
  git(seed, ["push", "-q", "-u", "origin", "main"]);

  const work = join(root, "work");
  git(root, ["clone", "-q", upstream, work]);
  git(work, ["config", "user.email", "test@example.com"]);
  git(work, ["config", "user.name", "Test User"]);

  return { root, upstream, seed, work, codexHome };
}

function writePayload() {
  return {
    tool_name: "functions.apply_patch",
    tool_input: {},
  };
}

function patchPayload(path) {
  return {
    tool_name: "functions.apply_patch",
    tool_input: {
      patch: `*** Begin Patch\n*** Update File: ${path}\n@@\n-old\n+new\n*** End Patch\n`,
    },
  };
}

function execReadPayload() {
  return {
    tool_name: "functions.exec_command",
    tool_input: { command: "git status" },
  };
}

function testNonWriteToolSkips() {
  const fixture = makeFixture();
  try {
    const result = invokeHook(fixture.work, execReadPayload(), { CODEX_HOME: fixture.codexHome });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), "");
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

function testMissingUpstreamBlocks() {
  const root = mkdtempSync(join(tmpdir(), "pre-edit-git-sync-no-upstream-"));
  const codexHome = join(root, "codex-home");
  mkdirSync(codexHome);
  try {
    initRepo(root);
    commitFile(root, "file.txt", "one\n", "initial");
    const result = invokeHook(root, writePayload(), { CODEX_HOME: codexHome });
    const output = parseJsonOutput(result);
    assert.equal(output.decision, "block");
    assert.match(output.reason, /no upstream/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function testFastForwardsBehindBranch() {
  const fixture = makeFixture();
  try {
    commitFile(fixture.seed, "file.txt", "two\n", "upstream update");
    git(fixture.seed, ["push", "-q"]);

    const before = git(fixture.work, ["rev-parse", "HEAD"]).stdout.trim();
    const result = invokeHook(fixture.work, writePayload(), { CODEX_HOME: fixture.codexHome });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), "");
    const after = git(fixture.work, ["rev-parse", "HEAD"]).stdout.trim();
    assert.notEqual(after, before);
    assert.equal(git(fixture.work, ["status", "--porcelain=v1"]).stdout.trim(), "");
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

function testWarnsWhenTargetChangedDuringSync() {
  const fixture = makeFixture();
  try {
    commitFileAs(fixture.seed, "file.txt", "two\n", "upstream update", "other@example.com");
    git(fixture.seed, ["push", "-q"]);

    const result = invokeHook(fixture.work, patchPayload("file.txt"), { CODEX_HOME: fixture.codexHome });
    const output = parseJsonOutput(result);
    assert.equal(output.decision, undefined);
    assert.match(output.hookSpecificOutput.additionalContext, /collaboration risk/i);
    assert.match(output.hookSpecificOutput.additionalContext, /file\.txt/);
    assert.match(output.hookSpecificOutput.additionalContext, /upstream changed this file/i);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

function testBlocksSharedContractTouchedByRemoteBranch() {
  const fixture = makeFixture();
  try {
    commitFile(fixture.seed, "package.json", "{\"name\":\"demo\"}\n", "add package");
    git(fixture.seed, ["push", "-q"]);
    git(fixture.work, ["pull", "--ff-only", "-q"]);

    git(fixture.seed, ["checkout", "-q", "-b", "feature/package-change"]);
    commitFileAs(fixture.seed, "package.json", "{\"name\":\"demo\",\"private\":true}\n", "feature package change", "other@example.com");
    git(fixture.seed, ["push", "-q", "-u", "origin", "feature/package-change"]);

    const result = invokeHook(fixture.work, patchPayload("package.json"), { CODEX_HOME: fixture.codexHome });
    const output = parseJsonOutput(result);
    assert.equal(output.decision, "block");
    assert.match(output.reason, /high-risk/i);
    assert.match(output.hookSpecificOutput.additionalContext, /package\.json/);
    assert.match(output.hookSpecificOutput.additionalContext, /remote branch/i);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

function testDivergedBranchBlocks() {
  const fixture = makeFixture();
  try {
    commitFile(fixture.seed, "upstream.txt", "two\n", "upstream update");
    git(fixture.seed, ["push", "-q"]);
    commitFile(fixture.work, "local.txt", "local\n", "local update");

    const result = invokeHook(fixture.work, writePayload(), { CODEX_HOME: fixture.codexHome });
    const output = parseJsonOutput(result);
    assert.equal(output.decision, "block");
    assert.match(output.reason, /diverged/i);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

testNonWriteToolSkips();
testMissingUpstreamBlocks();
testFastForwardsBehindBranch();
testWarnsWhenTargetChangedDuringSync();
testBlocksSharedContractTouchedByRemoteBranch();
testDivergedBranchBlocks();
console.log("pre-edit-git-sync tests passed");
