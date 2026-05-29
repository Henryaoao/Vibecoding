# Test Artifact Standards Pack

Use this pack when the artifact is a test plan, test case set, automation spec,
execution report, regression matrix, or mixed testing bundle.

Apply this pack in addition to `references/common-checklist.md`.

## 0. Internal Subtype Classification

Keep the top-level audit domain as `test-artifact`, then classify the artifact
into at least one internal subtype before judging readiness:

- `testcase-pack`: row-level or scenario-level cases intended to be executed
  independently
- `automation-spec`: automation mappings, runner logic, selector and oracle
  design, fixture rules, or side-effect controls
- `execution-report`: run output, readiness dashboard, merged summary, or
  execution-derived metrics
- `mixed-testing-bundle`: one file or folder combines multiple testing roles and
  must be audited section by section

If the artifact mixes subtypes, name the primary subtype and any secondary
subtypes explicitly. Do not let the strongest section hide a weaker contract in
another section.

## 0.1 Audit Execution Mode

State the audit execution mode and evidence strength before the conclusion:

- `independent-child-audit`: a separate reviewer or subagent completed the
  audit from the artifact and relevant evidence.
- `manager-fallback-audit`: the manager performed the hard-gate review because
  the independent reviewer timed out, errored, or was unavailable.
- `dry-run-audit`: the audit intentionally avoided writes or tool execution and
  is limited to the visible artifact evidence.
- `self-check`: the artifact author performed a local check; useful as
  preflight only and not equivalent to independent audit.

Timeouts, platform errors, or closed child agents are not independent passes.
If a fallback is used, record the failed audit mode, why fallback was necessary,
and which hard gates were still checked.

## 1. Coverage

Require:

- positive paths
- negative paths
- boundary paths
- state-dependent paths
- dependency failure paths
- subtype-specific claims are backed by the right companion material; testcase
  coverage, automation readiness, and execution evidence are related but not
  interchangeable

## 2. Minimum Executable Testcase Contract

For `testcase-pack` artifacts, every row that claims to be executable,
automatable, or ready for independent handoff should expose at least:

- `case_id`: stable, unique, meaningful identifier
- `source_trace`: requirement, rule, scenario, bug, risk, or route/API source
- `title`: behavior and risk target under test
- `priority` or `risk`: why the case matters
- `actor_context`: role, login state, locale, platform, mode, and starting
  state when they matter
- `preconditions`: account, data, flags, environment, and state setup
- `test_data`: exact values, fixtures, or data factory rules
- `steps`: ordered actions with the needed navigation, waits, and branching
- `expected_result`: observable oracle for each major action or final checkpoint
- `oracle_type`: DOM, API, database, file, event/log, metric, visual, or other
  explicit evidence layer
- `cleanup` or side-effect boundary: how the row resets state, or why it cannot
- `automation_status`: executable, automatable, manual-only, blocked, or
  confirmation-needed, with a row-level blocker reason when not executable

Missing any required contract field means the row is scaffolding, blocked, or
confirmation-needed rather than independently executable. Placeholder expected
results such as `pass`, `normal`, `same as requirement`, or `no error` fail the
contract.

## 3. Assertions And Selector/Oracle Integrity

Check:

- each test has a clear oracle
- assertions are observable
- success and failure are distinguishable
- dynamic values are not treated as constants
- the asserted evidence matches the case intent; route load, page health,
  control visibility, or generic UI stability cannot satisfy cases whose title,
  steps, or risk target require an action outcome, state transition, validation
  result, calculation, sorting, permission, session, export, or side-effect
  boundary
- every passed or executable classification is fail-closed: if a case family,
  action branch, selector, fixture, product rule, or oracle is missing, the
  case must be blocked or deferred instead of downgraded to a weaker smoke
  assertion
- when a UI case targets a specific interactive region, both the selector and
  the oracle must bind to that region and its expected affordance or state
  change; generic page text, summary panels, or visually similar sibling
  regions with the same label are insufficient
- if duplicated labels exist across regions, the artifact must resolve the
  intended control with region, control, or state evidence before the case can
  pass or be labeled ready
- automation-ready tables must not mix unresolved confirmation rows into the
  executable set; if a row depends on product rules, special data, unsafe final
  submission, security/session conditions, compatibility matrices, downloads,
  or unclear retain/reset behavior, it must carry an explicit confirmation or
  blocker reason until the missing oracle is supplied

## 4. Automation Spec Contract

For `automation-spec` artifacts, check:

- live route, page, API, or module binding is explicit for each case family or
  automation scope
- fixture ownership, account rules, data factory rules, and side-effect safety
  are explicit
- shared navigation or dialog-opening helpers assert only the stable shell
  needed to continue; case-specific fields, rules, and outcome checks stay in
  the per-case oracle or remain blocked
- every runnable family or action branch maps to an explicit case-level
  assertion path; unknown branches must block rather than pass from generic page
  health
- selector strategy prefers interaction-capable, case-intended controls over
  broad semantic text or incidental layout anchors
- unsafe final submission, downloads, exports, session or security behavior, or
  irreversible state changes remain blocked until the safety boundary and oracle
  are explicit
- credentialed admin runners perform non-secret preflight before user input:
  dependency entry point, browser/runtime launchability, secret-manager status,
  local prompt path, blocked artifact creation, and exclusion of trace, video,
  screenshot, storage state, cookies, tokens, headers, raw bodies, and
  secret-manager item JSON
- pass-producing automation maps only approved executable or automatable case
  IDs; blocked, confirmation-needed, skipped, and manual-only rows remain in the
  report denominator but cannot be counted as passed execution

## 5. Execution Report Contract

For `execution-report` artifacts, require:

- command, build or commit, environment, date or time, and executed subset, or
  an explicit statement that one of those inputs is missing
- mapping from reported scope units to stable identifiers such as case IDs,
  suite IDs, or artifact row IDs
- explicit evidence granularity labels separating suite-smoke coverage, generic
  interaction health checks, and case-specific asserted outcomes
- raw status vocabulary plus whether summary counters are mutually exclusive or
  subset/superset buckets
- pass rates and incomplete totals derived from raw rows or normalized buckets
  so blocked, warning, skipped, or legacy categories are not double-counted
- strongest artifact paths for major claims, such as report, trace, screenshot,
  video, log, or merged JSON output
- stale historical reports are labeled as historical; they cannot prove current
  classification logic or current live-route correctness unless regenerated
  after the reviewed code or artifact change
- module-scoped reports prove `current-run` or equivalent execution inputs
  belong to the active module and are not polluted by earlier module evidence
- `latest` report mirrors are labeled as convenience pointers; immutable
  evidence comes from versioned report and execution archives
- report denominators preserve blocked, confirmation-needed, skipped, and
  manual-only rows rather than hiding them from totals
- zero screenshots or missing visual artifacts state whether this is an
  intentional safety policy, an unsupported artifact type, or a gap
- secret scan status is current for the reviewed evidence and report artifacts,
  not only for an older run

## 6. Determinism

Check:

- tests are stable
- timing assumptions are explicit
- setup, teardown, and cleanup are controlled
- environment dependencies are called out
- live or sampled evidence is not treated as a permanent rule when the behavior
  depends on changing data, account state, permissions, dates, or business
  calculations
- one-row, empty-state, or current-snapshot evidence is enough for structure
  checks only; it is not enough to prove ordering, filtering, aggregation,
  pagination reset, or formula correctness unless the fixture and expected
  values are defined

## 7. Traceability And Mixed-Bundle Boundaries

Check:

- tests map back to requirements or risks
- gaps are visible
- high-risk areas are prioritized
- requirement chains such as document -> rule -> scenario -> evidence -> case
  preserve real gaps; do not synthesize missing mappings or upgrade pending
  evidence into executable coverage
- split artifacts preserve their classification boundary. If one file claims to
  contain executable cases and another file claims to contain confirmation
  cases, audit both files for misplaced rows and for clear row-level reasons
  explaining why deferred cases are not executable yet
- mixed-testing bundles keep testcase-pack, automation-spec, and
  execution-report sections explicitly separated enough that each claim can be
  audited against the correct contract
