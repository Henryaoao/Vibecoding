# Release Log

## Current Version

- Version: 1.5.1
- Date: 2026-05-26
- Summary: Clarified that collaborator QA evolution uses inbox-only recording and canonical evolution tools are maintainer-only.

## Releases

### 1.5.1 - 2026-05-26

- Clarified that `scripts/run_post_task_evolution.py` is the collaborator-local wrapper and writes inbox records only.
- Marked `agent-self-evolution` canonical history and release tools as maintainer-only for QA skill merge/release work.
- Reinforced that ordinary collaborators must not write directly to QA canonical `evolution-memory.md` or `evolution-log.jsonl`.

### 1.5.0 - 2026-05-25

- Added runtime inbox overlay loading so local unmerged collaborator records can guide future QA runs without mutating the installed skill files.
- Changed post-task evolution recording to append collaborator records to the sibling `evolution-inbox/` instead of writing local canonical history during ordinary collaborator use.
- Added cross-project white-label governance for QA evolution submissions so project-specific identifiers stay out of shared inbox and canonical history.
- Updated install, submission, merge, and skill-standard docs to replace duplicate installed skills with the central version while preserving unmerged local inbox records.

### 1.4.3 - 2026-05-21

- Added a report-data freshness gate for testcase repair and report generation
  workflows.
- Required agents to verify repaired case IDs through the authoritative
  testcase source, generated approved-case JSON, normalized result data, and
  HTML archive when a refreshed report is requested.
- Clarified that Markdown testcase edits alone do not update reports, and that
  stale generated report-data layers must be named explicitly with the next
  refresh command.
- Added postcheck coverage for recent repair IDs so reports cannot silently keep
  old `confirmation-needed`, `manual-only`, or other status counts.

### 1.4.2 - 2026-05-21

- Added safe unknown-control exploration rules for admin/backoffice QA.
- Required bounded before/after observation for visible non-destructive
  counters, badges, tab indicators, compact icon buttons, pagination widgets,
  and header utilities before writing or auditing testcase rows.
- Clarified that safe controls should not be left `confirmation-needed` merely
  because their label is terse; agents must discover their behavior, infer rules
  only after enough observations, and convert the behavior into explicit
  testcase rows with safety boundaries.

### 1.4.1 - 2026-05-21

- Added layered UI discovery discipline for credentialed admin shells: after
  menu, tab, route, filter, or boundary probes, agents must inspect modal,
  dialog, drawer, popover, toast/status, tab strip, breadcrumb/header, URL, and
  main content before recording conclusions.
- Added admin tab-overflow verification rules: prove the open-tab count and
  order, capture the overflow confirmation wording, test Cancel preservation,
  and only Confirm safe front-end tab replacement when no business mutation is
  involved.
- Clarified that URL/main-content changes behind a blocking modal are not enough
  evidence to claim prompt absence or final state.

### 1.4.0 - 2026-05-18

- Recorded the 2026-05-18 HTML report template generalization in
  `evolution-memory.md` and `evolution-log.jsonl`.
- Added `scripts/check_evolution_release_sync.py` to verify that the current
  `version-state.json` release date has a matching governance/evolution log
  entry.
- Added the release-sync check to the post-task evolution governance path so
  release or version updates cannot be considered handoff-ready without the
  evolution ledger.

### 1.3.0 - 2026-05-18

- Added `references/html-report-template-capability.md` for generating,
  repairing, auditing, and handing off case-level HTML QA reports.
- Added rules to load project-provided or discovered local report templates
  before changing report builders or report output.
- Standardized report expectations for approved denominators, status buckets,
  required pages, navigation, charts, case anchors, screenshot safety, postcheck,
  secret scan, versioned archives, and latest mirrors.
- Connected the report template capability to `report-diagnosis`,
  `automation-framework`, and mixed route work.

### 1.2.0 - 2026-05-18

- Made Bitwarden-style local prompts the default credential protocol for
  website/admin QA access.
- Prohibited chat-provided passwords, one-time codes, cookies, tokens,
  Authorization headers, storageState, checked-in auth files, browser profile
  scraping, and raw secret exports unless the user explicitly authorizes a
  project-specific alternative.
- Added credentialed web discovery gates before module decomposition: no-secret
  preflight, local unlock/item/code prompts, controlled browser process,
  redacted menu/route/control/network metadata, blocked discovery artifacts, and
  secret scan.
- Updated the skill metadata and UI prompt so credentialed website analysis
  triggers the QA skill directly.

### 1.1.0 - 2026-05-18

- Added `references/high-risk-admin-layering.md` for L1/L2/L3/L4/L5 coverage
  boundaries in credentialed admin, CRM, finance, wallet, approval, reporting,
  permission, and backoffice systems.
- Added credentialed runner preflight rules covering local secret prompts,
  two-factor stage diagnostics, blocked artifacts, browser/runtime readiness,
  and sensitive artifact exclusions.
- Added approved-case denominator and current-run hygiene rules so only
  automatable rows become pass-producing tests while blocked and
  confirmation-needed rows stay visible in reports.
- Added manager progress reporting expectations for module-by-module work.

### 1.0.0 - 2026-05-12

- Added shared QA governance files for routing, common checks, standards targets, evidence discipline, output contracts, post-task evolution, and versioning.
- Added dedicated route references for API and integration testing, mobile testing, and execution reporting and diagnosis.
- Tightened the helper audit script so structural testcase triage is explicitly scoped and aligned with oracle-type expectations.
- Rewrote `SKILL.md` around route-first execution, evidence grading, mixed-request handling, and mandatory post-task evolution closeout.
