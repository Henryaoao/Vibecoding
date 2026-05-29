# OMX Workflows For ProjectM

## Operating Model

Use OMX-style routing when role separation improves quality or speed. Default to solo execution for small changes.

- Use direct solo execution for small documentation or single-file edits.
- Use `$prd` for product requirements, user stories, acceptance criteria, or functional/non-functional requirements.
- Use `$ralplan` or `$plan` for architecture, data model, API, or cross-module tradeoffs before coding.
- Use `$team` only when parallel work is valuable, such as frontend + backend + database + QA moving together.
- Use `$git-commit` when the user asks to commit or push changes.
- Use code review posture when the user asks to review.

In Codex App outside an attached OMX tmux runtime, do not assume live OMX team panes are available. Launch OMX CLI from shell first, or use native subagents only for bounded independent research/review.

## Active OMX Agents

This machine reports 16 active OMX agent entry points through `omx list --json`:

| Active Agent | Use For |
| --- | --- |
| `explore` | Fast repository lookup, file/symbol mapping, current implementation discovery |
| `analyst` | Requirements clarity, product constraints, acceptance criteria, hidden assumptions |
| `planner` | Sequencing, implementation plans, risk flags, dependency ordering |
| `architect` | System design, module boundaries, API/data model tradeoffs |
| `debugger` | Root-cause analysis, regression isolation, failure diagnosis |
| `executor` | Implementation, refactoring, concrete code or docs edits |
| `verifier` | Completion evidence, validation strategy, test adequacy, final proof |
| `code-reviewer` | Code review, correctness risks, maintainability, security/performance consolidation |
| `dependency-expert` | Package, SDK, framework, upgrade, replacement, license, and maintenance decisions |
| `test-engineer` | Test strategy, coverage design, test implementation, flaky-test hardening |
| `designer` | UX/UI architecture, interaction design, visual quality review |
| `writer` | Documentation, migration notes, PRD text, user-facing guidance |
| `git-master` | Commit strategy, branch hygiene, push readiness, git operation review |
| `researcher` | Official docs, external reference checks, version-aware framework/API guidance |
| `critic` | Critical challenge of plans, designs, and assumptions before execution |
| `vision` | Screenshots, diagrams, visual evidence, image-based inspection |

Non-active names map to active replacements:

| Non-Active Name | Status | Use Instead |
| --- | --- | --- |
| `style-reviewer` | merged | `code-reviewer` |
| `quality-reviewer` | merged | `code-reviewer` |
| `api-reviewer` | merged | `code-reviewer` |
| `performance-reviewer` | merged | `code-reviewer` |
| `quality-strategist` | merged | `verifier` |
| `qa-tester` | merged | `test-engineer` |
| `product-manager` | merged | `analyst` |
| `ux-researcher` | merged | `designer` |
| `information-architect` | merged | `designer` |
| `product-analyst` | merged | `analyst` |
| `security-reviewer` | deprecated | `code-reviewer` plus ProjectM Security Reviewer rules |
| `build-fixer` | deprecated | `debugger` then `executor` |
| `team-executor` | internal | OMX team runtime only |
| `code-simplifier` | internal | OMX internal cleanup/runtime use only |

## Workflow Skill Mapping

Use this mental model:

```text
OMX workflow skill = how the work is coordinated
Active OMX agent = who executes or reviews
ProjectM role = business responsibility and product boundary
Portable skill = specialized playbook or fallback instructions
```

| Workflow Skill | Use In ProjectM When | Primary Active Agents | ProjectM Roles Usually Involved | Typical Skills |
| --- | --- | --- | --- | --- |
| `$deep-interview` | Requirements, boundaries, or admin behavior are unclear | `analyst`, `planner` | Product / PRD Owner, UX / Frontend Designer, Backend Engineer | `$prd`, `$create-specification` |
| `$ralplan` / `$plan` | Need an implementation plan before editing | `planner`, `architect`, `critic` | Product / PRD Owner, Backend Engineer, Database Engineer, QA / Verifier | `$create-implementation-plan`, `$breakdown-feature-prd`, `$golang-database` |
| `$ultragoal` | A large outcome needs staged progress | `planner`, `executor`, `verifier` | All delivery roles as needed | `$prd`, `$frontend-ui-engineering`, `$golang-project-layout`, `$webapp-testing` |
| `$team` | Multiple workstreams should move in parallel | `architect`, `executor`, `designer`, `test-engineer`, `verifier`, `code-reviewer` | UX, Frontend, Backend, Database, QA, Security | Role-specific skills |
| `$ralph` | One owner should keep working through implementation and verification | `executor`, `debugger`, `verifier` | Most relevant role plus QA / Verifier | Role-specific skills |
| `$ultraqa` | Final acceptance, regression, or release confidence is needed | `test-engineer`, `verifier`, `code-reviewer` | QA / Verifier, Security Reviewer, Git Steward | `$webapp-testing`, `$golang-testing`, `$code-review`, `$secret-scanning` |
| `$code-review` | User asks for review or risky permission/security/data changes | `code-reviewer`, `critic`, `verifier` | Security Reviewer, QA / Verifier, Backend, Frontend | `$security-review`, `$codeql`, `$golang-security`, `$webapp-testing` |
| `$design` / `$visual-ralph` | React UI, screenshots, layout, or visual quality needs review | `designer`, `vision`, `verifier` | UX / Frontend Designer, Frontend Engineer, QA / Verifier | `$premium-frontend-ui`, `$web-design-reviewer`, `$browser-automation` |
| `$best-practice-research` | Official guidance or current framework/API behavior matters | `researcher`, `dependency-expert`, `architect` | Backend, Frontend, DevOps, Security | `$golang-security`, `$azure-devops-cli`, `$openapi-to-application-code` |
| `$ai-slop-cleaner` | Docs or code need cleanup without meaning changes | `code-simplifier`, `writer`, `code-reviewer` | Product / PRD Owner, Git Steward, QA / Verifier | `$documentation-writer`, `$quality-playbook` |
| `$doctor` | Validate local OMX install | `verifier` | DevOps Engineer, Git Steward | No project skill required |
| `$skill` | Inspect or manage skill availability | `explore`, `verifier` | DevOps Engineer, Git Steward | `custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md` |
| `$hud` | Inspect current OMX runtime state during long workflows | `planner`, `verifier` | Any coordinating role | No project skill required |

Do not use deprecated OMX skills such as `$swarm`, `$tdd`, `$build-fix`, `$security-review`, `$visual-verdict`, `$web-clone`, or `$review`; use the active mappings above instead.
