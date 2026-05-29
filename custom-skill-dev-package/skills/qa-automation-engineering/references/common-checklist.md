# Common Checklist

Apply this checklist on every QA route.

## 1. Authenticity And Scope

- confirm the artifact, repo, route, API, build, or environment under discussion
- confirm the request boundary: design, implementation, diagnosis, audit, or mixed
- note missing source inputs explicitly

## 2. Coverage Model

- identify the risk target, not just the visible screen or endpoint
- cover happy path, negative path, boundary path, state transition, and integration edge where relevant
- make role, locale, browser, device, or tenant scope explicit when they matter

## 3. Data, State, And Fixture Discipline

- state the required setup and cleanup
- identify deterministic fixtures or data-factory rules
- reject hidden account state or manual tribal knowledge as an execution dependency

## 4. Oracle Quality

- require observable outcomes instead of generic success language
- tie assertions to business state, API payload, database/file output, semantic DOM state, event/log, or metric threshold
- fail closed when the expected result is too vague to execute independently

## 5. Observability And Debug Evidence

- capture the command, suite, case, report, trace, screenshot, log, or metric source behind a conclusion
- use `scripts/audit_test_artifact.py` as a structural preflight for supported testcase artifacts when helpful
- keep the helper-script verdict scoped to structural triage; manual review still owns final readiness

## 6. Failure Ownership

- classify the best-supported owner: product, script, environment/data, requirement, confirmation-needed, or mixed
- explain why competing ownership explanations were ruled in or out

## 7. Automation Boundary

- keep manual-only work explicit when human judgment, unstable visuals, hardware interaction, or missing observability prevents safe automation
- keep confirmation-needed work explicit when live evidence or source requirements are missing

## 8. Evidence Discipline

- label material claims as `Verified`, `Inferred`, `Pending`, or `Prohibited to Claim`
- never upgrade a weak clue into a strong verdict

## 9. Readiness Statement

- state release, execution, or handoff readiness directly
- state the exact residual risks and next verification target
