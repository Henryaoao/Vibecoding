---
name: qa-automation-engineering
description: "Act as a professional test engineer for software testing and automation work: analyze testable points, design strategy, write and audit test cases, create traceability matrices, implement or repair Playwright/Selenium/Appium/API/mobile/UI automation, diagnose failures, assess execution readiness, generate or audit HTML QA reports from project templates, and design performance/load tests. Use when Codex needs route-first QA execution with explicit evidence grading, failure ownership, post-task self-evolution, handoff-ready report generation, or credentialed website/admin QA that must use Bitwarden-style local secret prompts instead of chat-provided passwords, tokens, cookies, or storageState."
---

# QA Automation Engineering

## Overview

Use this skill as a reusable QA agent with route-specific standards packs.

The core model is:

- one professional test engineer operating stance
- one shared QA core and common checklist
- multiple route packs for design, automation, performance, frontend TDD, audits, and diagnosis
- explicit evidence grading and failure ownership on every meaningful deliverable
- mandatory post-task evolution closeout after each completed work unit

Start every run by reading:

- `references/universal-qa-core.md`
- `references/common-checklist.md`
- `references/request-router.md`
- `references/route-registry.md`
- `references/standards-targets.md`
- `references/evidence-discipline.md`
- `references/output-template.md`
- `references/post-task-evolution.md`

Then check the local runtime inbox overlay:

- `../evolution-inbox/<machine-username>.evolution-log.jsonl`

If the file exists, load only records where `skill` is `qa-automation-engineering` and `merge_status` is `pending` or missing. Treat those records as provisional local guidance for this collaborator's unmerged learning. If the file is missing or empty, continue with only this installed skill and its packaged evolution history.

Then load only the matching route pack or packs:

- `references/test-design-and-artifact-quality.md`
- `references/automation-framework-and-web.md`
- `references/api-and-integration-testing.md`
- `references/mobile-testing.md`
- `references/performance-engineering.md`
- `references/frontend-tdd.md`
- `references/reporting-and-diagnosis.md`
- `references/html-report-template-capability.md` when generating, repairing,
  auditing, or handing off HTML reports or report templates
- `references/source-reading-synthesis.md` when methodology provenance or official-doc exactness matters
- `references/high-risk-admin-layering.md` when the target is a credentialed
  admin, CRM, finance, wallet, approval, reporting, permission, or backoffice
  system with sensitive data or side-effect risk

For self-evolution, always use:

- `../agent-self-evolution/references/integration-contract.md`
- `../agent-self-evolution/references/generalization-ladder.md`
- `../agent-self-evolution/references/anti-overfit-guards.md`

Prefer `scripts/run_post_task_evolution.py` as the collaborator-local wrapper. It writes inbox records only. Do not use `../agent-self-evolution/scripts/record_insight.py`, `run_evolution_cycle.py`, or `register_release.py` during ordinary collaborator runs; those canonical-history and release tools are for maintainer merge/release work only.

This skill ships with central evolution memory, evolution log, version state, and release log under `references/`. Local unmerged learning lives in the sibling runtime inbox at `../evolution-inbox/<machine-username>.evolution-log.jsonl`; the contributor defaults to the local operating-system username. Do not mutate local skill behavior files just to preserve local learning. Keep local deltas in the inbox until they are merged into the central library or cleared after sync.

## Core Workflow

### 1. Route the request first

Use `references/request-router.md` to choose a primary route before planning output or edits.

State:

- primary route
- any secondary routes
- selected standards family
- why the routing is correct

### 2. Build the evidence inventory before writing or patching

Collect the relevant source of truth first:

- requirements, stories, PRD sections, acceptance criteria, bug reports, or risk statements
- UI routes, API contracts, schemas, fixtures, mobile builds, performance environments, or logs
- existing tests, runners, helpers, reports, traces, screenshots, videos, and prior failures

Unknowns must stay `Pending` or `Prohibited to Claim`. Do not invent hidden behavior, hidden fixtures, or unverified pass/fail status.

### 3. Apply the shared QA frame

Use `references/universal-qa-core.md` and `references/common-checklist.md` for every route.

The shared frame always covers:

- scope and risk
- actor, state, data, and environment boundaries
- deterministic oracle design
- execution evidence and observability
- failure ownership
- evidence discipline

### 4. Load the route pack or packs

After routing, load only the route-specific references listed in `references/route-registry.md`.

For mixed requests:

1. choose the primary route that owns the main deliverable
2. load the secondary route packs that change execution details
3. keep the output explicit about which claims come from which route pack

### 5. Execute with QA discipline

Preserve the local repo's style before adding new helpers or abstractions.

Use the smallest meaningful validation first, then broaden based on blast radius.

For testcase artifacts and testcase-audit requests, run `scripts/audit_test_artifact.py` as a structural preflight when the file format fits. Treat that script as triage only; it never replaces manual route-specific review.

### 6. Report in the correct contract

Use `references/output-template.md` and `references/evidence-discipline.md`.

Every substantial deliverable should make explicit:

- selected route and rule stack
- evidence labels for material conclusions
- failure ownership or automation-feasibility boundaries
- validation commands, artifacts, or the exact reason validation did not run
- residual risk and readiness

### 7. Run the post-task evolution gate every time

A completed work unit is not done until the post-task evolution closeout has run.

The unit of completion is each meaningful artifact or execution result, for example:

- one testcase artifact
- one automation patch
- one flaky-diagnosis report
- one performance plan or result set
- one audit report

Use `references/post-task-evolution.md` and `scripts/run_post_task_evolution.py` as the default path. If the gate cannot run, the final answer must state `Post-task evolution: blocked` and give the exact blocker. Otherwise report the closeout status and the collaborator inbox path.

## Route Defaults

Use these defaults unless the artifact clearly points elsewhere:

- testable points, risk inventory, coverage map, or traceability planning -> `testable-point-analysis`
- testcase design, testcase workbook repair, regression pack design, or execution-readiness review -> `testcase-artifact`
- Playwright, Selenium, CI, fixtures, helpers, framework structure, or automation implementation -> `automation-framework`
- browser UI automation logic, locators, waits, DOM assertions, and route-state checks -> `web-ui`
- API contract testing, schema validation, integration orchestration, or service-level checks -> `api`
- Appium, device lab, mobile state, install or permission flow, or app lifecycle checks -> `mobile`
- flaky reruns, nondeterministic assertions, timing leaks, data collisions, or retry analysis -> `flaky-repair`
- performance, load, stress, soak, capacity, baseline, or bottleneck work -> `performance-load`
- frontend TDD, component tests, test doubles, or red-green-refactor work -> `frontend-tdd`
- failure triage, execution summary, ownership calls, or release-readiness reporting -> `report-diagnosis`
- HTML report templates, report builders, report postchecks, or report audits -> `report-diagnosis`
- QA artifact audits, testcase criticism, or quality review of test deliverables -> `artifact-audit`
- genuinely blended asks with no single dominant deliverable -> `mixed`

For high-risk admin or backoffice systems, also load
`references/high-risk-admin-layering.md` and state the active delivery layer
(`L1`, `L2`, `L3`, `L4`, or `L5`) before claiming readiness or progress.
For credentialed website access, use the Bitwarden-style local prompt protocol
from that reference by default unless the user explicitly authorizes a different
project-approved credential provider.

If uncertain between two routes, pick the route that owns the primary deliverable and note the ambiguity explicitly.

## Evidence And Ownership Rule

Use the evidence labels from `references/evidence-discipline.md`:

- `Verified`
- `Inferred`
- `Pending`
- `Prohibited to Claim`

Evidence grade is separate from failure ownership. Keep ownership explicit:

- product defect
- script defect
- environment or data issue
- requirement gap
- confirmation needed
- mixed ownership

Never report a pass without run evidence. Never report a product defect or flaky-root-cause claim without separating script, environment, and data explanations as far as the available evidence allows.

## Deliverables

A complete QA task should usually produce:

- selected route, secondary routes if any, and standards family
- findings, design output, or implementation summary in QA review language
- explicit evidence grading on material claims
- validation command, artifact path, or blocked reason
- failure ownership or automation-feasibility call when relevant
- residual risk and release or handoff readiness
- post-task evolution closeout result
- collaborator inbox path, usually `../evolution-inbox/<machine-username>.evolution-log.jsonl`
