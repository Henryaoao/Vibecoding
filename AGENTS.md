# AGENTS.md

## Project Overview

ProjectM is a multi-end internal company portal. The product is currently in the planning/documentation phase.

Target stack:

- Web frontend: React + TypeScript + Vite
- App frontend: React Native + TypeScript + Expo-managed workflow
- Backend: Go REST API
- Database: PostgreSQL 16
- Runtime: Docker Compose with frontend, backend, PostgreSQL, and pgAdmin
- Roles: exactly two application roles, `user` and `super_user`

Core MVP modules:

- 今日公司简报
- 公司公告墙
- 员工论坛热帖
- 新人专区
- 财经轻资讯
- 文档中心
- 培训中心

Canonical product documents:

- `docs/prd/README.md`: PRD hierarchy, source-of-truth precedence, and reading order
- `docs/prd/projectm-overall-prd.md`: stable ProjectM product constitution
- `docs/prd/endpoints/web-prd.md`: Web endpoint-specific requirements
- `docs/prd/endpoints/app-prd.md`: App endpoint-specific requirements
- `docs/prd/references/permissions-and-admin-guide.md`: role, permission, and Admin Console usage guide
- `docs/prd/references/sample-data.md`: sample content and mock/reference data
- `docs/prd/references/omx-decision-policy.md`: hard red lines, defaults, and confirmation-required decisions
- `docs/prd/phases/`: independently executable foundation and module phase PRDs

Agents must treat the `docs/prd/` hierarchy as the product source of truth. `.omx/plans/` and `.omx/ultragoal/` are workflow artifacts, not durable product truth.

## Current Repository State

This repository currently contains documentation and agent guidance. Do not invent completed app structure unless explicitly asked to scaffold it.

Expected future structure:

```text
.
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── .env.example
└── AGENTS.md
```

When implementation begins, keep generated code aligned with `docs/prd/README.md`, `docs/prd/projectm-overall-prd.md`, and the relevant endpoint/reference/phase PRDs.

## Split Agent Guidance

This file is the short operating contract. Detailed guidance lives in smaller reference files:

- `docs/agents/README.md`: index and reading order
- `docs/agents/omx-workflows.md`: OMX active agents, workflow skills, and ProjectM mappings
- `docs/agents/project-roles.md`: ProjectM role matrix and role-specific responsibilities
- `docs/agents/capability-governance.md`: AI / Agent modification permissions, document-structure protection, self-verification gates, and handoff rules
- `docs/agents/skills.md`: installed skill selection, core custom skills, and project-local portable skill mirrors
- `docs/agents/verification.md`: commands, documentation rules, implementation rules, and completion checks
- `agentschinese.md`: Chinese companion guide for human-readable ProjectM agent operations

When a task touches roles, workflow routing, skills, or verification, read the relevant split file before acting.

## Core Operating Rules

- Prefer direct solo execution for small documentation or single-file edits.
- Use OMX workflow routing only when it materially improves quality, speed, or safety.
- Use `$team` only from a real OMX tmux runtime when parallel panes/stateful coordination are needed.
- In Codex App outside attached OMX tmux, do not assume live team panes are available.
- Use the most specific installed or portable skill before a generic role.
- If a named portable skill is unavailable, read `custom-skill-dev-package/skills/<skill-name>/SKILL.md` when present and follow that workflow manually.
- ProjectM-maintained custom skills stay under `custom-skills/`; portable mirrors of installed third-party/local skills stay under `custom-skill-dev-package/skills/`.
- Do not change the `docs/prd/` hierarchy, file names, source-of-truth order, or reading order without explicit user confirmation.
- Each ProjectM delivery role may only modify its permitted files and behavior by default; see `docs/agents/capability-governance.md`.
- Every role must complete self-verification before handing work to the next role or claiming completion.
- Keep ProjectM roles limited to `user` and `super_user`.
- Do not reintroduce `content_admin`, `department_admin`, or `system_admin`.
- Do not implement browsing history, `recent_views`, view history, or equivalent user behavior tracking unless the user explicitly reverses that decision.
- 财经轻资讯 must not include stock recommendations, buy/sell advice, individual stock predictions, or return promises.
- Backend authorization is the source of truth; frontend role hiding is UX only.
- All `/api/v1/admin/*` endpoints require `super_user`.
- App does not include mobile admin write workflows; all `super_user` management/admin writes are Web Admin Console scope.
- pgAdmin port is `5050`.
- Never commit `.env` with real secrets.

## Common Routing

- Product / PRD changes: Product / PRD Owner, `$prd`, `analyst` / `writer`
- UX and React planning: UX / Frontend Designer, `$design`, `designer`
- Web React implementation: Frontend Engineer, `$frontend-ui-engineering`, `executor`
- App implementation: App Frontend Engineer, React Native + TypeScript + Expo, `executor`
- Go API implementation: Backend Engineer, Go skills, `architect` / `executor`
- PostgreSQL schema: Database Engineer, `$golang-database`, `architect`
- Docker/Azure/git: DevOps Engineer or Git Steward, `$git-commit`, `$azure-devops-cli`, `git-master`
- Testing and acceptance: QA / Verifier, `$ultraqa`, `test-engineer` / `verifier`
- Security review: Security Reviewer, `$code-review`, `code-reviewer`

See `docs/agents/project-roles.md` and `docs/agents/omx-workflows.md` for full mappings.

## Lore Commit Protocol

Every commit message must follow the Lore protocol:

```text
<intent line: why the change was made, not what changed>

<optional concise body: constraints and approach rationale>

Constraint: <external constraint that shaped the decision>
Rejected: <alternative considered> | <reason for rejection>
Confidence: <low|medium|high>
Scope-risk: <narrow|moderate|broad>
Directive: <forward-looking warning for future modifiers>
Tested: <what was verified>
Not-tested: <known gaps in verification>
```

Rules:

- Intent line first; describe why, not what.
- Use trailers only when they add decision context.
- Use `Rejected:` for alternatives future agents should not re-explore.
- Use `Directive:` for warnings.
- Use `Not-tested:` for known verification gaps.

## Completion Checklist

Before reporting done, verify the relevant subset:

- Changed files are intentional.
- ProjectM source docs remain consistent.
- Old role names are not reintroduced as active roles.
- Browsing history remains out of scope.
- Finance content keeps the no-investment-advice boundary.
- Docker defaults remain `frontend:3000`, `backend:8080`, `postgres:5432`, `pgadmin:5050`.
- If implementation code exists, tests or smoke checks have been run and results are reported.

For detailed checks, read `docs/agents/verification.md`.
