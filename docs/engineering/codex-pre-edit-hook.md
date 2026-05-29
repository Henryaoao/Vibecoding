# Codex Pre-Edit Git Hook

Project-M includes a project-local Codex hook that runs before Codex writes code. It helps avoid starting AI edits from stale code or touching collaboration hotspots without a warning.

## Install

From the Project-M repository root:

```bash
node scripts/install-codex-pre-edit-hook.mjs
```

Each team member runs this once on their own machine. The installer adds a `PreToolUse` entry to that user's Codex `hooks.json` and points it at this repository's `.codex/hooks/pre-edit-git-sync.mjs`.

## What It Does

- Runs only before write-like Codex tools, not read-only commands.
- Runs `git fetch --prune`.
- If the current branch is behind upstream, updates only with `git merge --ff-only @{u}`.
- Blocks Codex edits when the branch has no upstream, the worktree has local modifications, the branch diverged, or fast-forward is not possible.
- Scans the files Codex is about to modify for collaboration risk:
  - upstream changed the same file during pre-edit sync
  - remote active branches also changed the same file
  - the file had multiple recent authors
  - the file is a shared contract/config file, such as lockfiles, package manifests, schema, migrations, OpenAPI, protobuf, GraphQL, Docker, or CI workflow files

## What It Does Not Do

- It does not auto-stash local work.
- It does not auto-rebase.
- It does not auto-resolve conflicts.
- It cannot see changes another teammate has not pushed.

## Risk Behavior

- Medium risk: lets Codex continue, but injects guidance to keep the edit narrow and run relevant tests.
- High risk: blocks by default and asks for a deliberate collaboration step first.

## Environment Switches

```bash
CODEX_PRE_EDIT_GIT_SYNC=0                   # disable the hook for this run
CODEX_PRE_EDIT_GIT_RISK_SCAN=0              # disable collaboration risk scanning
CODEX_PRE_EDIT_GIT_RISK_BLOCK_HIGH=0        # warn on high risk instead of blocking
CODEX_PRE_EDIT_GIT_SYNC_INTERVAL_SECONDS=60 # adjust repeated fetch interval
```

## Recommended Team Workflow

Use one branch or worktree per Codex task. Let this hook handle pre-edit sync and risk detection, then rely on PR review and CI for final semantic validation.
