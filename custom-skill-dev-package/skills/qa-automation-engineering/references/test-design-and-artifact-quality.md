# Test Design And Artifact Quality

## Intake

Before creating or auditing tests, identify:

- Product surface: page, API, job, data pipeline, mobile flow, admin workflow, or integration.
- Requirement source: PRD ID, acceptance criterion, user story, defect, risk, regulation, or production incident.
- User and permission model: actor, role, tenant, locale, device, browser, and data visibility.
- State model: new, draft, submitted, approved, rejected, cancelled, expired, deleted, retried, or archived.
- Data model: valid data, invalid data, boundary data, missing data, duplicate data, stale data, and cross-tenant data.
- Oracle: UI state, API payload, database record, file content, event/log, notification, metric, or error message.

## Design Methods

Use multiple methods when risk justifies it:

- Equivalence partitioning: one representative from each valid and invalid class.
- Boundary value analysis: min, max, just below, just above, empty, null, and precision/rounding limits.
- Decision table: combinations of business rules, permissions, statuses, and feature flags.
- State transition: allowed, disallowed, repeated, skipped, rollback, timeout, and recovery transitions.
- Pairwise or combinatorial coverage: browser/device/locale/role/payment/state combinations where exhaustive testing is too expensive.
- Graph or flow coverage: critical paths, alternate paths, error paths, and loops.
- Data-flow thinking: create, read, update, delete, import, export, cache, sync, and downstream consumption.
- Regression selection: map changed code or requirement to impacted flows, then add a risk-based smoke layer.
- Safe exploratory modeling: for visible non-destructive UI elements whose
  meaning is unknown, such as counters, badges, tab indicators, compact icon
  buttons, pagination widgets, and header utilities, first run a bounded
  before/after observation to discover the behavior and rule. Do not mark these
  cases `confirmation-needed` merely because the label is unclear.

## Minimum Testcase Schema

Require these fields for executable cases:

- `case_id`: stable, unique, meaningful ID.
- `source_trace`: requirement, PRD, bug, risk, or route/API source.
- `title`: behavior under test, not just a menu name.
- `priority` or `risk`: business or technical risk ranking.
- `preconditions`: account, data, feature flag, environment, and previous state.
- `test_data`: exact values or data factory rules.
- `steps`: ordered user or system actions.
- `expected_result`: observable result after each major action or at the final checkpoint.
- `cleanup`: how data/session/files are reset.
- `automation_status`: automated, automatable, manual-only, blocked, or confirmation-needed.
- `oracle_type`: DOM, API, database, file, event/log, notification, metric, visual, accessibility, or human judgment.

## Red Flags

Block or repair artifacts with:

- Template rows that differ only by title.
- Expected results that only say pass, success, normal, no error, displayed correctly, or same as requirement.
- Missing data setup or account role.
- Steps that require unstated navigation, hidden fixtures, or prior manual knowledge.
- No requirement trace or unclear feature ownership.
- Case IDs that duplicate, drift, or encode the wrong module.
- Mixed automation and manual checks in one case without clear boundaries.
- Assertions tied to incidental text, CSS, or current layout instead of user-visible semantics and business state.
- Performance cases without workload, metric, baseline, threshold, environment, and monitoring definition.

## Audit Verdicts

Use strict verdicts:

- `pass`: executable by another tester or agent with no hidden knowledge.
- `pass_with_warnings`: minor clarity issues, but no material execution or oracle gap.
- `fail`: missing traceability, setup, steps, data, oracle, or material coverage.
- `blocked`: source requirement or environment evidence is unavailable.

When failing an artifact, include row IDs, the exact missing contract, and the minimal repair expected.

## Layered High-Risk Admin Artifacts

For admin, finance, CRM, approval, wallet, reporting, permission, or other
backoffice systems, require the artifact to declare its active coverage layer:

- `L1 safe baseline`
- `L2 page and functional-area baseline`
- `L3 module business rules`
- `L4 cross-module flow`
- `L5 regression and monitoring`

Do not let L1 or L2 rows imply L3/L4 business correctness. Route shells,
control visibility, table headers, page health, or method/path/status metadata
are valid low-risk oracles only for the corresponding low-risk case. They cannot
prove row data, formulas, permissions, approval state, exports, writes, or
cross-module outcomes.

Rows that need product rules, safe fixtures, field whitelists, role matrices,
rollback, download/export approval, or screenshot redaction must remain
`confirmation-needed` or `blocked` with a row-level reason.

For safe unknown controls, a good testcase artifact records both the discovered
meaning and the evidence path. Example shape: initial state, safe action,
observed state change, inferred rule, second observation when needed, expected
behavior, and safety boundary. A vague case such as "counter displays correctly"
is not acceptable unless it states what the counter counts and how the rule was
observed.
