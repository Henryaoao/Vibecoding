# Universal Audit Core

Use this as the cross-domain audit reasoning frame before applying any domain pack.

Read `references/common-checklist.md` alongside this file. The checklist is the mandatory shared rule layer. This file explains the broader audit model behind it.

## 1. Artifact Authenticity

Check:

- is the artifact actually what it claims to be
- is it a real specification, review, test artifact, research note, or workflow
- is it mixing meta-guidance with actual content

## 2. Scope and Boundary

Check:

- what is in scope
- what is out of scope
- which user, system, or team it applies to
- what abstraction level it is operating at
- if it is a parent artifact, how it traces and governs subordinate artifacts

## 3. Logic and Behavior

Check:

- the main behavior or claim
- triggers and actions
- expected outcomes
- failure paths
- what is observable

## 4. Validation and Edge Cases

Check:

- happy path
- negative path
- boundary path
- dependent or chained conditions
- silent failure risk
- whether a single negative path emits multiple layered signals that must be recorded separately instead of collapsed into one observation

## 5. State, Dependencies, and Failure Handling

Check:

- state transitions
- approvals or gates
- external dependencies
- retries, rollback, or recovery
- missing ownership or handoff definitions

## 6. Observability and Testability

Check:

- what can be asserted
- what can be measured
- whether the output is reviewable
- whether automation or verification hooks are defined
- whether the observable stack is complete for important failures, including local validation, global feedback, network behavior, and backend result when relevant
- whether execution-context setup is explicit when downstream verification depends on role, language, platform, mode, or environment

## 8. Audit-to-Evolution Closeout

Check:

- whether the audit explicitly concluded `no change`, `log only`, `candidate`, or `promote`
- whether the selected standards layer is correct: common, domain-specific, or both
- whether a weakness in the evolution process itself was detected and routed to the self-evolution layer
- whether the reusable learning was actually recorded instead of remaining only in the audit narrative

## 7. Evidence Discipline

Every conclusion should be one of:

- verified
- inferred
- pending
- prohibited to claim
