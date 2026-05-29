---
name: agent-self-evolution
description: Meta-skill for any agent to run a post-task evolution loop, extract generalized reusable lessons, decide whether its own rules, prompts, skills, scripts, or workflows should change, and propose safe upgrades without overfitting to one case. Use after substantial tasks, recurring failures, new domains, surprising edge cases, or whenever an agent should improve from experience in a controlled, reviewable way.
---

# Agent Self Evolution

## Overview

Use this skill as a generic post-task evolution layer for any agent. It is not tied to PRDs, coding, research, or operations. It exists to help an agent learn safely from work it has already done and decide whether:

- nothing should change
- a local runtime inbox record should guide future local runs
- a domain skill should evolve
- a checklist, script, template, or workflow should evolve
- the evolution process itself needs stronger guardrails

When the agent works across multiple domains, keep evolution domain-aware. A PRD lesson should normally evolve PRD standards. A code-review lesson should normally evolve code-review standards. Only promote a lesson into a cross-domain rule when it survives abstraction across domains.

Any agent that carries this skill must run a post-task evolution gate after every completed task. The gate may conclude `no change` for trivial or purely local work, but the check itself is mandatory for all non-abandoned tasks.

If one conversation contains multiple independently completed artifacts, files, or audit units, each completed unit gets its own post-task gate. A conversation-level wrap-up may happen afterward, but it does not replace unit-level evolution.

If a host agent or host skill claims mandatory self-evolution, this skill must also verify that the claim has a real execution path, governance, and a concrete recording mechanism. In this shared custom-skill library, collaborator-local learning should be recorded in the sibling `evolution-inbox/` and used as runtime overlay guidance; central skill files are changed only during maintainer merge and release. If those pieces are missing, that gap is itself a Loop 2 weakness that should be patched.

Start every run by reading:

- `references/evolution-loop.md`
- `references/integration-contract.md`
- `references/target-selection.md`
- `references/generalization-ladder.md`
- `references/anti-overfit-guards.md`
- `references/meta-optimization-checks.md`

Read these when needed:

- `references/change-decision-matrix.md`
- `references/versioning-policy.md`
- `references/output-template.md`
- `references/release-log.md`

## Core Model

This skill uses a mandatory post-task gate and a double-loop model.

The post-task gate answers one question first:

- does this completed task create any reusable learning signal

If the answer is no, emit a deliberate `no change` conclusion and stop. If the answer is yes, continue through both loops.

### Loop 1: Target Evolution

Ask whether the target artifact should evolve:

- agent operating rules
- domain skill
- checklist
- script
- template
- workflow
- prompt or review habit

### Loop 2: Evolution-Process Evolution

Ask whether the evolution mechanism itself should evolve:

- is the learning log too case-specific
- are promotion gates too weak or too strict
- are abstraction rules clear enough
- are anti-overfit checks catching the right risks
- is release governance sufficient

Do not skip Loop 2. The point is not only to improve the target agent, but to improve the quality of future evolution decisions.

## When to Use This Skill

Attach this skill to any reusable agent that should improve from experience in a controlled way.

Run the post-task gate after:

- a substantial task finishes
- a standard task finishes and may contain reusable learning
- a failure, surprise, or blind spot appears
- the same type of issue appears in multiple tasks
- a new domain exposes missing heuristics
- an existing skill starts showing repeated weak spots
- an agent needs to review whether its own rules should change

For trivial tasks, the gate may terminate quickly with `no change`.

## Execution Workflow

### 1. Classify the completed task

Use `references/integration-contract.md` to decide whether the task was:

- trivial
- standard
- substantial
- critical

Trivial work still gets the gate. Standard, substantial, and critical work require an explicit Loop 1 and Loop 2 review.

### 2. Reconstruct the task signal

Summarize:

- what task was attempted
- what artifact or role was responsible
- what went well
- what broke
- what almost broke
- what required workaround or manual judgment

### 3. Choose the correct target artifact

Use `references/target-selection.md` to decide where a change belongs:

- local task note
- agent rule
- skill instruction
- reference checklist
- helper script
- release governance

Also identify the correct domain bucket for the learning:

- requirements or PRD
- code review
- test artifact
- research or analysis
- workflow or operations
- generic cross-domain

### 4. Convert case -> principle

Use `references/generalization-ladder.md`:

- symptom
- failure mode
- generalized principle
- reusable rule

If the learning cannot survive abstraction, keep it as a case note only.

For cross-project skills, white-label the learning before recording it. Remove project names, customer names, repository names, ticket names, environment names, and one-project module names from evolution records and replace them with reusable category labels.

### 5. Run anti-overfit checks

Use `references/anti-overfit-guards.md` before allowing evolution.

The skill must prefer:

- principles over incidents
- diversity over repetition in one narrow context
- reusable habits over product-specific quirks

### 6. Review evolution-process quality

Use `references/meta-optimization-checks.md` to ask whether the evolution system itself needs work:

- is the post-task gate firing at the right times
- is the abstraction quality strong enough
- are promotion gates too weak or too strict
- is the logging schema missing an important field
- do the helper scripts leave too much manual work
- is the output contract too vague for other agents to use consistently
- does the host skill have a real post-task or post-audit execution path, rather than only aspirational wording
- does the host skill keep its own local release state when the host skill itself is expected to evolve over time

### 7. Decide the change type

Use `references/change-decision-matrix.md` to choose among:

- no change
- log only
- candidate principle
- promote into active rule
- patch-level maintenance change
- minor capability expansion
- major model or workflow change

### 8. Record structured learning

Use the host skill's inbox wrapper when the host library follows an inbox-first collaboration model. Collaborator-local evolution must go to the host skill's sibling `evolution-inbox/` only.

Use `scripts/record_insight.py` to store canonical skill history only during central maintainer merge/release work. The script requires `--allow-canonical-write` for non-dry-run writes; do not pass that flag for ordinary collaborator runs.

Record, when there is a real learning signal:

- the local case
- the generalized principle
- the target artifact
- the domain key and standard family
- the proposed action
- confidence and impact
- whether the learning belongs to Loop 1, Loop 2, or both

If there is meaningful learning and a maintainer wants the full standard pipeline for canonical history, use `scripts/run_evolution_cycle.py --allow-canonical-write`.

### 9. Review promotion pressure

Use:

- `scripts/evolution_review.py`
- `scripts/suggest_changes.py`

These should answer:

- are several entries pointing to the same generalized principle
- is a candidate diverse enough to promote
- is the target skill overfitting
- is the evolution system itself showing weak spots

### 10. Propose or register upgrades

Use:

- `scripts/propose_upgrade.py` to draft the next change set
- `scripts/register_release.py` only after a deliberate acceptance decision

## Hard Rules

- Every agent carrying this skill must perform the post-task gate after each completed task.
- The unit of evolution is the generalized principle, not the raw incident.
- A single dramatic case can justify a candidate, but not automatic broad promotion.
- Repetition inside one narrow product slice is weaker than cross-context diversity.
- Every evolution decision must permit the outcome `no change`.
- If the target change is unclear, prefer logging and deferring over forcing a rule.
- If a task creates no reusable learning, do not force a log entry just to satisfy the cadence.
- Default to domain-specific evolution before global evolution.
- If a reusable skill claims mandatory evolution but lacks a collaborator inbox wrapper, maintainer-only canonical recording path, or release state, treat that as a real meta weakness and repair it.
- If tooling is unavailable, continue manually; do not block evolution review on tooling alone.

## Deliverables

A complete run of this skill should usually produce:

- task classification
- a post-task evolution conclusion
- Loop 1 target recommendation
- Loop 2 meta-optimization conclusion
- generalized principle candidate or no-change decision
- anti-overfit assessment
- next-step action
- version or release proposal when appropriate

For deeper runs, also produce:

- a list of repeated failure modes
- a list of principles ready for promotion
- a list of cases that should remain local and not become global rules
