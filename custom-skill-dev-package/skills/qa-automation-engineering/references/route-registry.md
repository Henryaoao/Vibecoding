# Route Registry

Use this registry to map QA routes to standards families, standard areas, and reference packs.

## Route Keys

- `testable-point-analysis` -> `test-quality`
- `testcase-artifact` -> `test-quality`
- `automation-framework` -> `automation-quality`
- `web-ui` -> `automation-quality`
- `api` -> `automation-quality`
- `mobile` -> `automation-quality`
- `flaky-repair` -> `automation-quality`
- `performance-load` -> `performance-quality`
- `frontend-tdd` -> `frontend-test-quality`
- `report-diagnosis` -> `execution-analysis-quality`
- `artifact-audit` -> `test-quality`
- `mixed` -> `cross-route-quality`

## Standard Areas

### Test Quality

- coverage
- boundary-cases
- traceability
- determinism
- data-isolation
- execution-readiness

### Automation Quality

- architecture
- selectors
- synchronization
- fixture-control
- observability
- failure-classification

### Performance Quality

- workload-model
- thresholds
- monitoring
- environment-control
- bottleneck-analysis

### Frontend Test Quality

- test-level-selection
- component-oracles
- doubles-and-fakes
- refactor-safety

### Execution Analysis Quality

- evidence-paths
- failure-ownership
- residual-risk
- release-readiness

### Cross-Route Quality

- routing
- sequencing
- boundary-management
- evidence-integrity

## Route Packs

### Testable Point Analysis

- load `references/test-design-and-artifact-quality.md`
- add `references/source-reading-synthesis.md` when methodology provenance or official-doc exactness matters

### Testcase Artifact

- load `references/test-design-and-artifact-quality.md`
- add `references/reporting-and-diagnosis.md` when the deliverable includes audit or readiness conclusions
- add `references/high-risk-admin-layering.md` for credentialed admin, finance,
  approval, reporting, wallet, permission, or other side-effect-sensitive
  backoffice systems

### Automation Framework

- load `references/automation-framework-and-web.md`
- add `references/high-risk-admin-layering.md` when credentials, sensitive
  evidence, mutation/export/download risk, approved-case denominators, or
  module-by-module manager reporting affect execution
- add `references/html-report-template-capability.md` when the automation task
  includes report builders, normalized result mapping, screenshots, postchecks,
  or HTML report generation

### Web UI

- load `references/automation-framework-and-web.md`
- add `references/high-risk-admin-layering.md` for authenticated admin/backoffice
  UI work

### API

- load `references/api-and-integration-testing.md`

### Mobile

- load `references/mobile-testing.md`
- add `references/automation-framework-and-web.md` when shared fixture, runner, or flake controls matter

### Flaky Repair

- load `references/automation-framework-and-web.md`
- load `references/reporting-and-diagnosis.md`

### Performance Load

- load `references/performance-engineering.md`

### Frontend TDD

- load `references/frontend-tdd.md`

### Report Diagnosis

- load `references/reporting-and-diagnosis.md`
- add `references/high-risk-admin-layering.md` when reporting progress or
  readiness for layered admin/backoffice coverage
- add `references/html-report-template-capability.md` when generating, repairing,
  auditing, or handing off HTML reports

### Artifact Audit

- load `references/test-design-and-artifact-quality.md`
- load `references/reporting-and-diagnosis.md`
- add `references/high-risk-admin-layering.md` when judging testcase or
  automation readiness for high-risk backoffice systems

### Mixed

- load the primary route pack first
- then load the secondary route packs that materially affect the output
- use `references/reporting-and-diagnosis.md` when the mixed output includes readiness or ownership calls
- use `references/html-report-template-capability.md` when the mixed output
  includes a human-facing HTML report or report template
