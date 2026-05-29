#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WRITE_TOOL_NAMES = new Set([
  "apply_patch",
  "functions.apply_patch",
  "Edit",
  "MultiEdit",
  "Write",
]);

const BASH_WRITE_PATTERNS = [
  /\bapply_patch\b/,
  /(?:^|[;&|]\s*)(?:cat|printf|echo)\b[\s\S]{0,240}>{1,2}\s*[^\s&|;]+/,
  /\btee\s+(?:-a\s+)?[^\s&|;]+/,
  /\bsed\s+(?:[^\n;&|]*\s)?-i(?:\b|['"])/,
  /\b(?:python3?|node|perl|ruby)\b[\s\S]{0,320}\b(?:writeFileSync|writeFile|write_text|open\([^)]*["']w|File\.write|Path\()/,
  /\bgit\s+(?:checkout|switch|restore|reset|apply|am|merge|rebase)\b/,
  /\b(?:npm|pnpm|yarn)\s+(?:install|i|add|ci)\b/,
];

const MAX_RISK_FILES = 20;
const MAX_REMOTE_BRANCHES_TO_SCAN = 40;
const RECENT_AUTHOR_WINDOW = process.env.CODEX_PRE_EDIT_GIT_RISK_AUTHOR_WINDOW || "14 days ago";
const REMOTE_BRANCH_WINDOW = process.env.CODEX_PRE_EDIT_GIT_RISK_BRANCH_WINDOW || "21 days ago";

const SHARED_CONTRACT_PATTERNS = [
  /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|Gemfile\.lock|Cargo\.lock|go\.sum|poetry\.lock)$/i,
  /(^|\/)(package\.json|pyproject\.toml|Cargo\.toml|go\.mod|pom\.xml|build\.gradle|settings\.gradle)$/i,
  /(^|\/)(Dockerfile|docker-compose\.ya?ml)$/i,
  /(^|\/)\.github\/workflows\//i,
  /(^|\/)(migrations?|schema|schemas)\//i,
  /\.(proto|graphql|gql)$/i,
  /(^|\/)(openapi|swagger)\.(json|ya?ml)$/i,
  /(^|\/)(api|apis|contracts?)\//i,
];

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function safeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function parsePayload(text) {
  try {
    const parsed = JSON.parse(text);
    return safeObject(parsed);
  } catch {
    return {};
  }
}

function runGit(cwd, args, options = {}) {
  return spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
}

function trimOutput(result) {
  return `${result.stdout || ""}${result.stderr || ""}`.trim();
}

function isWriteIntent(payload) {
  const toolName = String(payload.tool_name || payload.toolName || "").trim();
  if (WRITE_TOOL_NAMES.has(toolName)) return true;
  const input = safeObject(payload.tool_input || payload.toolInput);
  const command = String(input.command || "").trim();
  if (toolName === "Bash" || toolName === "functions.exec_command" || toolName === "exec_command") {
    return BASH_WRITE_PATTERNS.some((pattern) => pattern.test(command));
  }
  return false;
}

function allow(message) {
  if (process.env.CODEX_PRE_EDIT_GIT_SYNC_DEBUG === "1" && message) {
    console.error(`[pre-edit-git-sync] ${message}`);
  }
  process.exit(0);
}

function block(reason, additionalContext) {
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason,
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext,
    },
  }));
  process.exit(0);
}

function warn(additionalContext) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext,
    },
  }));
  process.exit(0);
}

function findRepoRoot(cwd) {
  const result = runGit(cwd, ["rev-parse", "--show-toplevel"]);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function getUpstream(repoRoot) {
  const result = runGit(repoRoot, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function getHead(repoRoot) {
  const result = runGit(repoRoot, ["rev-parse", "HEAD"]);
  if (result.status !== 0) return "";
  return result.stdout.trim();
}

function isWorktreeClean(repoRoot) {
  const result = runGit(repoRoot, ["status", "--porcelain=v1", "--untracked-files=no"]);
  return result.status === 0 && result.stdout.trim() === "";
}

function getAheadBehind(repoRoot) {
  const result = runGit(repoRoot, ["rev-list", "--left-right", "--count", "HEAD...@{u}"]);
  if (result.status !== 0) {
    return null;
  }
  const [aheadText, behindText] = result.stdout.trim().split(/\s+/);
  return {
    ahead: Number.parseInt(aheadText || "0", 10),
    behind: Number.parseInt(behindText || "0", 10),
  };
}

function gitLines(repoRoot, args) {
  const result = runGit(repoRoot, args);
  if (result.status !== 0) return [];
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function normalizeRepoPath(path) {
  return String(path || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");
}

function addPath(paths, value) {
  const normalized = normalizeRepoPath(value);
  if (!normalized || normalized.startsWith("-") || normalized.includes("\0")) return;
  if (/^(?:https?:|git@|ssh:)/i.test(normalized)) return;
  paths.add(normalized);
}

function collectStringValues(value, out = []) {
  if (typeof value === "string") {
    out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStringValues(item, out);
  }
  return out;
}

function extractPatchPaths(text, paths) {
  for (const match of text.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
    addPath(paths, match[1]);
  }
  for (const match of text.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)) {
    addPath(paths, match[1]);
    addPath(paths, match[2]);
  }
  for (const match of text.matchAll(/^(?:---|\+\+\+) [ab]\/(.+)$/gm)) {
    addPath(paths, match[1]);
  }
}

function extractCommandPaths(command, paths) {
  for (const match of command.matchAll(/(?:^|[^>])>{1,2}\s*(["']?)([^\s&|;<>]+)\1/g)) {
    addPath(paths, match[2]);
  }
  for (const match of command.matchAll(/\btee\s+(?:-a\s+)?(["']?)([^\s&|;<>]+)\1/g)) {
    addPath(paths, match[2]);
  }
  for (const match of command.matchAll(/\bsed\s+(?:[^\n;&|]*\s)?-i(?:\b|['"])[\s\S]{0,160}?\s(["']?)([^\s&|;<>]+)\1/g)) {
    addPath(paths, match[2]);
  }
}

function extractTargetPaths(payload) {
  const input = safeObject(payload.tool_input || payload.toolInput);
  const paths = new Set();
  for (const key of ["file_path", "filePath", "path", "target_path", "targetPath"]) {
    addPath(paths, input[key]);
  }
  const command = String(input.command || "").trim();
  if (command) extractCommandPaths(command, paths);
  for (const text of collectStringValues(input)) {
    extractPatchPaths(text, paths);
  }
  return [...paths].slice(0, MAX_RISK_FILES);
}

function isSharedContractPath(path) {
  return SHARED_CONTRACT_PATTERNS.some((pattern) => pattern.test(path));
}

function recentAuthorCount(repoRoot, path) {
  const authors = new Set(gitLines(repoRoot, [
    "log",
    `--since=${RECENT_AUTHOR_WINDOW}`,
    "--format=%ae",
    "--",
    path,
  ]));
  return authors.size;
}

function currentUpstreamRemoteBranch(upstream) {
  return upstream.replace(/^refs\/remotes\//, "");
}

function recentlyUpdatedRemoteBranches(repoRoot, upstream) {
  const current = currentUpstreamRemoteBranch(upstream);
  return gitLines(repoRoot, [
    "for-each-ref",
    `--format=%(refname:short) %(committerdate:iso8601)`,
    `--sort=-committerdate`,
    "refs/remotes",
  ]).flatMap((line) => {
    const branch = line.split(/\s+/)[0];
    if (!branch || branch === current || branch.endsWith("/HEAD")) return [];
    const fresh = runGit(repoRoot, ["log", "-1", `--since=${REMOTE_BRANCH_WINDOW}`, "--format=%H", branch]);
    if (fresh.status !== 0 || fresh.stdout.trim() === "") return [];
    return [branch];
  }).slice(0, MAX_REMOTE_BRANCHES_TO_SCAN);
}

function remoteBranchesTouchingFile(repoRoot, branches, path) {
  const hits = [];
  for (const branch of branches) {
    const result = runGit(repoRoot, ["diff", "--name-only", `HEAD...${branch}`, "--", path]);
    if (result.status === 0 && result.stdout.split(/\r?\n/).map((line) => line.trim()).includes(path)) {
      hits.push(branch);
    }
    if (hits.length >= 5) break;
  }
  return hits;
}

function buildCollaborationRisk(repoRoot, upstream, targetPaths, changedDuringSync) {
  if (process.env.CODEX_PRE_EDIT_GIT_RISK_SCAN === "0" || targetPaths.length === 0) {
    return null;
  }

  const changedSet = new Set(changedDuringSync);
  const remoteBranches = recentlyUpdatedRemoteBranches(repoRoot, upstream);
  const findings = [];
  let highest = "low";

  for (const path of targetPaths) {
    const reasons = [];
    const isContract = isSharedContractPath(path);
    const authors = recentAuthorCount(repoRoot, path);
    const branchHits = remoteBranchesTouchingFile(repoRoot, remoteBranches, path);

    if (changedSet.has(path)) reasons.push("upstream changed this file during the pre-edit sync");
    if (isContract) reasons.push("shared contract/config/dependency file");
    if (authors >= 2) reasons.push(`${authors} recent authors`);
    if (branchHits.length > 0) reasons.push(`also touched by remote branch(es): ${branchHits.join(", ")}`);

    if (reasons.length === 0) continue;

    const level = (isContract && (authors >= 2 || branchHits.length > 0)) || (changedSet.has(path) && branchHits.length > 0)
      ? "high"
      : "medium";
    if (level === "high") highest = "high";
    findings.push({ path, level, reasons });
  }

  if (findings.length === 0) return null;
  return { highest, findings };
}

function formatRiskContext(risk) {
  const lines = [
    "Pre-edit collaboration risk scan found files that may affect other collaborators.",
    "Keep the edit narrow, preserve public contracts when possible, and run the smallest relevant tests before finalizing.",
    "If the planned change alters a shared contract, prefer a backward-compatible change or split it into a dedicated branch/PR with migration notes.",
    "",
    "Findings:",
  ];
  for (const finding of risk.findings) {
    lines.push(`- ${finding.level.toUpperCase()} ${finding.path}: ${finding.reasons.join("; ")}`);
  }
  return lines.join("\n");
}

function stateFilePath() {
  const codexHome = process.env.CODEX_HOME || join(process.env.HOME || "", ".codex");
  return join(codexHome, "pre-edit-git-sync-state.json");
}

function readState() {
  try {
    return JSON.parse(readFileSync(stateFilePath(), "utf8"));
  } catch {
    return {};
  }
}

function writeState(state) {
  const path = stateFilePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2) + "\n");
}

function syncIntervalMs() {
  const raw = process.env.CODEX_PRE_EDIT_GIT_SYNC_INTERVAL_SECONDS || "300";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 300_000;
  return parsed * 1000;
}

function isFreshSync(entry, upstream, head) {
  if (!entry || entry.upstream !== upstream || entry.head !== head) return false;
  const syncedAt = Date.parse(String(entry.syncedAt || ""));
  if (!Number.isFinite(syncedAt)) return false;
  return Date.now() - syncedAt < syncIntervalMs();
}

function sessionKey(payload, repoRoot, upstream) {
  const sessionId = String(payload.session_id || payload.sessionId || payload.thread_id || payload.threadId || "global");
  const digest = createHash("sha256").update(`${resolve(repoRoot)}\0${upstream}`).digest("hex").slice(0, 16);
  return `${sessionId}:${digest}`;
}

function main() {
  const payload = parsePayload(readStdin());
  if (String(payload.hook_event_name || payload.hookEventName || "") !== "PreToolUse") {
    allow("not a PreToolUse event");
  }
  if (process.env.CODEX_PRE_EDIT_GIT_SYNC === "0") {
    allow("disabled by CODEX_PRE_EDIT_GIT_SYNC=0");
  }
  if (!isWriteIntent(payload)) {
    allow("tool has no write intent");
  }

  const cwd = String(payload.cwd || process.cwd());
  const repoRoot = findRepoRoot(cwd);
  if (!repoRoot) allow("not inside a git repository");

  const upstream = getUpstream(repoRoot);
  if (!upstream) {
    block(
      "Pre-edit git sync blocked because this branch has no upstream.",
      "Set an upstream branch first, or disable this hook with CODEX_PRE_EDIT_GIT_SYNC=0 for this run."
    );
  }

  const key = sessionKey(payload, repoRoot, upstream);
  const state = readState();
  const headBefore = getHead(repoRoot);
  const freshSync = isFreshSync(state[key], upstream, headBefore);
  const targetPaths = extractTargetPaths(payload);
  let changedDuringSync = [];

  if (!isWorktreeClean(repoRoot)) {
    block(
      "Pre-edit git sync blocked because the worktree has local modifications.",
      "Commit, stash, or otherwise resolve local changes before Codex edits files. The hook intentionally avoids auto-stash to prevent hidden conflicts."
    );
  }

  let counts = { ahead: 0, behind: 0 };
  if (!freshSync) {
    const fetch = runGit(repoRoot, ["fetch", "--prune"]);
    if (fetch.status !== 0) {
      block(
        "Pre-edit git sync could not fetch upstream.",
        `Review the git fetch failure, then retry. Output:\n${trimOutput(fetch)}`
      );
    }

    const nextCounts = getAheadBehind(repoRoot);
    if (!nextCounts) {
      block(
        "Pre-edit git sync could not compare HEAD with upstream.",
        "Verify the upstream branch still exists and the repository metadata is healthy."
      );
    }
    counts = nextCounts;

    if (counts.ahead > 0 && counts.behind > 0) {
      block(
        "Pre-edit git sync blocked because the branch has diverged from upstream.",
        "Rebase or merge deliberately before Codex edits files. The hook only performs safe fast-forward updates."
      );
    }

    if (counts.behind > 0) {
      changedDuringSync = gitLines(repoRoot, ["diff", "--name-only", "HEAD..@{u}"]);
      const merge = runGit(repoRoot, ["merge", "--ff-only", "@{u}"]);
      if (merge.status !== 0) {
        block(
          "Pre-edit git sync could not fast-forward to upstream.",
          `Resolve the git state manually before Codex edits files. Output:\n${trimOutput(merge)}`
        );
      }
    }

    const headAfter = getHead(repoRoot);
    state[key] = {
      repoRoot,
      upstream,
      head: headAfter,
      syncedAt: new Date().toISOString(),
    };
    writeState(state);
  }

  const risk = buildCollaborationRisk(repoRoot, upstream, targetPaths, changedDuringSync);
  if (risk?.highest === "high" && process.env.CODEX_PRE_EDIT_GIT_RISK_BLOCK_HIGH !== "0") {
    block(
      "Pre-edit collaboration risk scan blocked a high-risk edit.",
      `${formatRiskContext(risk)}\n\nSuggested resolution: sync with the owner of the overlapping branch or make this as a small dedicated compatibility/migration change before broader edits. Set CODEX_PRE_EDIT_GIT_RISK_BLOCK_HIGH=0 to downgrade high-risk findings to guidance.`
    );
  }
  if (risk) {
    warn(formatRiskContext(risk));
  }

  allow(counts.behind > 0 ? `fast-forwarded ${counts.behind} commit(s)` : "already current");
}

if (process.argv.includes("--self-test")) {
  process.stdout.write("ok\n");
} else if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
