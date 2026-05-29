# Evolution Memory

Use this as the human-readable memory for accepted or candidate generalized lessons.

## Promoted Principles

### Template

- Date:
- Target artifact:
- Principle key:
- Principle:
- Why promoted:
- Evidence sources:

## Candidate Principles

### Template

- Date:
- Target artifact:
- Principle key:
- Principle:
- Why it matters:
- Evidence sources:
- Status: candidate

## Review Notes

### Template

- Date:
- Source task:
- Target artifact:
- Summary:
- Failure mode:
- Principle:
- Action:

- Date: 2026-04-29
- Source task: high-risk-prd-batch-audit-2026-04-29
- Target artifact: adaptive-audit/references/domains/prd.md
- Target type: checklist
- Domain key: prd
- Standard family: requirements-quality
- Standard area: state-model
- Task class: substantial
- Task type: audit
- Loop: both
- Meta focus: domain standards maturity
- Pattern key: executable-prd-core-branch-completeness
- Principle key: high-risk-prd-branches-must-be-executable
- Principle: High-risk PRDs must define executable success, failure, and approval-state outcomes for core branches instead of deferring them as pending interfaces.
- Abstraction level: principle
- Summary: Executable PRDs for high-risk flows cannot leave core success branches, failure mapping, or approval-state outcomes as pending or out-of-scope.
- Recommended action: Track as a PRD-domain candidate and strengthen the PRD standards pack if the pattern repeats.
- Status: candidate

- Date: 2026-04-29
- Source task: host-skill-self-evolution-governance-audit-2026-04-29
- Target artifact: agent-self-evolution/references/integration-contract.md
- Target type: governance
- Domain key: generic
- Standard family: cross-domain-quality
- Standard area: observability
- Task class: substantial
- Task type: audit
- Loop: both
- Meta focus: host-skill integration governance
- Impact: high
- Confidence: high
- Failure mode: host skill promises self-evolution but lacks a real execution path and approved recording path
- Pattern key: host-skills-need-real-evolution-path
- Principle key: host-skills-need-real-evolution-governance
- Principle: A reusable skill cannot claim mandatory self-evolution unless it has a concrete wrapper or execution path, an approved inbox or canonical recording path, and version governance when the skill itself is expected to change.
- Abstraction level: rule
- Summary: A reusable skill cannot claim mandatory self-evolution unless it has a concrete wrapper or execution path, an approved inbox or canonical recording path, and version governance when the skill itself is expected to change.
- Recommended action: Promote this as a host-skill integration rule and strengthen Loop 2 checks for wrapper, recording path, and version governance.
- Status: promoted

- Date: 2026-05-09
- Source task: strict-test-oracle-status-normalization-audit
- Target artifact: test-artifact audit workflow / merge reports
- Target type: workflow
- Domain key: test-artifact
- Standard family: assertions
- Standard area: status-ontology
- Task class: substantial
- Task type: automation-audit
- Loop: both
- Category: candidate-checklist-rule
- Impact: high
- Confidence: medium
- Failure mode: Downstream reports recomputed strict counts but merge still emitted legacy ambiguous statuses.
- Pattern key: normalize-at-aggregation-boundary
- Principle key: status-ontology-source-normalization
- Principle: When eliminating ambiguous test statuses, normalize at the earliest aggregation boundary and verify every downstream artifact has no legacy status vocabulary.
- Abstraction level: principle
- Summary: A strict case-by-case test audit must validate status ontology at source, merge, report, and user-fillable artifacts; fixing only final reports leaves old ambiguous states reusable.
- Recommended action: Track as candidate checklist item for future test-artifact audits; require no legacy ambiguous status strings across raw rows, merged summaries, reports, and fillable oracle workbooks.
- Status: candidate


- Date: 2026-05-25
- Source task: cross-project-skill-evolution-white-label-governance
- Target artifact: agent-self-evolution/references/anti-overfit-guards.md + agent-self-evolution/references/integration-contract.md
- Target type: governance
- Domain key: generic
- Standard family: cross-domain-quality
- Standard area: shareability-governance
- Task class: substantial
- Task type: skill-governance-upgrade
- Loop: both
- Meta focus: cross-project-evolution-white-labeling
- Category: shareability
- Impact: high
- Confidence: high
- Failure mode: cross-project skill evolution history can leak source-project identifiers or overfit to one project
- Pattern key: cross-project-evolution-white-labeling
- Principle key: cross-project-skill-evolution-must-be-white-labeled
- Principle: Shared cross-project skills must convert task-specific incidents into project-neutral category labels before recording or promoting evolution history.
- Abstraction level: rule
- Summary: Cross-project skills must white-label evolution records before logging, review, promotion, release notes, or human-readable memory so reusable skill history does not leak project-specific identifiers.
- Recommended action: released 1.5.0 with white-label evolution rules and approved inbox/canonical recording guidance
- Status: released


- Date: 2026-05-26
- Source task: collaborator-evolution-inbox-only-canonical-write-guard
- Target artifact: agent-self-evolution/scripts/record_insight.py + agent-self-evolution/scripts/run_evolution_cycle.py + agent-self-evolution/references/integration-contract.md
- Target type: governance
- Domain key: generic
- Standard family: cross-domain-quality
- Standard area: canonical-history-governance
- Task class: substantial
- Task type: skill-governance-upgrade
- Loop: both
- Meta focus: collaborator-inbox-only-recording
- Category: release-governance
- Impact: high
- Confidence: high
- Failure mode: collaborator-local runs can bypass maintainer consolidation by writing canonical skill logs directly
- Pattern key: canonical-evolution-write-guard
- Principle key: collaborator-evolution-records-enter-inbox-only
- Principle: Shared skill collaborator evolution must enter through inbox records only; canonical history changes require maintainer merge/release approval.
- Abstraction level: rule
- Summary: Collaborator-local evolution must write only inbox records; canonical evolution-memory and evolution-log writes are now blocked unless a maintainer explicitly passes --allow-canonical-write.
- Recommended action: released 1.5.1 with maintainer-only canonical write guard and inbox-only collaborator guidance
- Status: released
