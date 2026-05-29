# Standards Targets

Use this map when a promoted learning should update the QA skill directly.

## Route -> Primary Standards File

- `testable-point-analysis` -> `references/test-design-and-artifact-quality.md`
- `testcase-artifact` -> `references/test-design-and-artifact-quality.md`
- `automation-framework` -> `references/automation-framework-and-web.md`
- `web-ui` -> `references/automation-framework-and-web.md`
- `api` -> `references/api-and-integration-testing.md`
- `mobile` -> `references/mobile-testing.md`
- `flaky-repair` -> `references/automation-framework-and-web.md`
- `performance-load` -> `references/performance-engineering.md`
- `frontend-tdd` -> `references/frontend-tdd.md`
- `report-diagnosis` -> `references/reporting-and-diagnosis.md`
- `artifact-audit` -> `references/test-design-and-artifact-quality.md`
- `mixed` -> `references/route-registry.md`

## Cross-Route Rule

If a principle generalizes across multiple QA routes, prefer updating:

- `references/universal-qa-core.md`
- `references/common-checklist.md`
- `references/request-router.md`
- `references/evidence-discipline.md`
- `references/output-template.md`
- `references/post-task-evolution.md`

Use `references/common-checklist.md` when the principle should become a mandatory shared QA check.

Use `references/universal-qa-core.md` when the principle changes the general reasoning model rather than one checklist item.

Do not duplicate one principle into every route file unless the route expression genuinely differs.
