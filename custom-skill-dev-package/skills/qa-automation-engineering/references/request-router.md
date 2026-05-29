# Request Router

Route the QA request before loading route-specific references.

## 1. Testable Point Analysis

Choose `testable-point-analysis` when the user needs:

- a testable-point inventory
- a risk or coverage map
- scenario decomposition
- role, state, or data matrices

## 2. Testcase Artifact

Choose `testcase-artifact` when the user needs:

- testcase design
- testcase pack repair
- regression workbook construction
- traceability matrix work
- execution-readiness shaping for testcase artifacts

## 3. Automation Framework

Choose `automation-framework` when the user needs:

- automation implementation
- framework repair
- fixture or helper design
- CI wiring
- suite maintainability work

## 4. Web UI

Choose `web-ui` when the main surface is:

- browser UI automation
- locator strategy
- DOM-state assertions
- waits, navigation, route-state, or browser reporting

## 5. API

Choose `api` when the main surface is:

- API contract testing
- request or response validation
- service integration checks
- auth, idempotency, pagination, webhook, or schema work

## 6. Mobile

Choose `mobile` when the main surface is:

- mobile app automation
- Appium work
- device or OS-state behavior
- app lifecycle, permission, install, or background-foreground flows

## 7. Flaky Repair

Choose `flaky-repair` when the request is primarily about:

- nondeterministic failures
- retries
- timing issues
- cross-test state leaks
- environment-sensitive instability

## 8. Performance Load

Choose `performance-load` when the user needs:

- performance or load strategy
- workload modeling
- baseline, threshold, or bottleneck analysis
- stress, soak, or capacity planning

## 9. Frontend TDD

Choose `frontend-tdd` when the request is primarily about:

- red-green-refactor flow
- component tests
- test doubles
- frontend-unit or component-level design

## 10. Report Diagnosis

Choose `report-diagnosis` when the main deliverable is:

- an execution report
- failure triage summary
- script-vs-product ownership analysis
- release or handoff readiness reporting

## 11. Artifact Audit

Choose `artifact-audit` when the user wants:

- a hard-nosed QA artifact review
- testcase criticism
- audit findings with evidence
- coverage or determinism gap analysis

## 12. Mixed

Choose `mixed` only when multiple routes are equally first-class and no single route clearly owns the main deliverable.

If one route is primary and others only modify execution details, keep the primary route explicit and treat the rest as secondary routes instead of defaulting to `mixed`.

If uncertain between two routes, choose the primary deliverable owner and note the ambiguity.
