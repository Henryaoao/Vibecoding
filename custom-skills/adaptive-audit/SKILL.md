---
name: adaptive-audit
description: Universal audit agent for requirement documents, PRDs, code-review artifacts, test artifacts, research deliverables, workflows, skill release/shareability packages, and similar materials. Use when Codex needs to audit an artifact, choose the correct domain standards pack, report gaps with evidence discipline, verify skill release governance, and evolve only the relevant domain standards after the audit.
---

# Adaptive Audit

## Overview

Use this skill as a generic audit agent with domain-specific standards packs.

The core model is:

- one reusable audit brain
- one shared common-check rules layer
- multiple domain standards families
- domain-aware self-evolution after each meaningful audit
- mandatory post-audit evolution closeout before the audit is considered complete

This skill should not treat every audit as a PRD audit. It must first decide what kind of artifact it is reviewing, then load the correct standards pack, then keep any new learning inside that standards family unless the learning clearly generalizes across domains.

Start every run by reading:

- `references/universal-audit-core.md`
- `references/common-checklist.md`
- `references/domain-router.md`
- `references/domain-registry.md`
- `references/standards-targets.md`
- `references/evidence-discipline.md`
- `references/output-template.md`
- `references/post-audit-evolution.md`

Then check the local runtime inbox overlay:

- `../evolution-inbox/<machine-username>.evolution-log.jsonl`

If the file exists, load only records where `skill` is `adaptive-audit` and `merge_status` is `pending` or missing. Treat those records as provisional local guidance for this collaborator's unmerged learning. If the file is missing or empty, continue with only this installed skill and its packaged evolution history.

When auditing or sharing this skill package itself, also read:

- `references/install-handoff.md`

Then load the correct domain file under `references/domains/`.
For `test-artifact`, keep that top-level domain and classify the internal
subtype inside the domain pack, such as `testcase-pack`, `automation-spec`,
`execution-report`, or `mixed-testing-bundle`, before judging readiness.

For self-evolution, always use:

- `../agent-self-evolution/references/integration-contract.md`
- `../agent-self-evolution/references/generalization-ladder.md`
- `../agent-self-evolution/references/anti-overfit-guards.md`

Use `scripts/run_post_audit_evolution.py` for collaborator-local post-audit closeout. It writes inbox records only. Do not use `../agent-self-evolution/scripts/run_evolution_cycle.py` or `record_insight.py` during ordinary collaborator runs; those canonical-history tools are for maintainer merge/release work only and require `--allow-canonical-write`.

If `agent-self-evolution` is not installed as a sibling skill, use
`references/install-handoff.md` and pass `--evolution-skill-dir` to
`scripts/run_post_audit_evolution.py`, or stop with a clear missing-dependency
preflight failure.

This skill ships central evolution memory, release log, and version state. Collaborator-local audit learning must be written to the sibling runtime inbox at `../evolution-inbox/<machine-username>.evolution-log.jsonl`. Maintainers consolidate selected inbox records into this skill's canonical evolution files during central merge/release work.

## Core Workflow

### 1. Identify the artifact domain

Use `references/domain-router.md` to classify the audit target into one of:

- `prd`
- `code-review`
- `test-artifact`
- `research`
- `workflow`
- `skill-release`
- `generic`

Do not start from assumptions. Route first.

### 2. Apply the universal audit frame

Use `references/universal-audit-core.md` and `references/common-checklist.md` for the cross-domain frame.

Every audit must apply:

- the common audit rules
- the correct domain standards pack

The common layer is always mandatory. The domain layer is additive.

The shared frame covers:

- artifact authenticity
- scope and boundary
- logic and behavior
- validation and edge cases
- state, dependency, and failure handling
- observability and testability
- evidence discipline

### 3. Apply the correct standards family

After routing, load only the matching domain pack in `references/domains/`.

The domain pack defines:

- domain-specific audit goals
- domain-specific checks
- high-risk omissions
- what “ready” looks like for that domain
- for `test-artifact`, the required internal subtype contract without creating a
  new top-level domain

### 4. Write findings in the correct voice

Audit in direct review language. Do not write coaching text about how someone should write the document. State:

- what is missing
- why it matters
- whether it is verified, inferred, or pending
- what standard it violates

### 5. Keep evolution domain-aware

After every meaningful audit, decide whether a reusable learning signal exists.

If it does:

1. identify the domain standards family that should change
2. convert the case into a generalized principle
3. run anti-overfit checks
4. record the learning with the correct `domain_key` and `standard_family`

Default to domain-specific evolution. Only promote to cross-domain standards when the principle survives abstraction across multiple domains.

When a principle is genuinely cross-domain, promote it into the common rules layer so all future audits inherit it before the domain pack is applied.

### 6. Run the post-audit evolution closeout every time

A completed artifact audit is not finished until the post-audit evolution gate has run.

The unit of completion is each audited artifact, not the whole conversation.

If one user request audits multiple files or artifacts in sequence, the workflow must be:

1. audit artifact A
2. run post-audit evolution closeout for artifact A
3. audit artifact B
4. run post-audit evolution closeout for artifact B
5. continue per artifact

A final batch-level summary evolution pass is optional, but it never replaces the per-artifact closeout.

That closeout must answer:

- was there reusable learning
- does it belong in the selected domain pack, the common layer, or both
- did the audit expose a weakness in the evolution process itself
- was the learning recorded as log, candidate, promote, or release, intentionally
  deferred, or concluded as `no change`

Use `references/post-audit-evolution.md` and `scripts/run_post_audit_evolution.py` as the default execution path.

If the audit exposed a weakness in the self-evolution process itself, also run the `agent-self-evolution` loop against its own skill so the meta-layer can improve too.

## Domain Routing Rule

Use these defaults:

- requirement or product spec -> `prd`
- code review, patch review, implementation review -> `code-review`
- test plan, test case set, automation suite spec, execution report, or mixed
  testing bundle -> `test-artifact`
- research memo, analysis, recommendations, market or technical brief -> `research`
- SOP, operational flow, approval flow, handoff or process document -> `workflow`
- Codex skill, skill bundle, `SKILL.md`, skill release, skill sharing, local
  skill install package, skill evolution governance, or skill hardening review
  -> `skill-release`
- unknown mixed artifact -> `generic`

## Evolution Rule

When using `agent-self-evolution`, pass:

- `--domain-key` as the selected domain
- `--standard-family` as defined in `references/domain-registry.md`
- `--standard-area` as the local category if one is clear

Use `references/standards-targets.md` to identify which standards file should eventually absorb the promoted learning.

Do not let a PRD-specific lesson change code-review standards. Do not let a code-review lesson change research standards. Use `generic` or cross-domain evolution only when the principle is truly reusable across domains.

If a principle is reusable across domains, target the common rules files first. Every future audit should then run with:

- common rules
- selected domain rules

If the reusable learning changes `adaptive-audit` itself, collaborator-local runs still write only inbox records. During central maintainer merge/release, keep canonical governance updated:

- `references/evolution-memory.md`
- `references/evolution-log.jsonl`
- `references/version-state.json`
- `references/release-log.md`

## Deliverables

A complete audit should usually produce:

- selected domain
- selected `test-artifact` subtype when that domain is used
- audit conclusion
- prioritized findings
- violated or missing standards
- explicit evidence grading
- evidence paths behind major claims
- recommended patch or correction direction
- domain-aware evolution conclusion
- post-audit evolution closeout result

For higher-risk audits, also produce:

- a coverage map by domain standard area
- explicit unresolved questions
- execution or report evidence granularity when readiness claims depend on it
- a release-readiness or handoff-readiness statement
