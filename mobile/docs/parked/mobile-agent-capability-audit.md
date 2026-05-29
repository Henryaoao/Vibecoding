# ProjectM Mobile Agent Capability Audit

## 1. Audit Summary

Date: 2026-05-27

This audit records the current ProjectM agent, skill, MCP, and workflow capability state for mobile development.

Current operating decision:

- Current conversation remains the ProjectM Mobile Orchestrator Agent.
- Codex native sub-agents are not used for the mobile workflow at this stage.
- ProjectM should prefer project-provided agent specs, installed skills, OMX runtime when available, and MCP tools.
- Agent, skill, and MCP selection must prefer ProjectM configured assets first; if the project has no configured option, ask the user before switching to Codex native capability, installing a new tool, or adding a new MCP.
- Missing capabilities are repaired when a local repair path exists; otherwise they are recorded as blocked.

## 2. Project Agent Assets

| Asset | Status | Notes |
| --- | --- | --- |
| `mobile/docs/mobile-agent-workflow.md` | Available | Defines Orchestrator -> Development -> Test workflow, Requirement Handoff, TDD gate, and QA feedback loop. |
| `docs/agents/projectm-agent-specs.md` | Available | Defines ProjectM work-agent missions, source hierarchy, outputs, verification, and stop conditions. |
| `docs/agents/omx-workflows.md` | Available as project guidance | Defines preferred OMX routes and fallback rules. Runtime still depends on local `omx`. |
| `docs/agents/phase-02/02.4-runtime-boundaries.md` | Available | Confirms Codex App and OMX runtime boundaries. |
| `docs/agents/phase-02/02.10-qa-security-acceptance-skill-chain.md` | Available | Defines QA, permission, security, and acceptance routes. |

## 3. OMX Runtime

| Check | Result |
| --- | --- |
| Source | Official package from `Yeachan-Heo/oh-my-codex`, installed with `npm install -g oh-my-codex`. |
| `command -v omx` | Available at `/Users/garrison/.nvm/versions/node/v24.16.0/bin/omx`. |
| `omx --version` | `oh-my-codex v0.18.5`; Node.js `v24.16.0`; platform `darwin arm64`. |
| `omx setup --scope user --merge-agents` | Completed. User-scope setup wrote OMX prompts, skills, agent TOML files, hooks, config entries, HUD config, and `/Users/garrison/.codex/AGENTS.md`; project `AGENTS.md` was unchanged. |
| `omx doctor` | 15 passed, 1 warning, 0 failed. Warning: explore harness has no compatible prebuilt/cargo. |
| `omx doctor --team` | Passed. |
| `omx list --json` | Available. Reports 49 packaged skills, 34 prompts, 27 active skills, and 20 active agents. |
| `omx agents list` | Available. Reports 22 user-scope agent TOML entries. |
| Live `omx team` smoke test | Passed for no-edit runtime flow. A 1-worker `verifier` team started inside tmux from a clean temporary worktree, created a worker worktree, ACKed the leader, claimed task 1, inspected the repo, confirmed no file edits, transitioned the task to `completed`, and sent a DONE message. |
| Live 2-worker `omx team` workflow test | Passed for no-edit multi-worker flow. `omx team 2:verifier` started two worker panes, created two worker worktrees and two tasks, both workers ACKed, claimed their assigned tasks, inspected repo/docs, preserved clean git status, wrote results, and transitioned tasks to `completed`. |

Status: `AVAILABLE WITH ONE WARNING`.

Remaining warning:

- Explore harness warning remains because Rust/cargo or a compatible `OMX_EXPLORE_BIN` is not available. `omx explore` is deprecated compatibility routing and is not required for the current mobile Orchestrator workflow.

Runtime boundary:

- `omx team --help` states that `omx team` is a tmux-runtime surface by default and should be launched from shell rather than treated as directly available inside Codex App.
- `tmux` is now installed and available at `/opt/homebrew/bin/tmux`.
- Direct `omx team` from Codex App shell fails as expected with `Team mode requires running inside tmux current leader pane`.
- Live team usage was validated by launching `omx team` from a temporary tmux leader pane.
- The tested CLI form for multiple workers is `omx team 2:verifier "<task>"`. A mixed form such as `omx team 1:analyst 1:verifier "<task>"` was parsed as one `analyst` worker plus task text, so mixed-role team launch syntax remains unverified.

## 4. Installed Skills

All project-provided skills with a direct `SKILL.md` were installed to:

```text
/Users/garrison/.codex/skills
```

Verification:

- Project skill source count: 44.
- Project skill install count before OMX setup: 44.
- `omx setup` refreshed OMX-managed skills; `omx doctor` now reports 75 installed skills.
- Direct `SKILL.md` files under `/Users/garrison/.codex/skills`: 73.
- `/Users/garrison/.codex/skills/evolution-inbox` exists and was preserved.

Installed skills:

```text
adaptive-audit
agent-self-evolution
agent-supply-chain
ai-prompt-engineering-safety-review
autoreview
azure-devops-cli
breakdown-feature-prd
browser-automation
codeql
conventional-commit
create-agentsmd
create-implementation-plan
create-specification
dependabot
documentation-writer
frontend-ui-engineering
git-commit
golang-code-style
golang-context
golang-database
golang-error-handling
golang-lint
golang-observability
golang-performance
golang-project-layout
golang-safety
golang-security
golang-testing
javascript-typescript-jest
openapi-to-application-code
openclaw-docker-e2e-authoring
openclaw-qa-testing
playwright-explore-website
playwright-generate-test
prd
premium-frontend-ui
qa-automation-engineering
quality-playbook
secret-scanning
security-review
security-triage
sql-optimization
web-design-reviewer
webapp-testing
```

Note: Codex skill discovery may require a new Codex session before all newly installed skills appear in the runtime skill list.

## 5. MCP And Plugins

| Capability | Status | Evidence |
| --- | --- | --- |
| `node_repl` MCP | Available | `node_repl` executed a JavaScript probe and returned current workspace paths. |
| Browser plugin | Configured | `browser@openai-bundled` is enabled in `~/.codex/config.toml`. |
| OMX first-party MCP | Omitted by setup | `omx setup` used MCP mode `none`; no new first-party OMX MCP was added. |
| Other project MCP servers | Not found | No project-local MCP config was found. |

No additional MCP server was installed in this repair pass because ProjectM does not currently provide a local MCP configuration for Figma, Linear, Azure DevOps, GitHub, or similar external services.

## 6. External CLI Dependencies

Some installed skills depend on external command-line tools. Installing a skill makes the workflow instructions available to Codex, but it does not install third-party CLIs.

| Command | Status | Mobile Impact |
| --- | --- | --- |
| `git` | Available | Required for branch, diff, status, and commit workflows. |
| `node` | Available | Required for the Expo / React Native project. |
| `npm` | Available | Required for install, typecheck, test, and Expo scripts. |
| `npx` | Available | Can run package-local tools such as Expo CLI without a global install. |
| `docker` | Not in PATH | Not a blocker for current mobile tests; needed for future full-stack local runtime. |
| `go` | Not in PATH | Not a blocker for mobile-only work; needed for future backend implementation and tests. |
| `mysql` | Not in PATH | Not a blocker for mobile-only work; needed for direct DB operations later. |
| `codeql` | Not in PATH | Security skill can still review code manually; CodeQL scans need the CLI installed. |
| `az` | Not in PATH | Azure DevOps skill can still provide guidance; Azure CLI operations need install and login. |
| `gh` | Not in PATH | GitHub-specific operations need the GitHub CLI if used later. |
| `eas` | Not in PATH | EAS builds need EAS CLI or `npx eas-cli`; not required for current Jest/typecheck. |
| `expo` | Not in PATH | Global Expo CLI is not installed; use project scripts or `npx expo` for local development. |
| `tmux` | Available | Installed with Homebrew; required for live `omx team` panes. |

Current mobile project verification does not require the missing CLIs above. Future Docker, backend, Azure, GitHub, CodeQL, or EAS tasks should install and authenticate the relevant tool before claiming that workflow is executable.

## 7. Mobile Development Capability Matrix

| Mobile Agent | Preferred Available Capability | Current State |
| --- | --- | --- |
| Orchestrator Agent | Current conversation + `mobile/docs/mobile-agent-workflow.md` + installed `prd`, `create-implementation-plan`, `documentation-writer` skills | Available. |
| Architecture Agent | Project architecture docs + installed `create-implementation-plan`, `frontend-ui-engineering`, `javascript-typescript-jest` skills | Available without OMX. |
| Design Agent | Installed `premium-frontend-ui`, `web-design-reviewer`, `browser-automation`; Browser plugin configured | Available; visual runtime still depends on a running app or prototype target. |
| Development Agent | Installed `frontend-ui-engineering`, `javascript-typescript-jest`, `webapp-testing`; mobile TDD policy | Available without OMX. |
| Test Agent | Installed `qa-automation-engineering`, `openclaw-qa-testing`, `javascript-typescript-jest`, `webapp-testing` | Available without OMX. |
| Security Agent | Installed `security-review`, `secret-scanning`, `codeql`, `agent-supply-chain` | Available for manual/security review; CodeQL scan execution needs `codeql` CLI. |
| Git Agent | Installed `git-commit`, `autoreview`, `azure-devops-cli`; git CLI available | Available; push still requires credentials and explicit user request. |

## 8. Remaining Gaps

| Gap | Impact | Recommended Fix |
| --- | --- | --- |
| OMX explore harness warning | `omx explore` compatibility path may not work until Rust/cargo or `OMX_EXPLORE_BIN` is available. | Do not rely on `omx explore`; use normal repository inspection or install Rust only if explore becomes necessary. |
| Direct `omx team` from Codex App shell is not supported | `omx team` requires a tmux leader pane and fails outside tmux. | Start `omx team` from a shell/tmux leader, or let the Orchestrator run a controlled tmux launch. |
| Newly installed skills may need session reload | Current Codex session may not auto-discover all newly installed/refreshed skills. | Restart Codex or open a new session, then verify skill availability. |
| No extra MCP servers | Figma, Linear, Azure DevOps, and GitHub MCP workflows are unavailable as MCP tools. | Add only when a specific workflow requires them and credentials are available. |
| Native sub-agents intentionally disabled for now | Parallel delegation through Codex native sub-agents is not part of current flow. | Keep using installed project skills and direct Orchestrator routing until this decision changes. |
| Some skill-dependent CLIs are missing | Docker, Go, MySQL, CodeQL, Azure CLI, GitHub CLI, EAS CLI, and global Expo CLI workflows cannot be claimed executable yet. | Install only when the related workflow becomes active; mobile npm checks remain available now. |

## 9. Recommended Mobile Workflow Until OMX Is Repaired

1. User sends all requests to the Orchestrator Agent in the current conversation.
2. Orchestrator produces a Requirement Handoff.
3. If implementation-ready, user confirms Development Agent execution.
4. Development follows TDD using installed ProjectM skills and mobile architecture rules.
5. Test Agent validates with installed QA/test skills and local commands.
6. Security or Git Agent roles are invoked through installed skills and ProjectM role rules as needed.
7. Status changes are recorded in `mobile/docs/mobile-project-status.md`.
