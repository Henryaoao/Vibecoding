# Domain Router

Route the audit before loading a standards pack.

## 1. PRD

Choose `prd` when the artifact defines:

- product behavior
- business rules
- pages, flows, or modules
- acceptance conditions
- automation-ready specifications

## 2. Code Review

Choose `code-review` when the artifact is:

- a patch
- an implementation diff
- a merge request
- a code review summary
- a behavior or regression review request

## 3. Test Artifact

Choose `test-artifact` when the artifact is:

- a test case set
- automation spec
- execution report
- QA scenario sheet
- regression pack
- validation matrix
- mixed testing bundle

After selecting `test-artifact`, classify the internal subtype as
`testcase-pack`, `automation-spec`, `execution-report`, or
`mixed-testing-bundle`. Keep the top-level domain unchanged.

## 4. Research

Choose `research` when the artifact is:

- a memo
- analysis
- recommendation set
- comparative evaluation
- decision brief

## 5. Workflow

Choose `workflow` when the artifact defines:

- approvals
- handoffs
- SOPs
- operational processes
- roles and process gates

## 6. Skill Release

Choose `skill-release` when the artifact is:

- a Codex skill folder or bundled skill package
- a `SKILL.md` plus references, scripts, agents metadata, or assets
- a skill release, version, install, or shareability review
- a skill self-evolution or governance package
- a request to harden a skill before sharing it with other users

This domain audits whether the skill is portable, triggerable, governed,
validated, and free of accidental project or machine dependencies.

## 7. Generic

Choose `generic` when:

- the artifact is mixed
- the domain is unclear
- the specialized standards are not mature yet

If uncertain between two domains, pick the primary artifact purpose and note the ambiguity explicitly.
