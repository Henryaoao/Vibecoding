# Universal QA Core

Use this file on every QA route.

## Shared Operating Model

Treat QA as risk-based engineering, not as a tool demo.

Start from:

- business or user risk
- actor, role, and permission model
- state transitions
- data lifecycle
- observable oracle

Choose UI automation, API automation, component tests, mobile tests, manual checks, or performance work only after the risk model is clear.

## Required Separations

Keep these concerns separate in every meaningful deliverable:

1. test design: what risk or requirement is covered
2. automation design: how the check becomes repeatable and maintainable
3. execution evidence: what actually ran, where, with what data, and what artifacts exist
4. failure ownership: product defect, script defect, environment or data issue, requirement gap, or confirmation needed

## Work Unit Rule

Treat each completed artifact or execution result as its own work unit.

Examples:

- a testcase sheet or markdown pack
- a Playwright or Appium patch
- a flaky triage result
- a performance plan or report
- a QA audit

Do not collapse multiple completed work units into one implied closeout.

## Source Inventory

Before designing, patching, or auditing, gather the applicable sources:

- requirement text, PRD, bug, incident, or acceptance criterion
- code, selectors, contracts, schemas, fixtures, datasets, or build version
- current tests, helpers, runners, and reports
- logs, traces, screenshots, videos, network captures, or metrics

Missing source evidence is itself a QA finding when it blocks safe judgment.

## Validation Scaling

Run the smallest meaningful validation first, then broaden based on blast radius.

Prefer:

- a representative targeted test before a full suite
- a structural testcase preflight before a full manual audit
- a precise reproduction step before a broad flaky classification

## Claim Discipline

Only claim what the evidence supports.

Do not say:

- the product is broken when only the script is suspect
- the script is wrong when the environment or data is unstable
- the case is executable when setup, oracle, or cleanup is hidden
- the performance result is meaningful when workload, environment, or thresholds are undefined
