# Integration Contract

Use this contract when attaching `agent-self-evolution` to any reusable agent.

## 1. Invocation Rule

Run the post-task gate after every completed task.

The gate does not force change every time. It forces consideration every time.

If a larger request contains multiple independently completed subtasks or artifacts, run the gate after each completed unit, not only at the end of the full request.

## 2. Task Classification

Classify the completed task before deciding depth:

- `trivial`: quick answer or mechanical action with no meaningful judgment; allow a fast `no change`
- `standard`: normal task with some judgment; require a concise Loop 1 and Loop 2 pass
- `substantial`: multi-step task, edge cases, revisions, or material risk; require full evolution review
- `critical`: high-stakes, repeated failure, production impact, or governance implications; require full review plus backlog inspection

## 3. Mandatory Questions

Every non-abandoned task must answer:

### Gate Question

- did this task generate reusable learning

### Loop 1 Question

- what artifact should change, if any

### Loop 2 Question

- did the evolution process itself show a weakness, ambiguity, or missing guardrail

### Domain Question

- which standards family should absorb this learning, if any

For multi-artifact work, answer these questions per completed artifact first. An optional batch-level pass may summarize cross-artifact learning afterward.

## 4. Minimum Output Contract

Every run should emit at least:

- task classification
- learning signal: yes or no
- selected domain or explicit cross-domain conclusion
- Loop 1 conclusion
- Loop 2 conclusion
- generalized principle or explicit `no change`
- next action

## 5. Logging Rule

Use logging only when one of these is true:

- a generalized principle was identified
- a candidate change should be tracked
- a meta-evolution weakness was found
- release or governance pressure increased

Do not flood the log with repetitive trivial `no change` entries.

For cross-project skills, white-label the record before logging. The logging payload must not contain project names, customer names, repository names, ticket names, real environment names, or proprietary module names. Convert them into reusable category labels such as `credentialed-admin-report-evidence-repair` or `testcase-status-normalization-fix`.

## 6. Standard Automation Path

When meaningful learning exists:

1. decide the target artifact
2. abstract case to principle
3. run anti-overfit review
4. decide action
5. use the host skill's inbox wrapper for collaborator-local records; use `scripts/run_evolution_cycle.py --allow-canonical-write` or `scripts/record_insight.py --allow-canonical-write` only for maintainer merge/release records
6. inspect promotion pressure when the task was substantial or critical

For reusable host skills that are expected to evolve themselves, also verify:

7. the host skill has a standard execution path for its post-task gate
8. the host skill has a concrete recording path: sibling `evolution-inbox/` for collaborator-local unmerged learning, plus maintainer-only canonical evolution memory/log files for central merge and release
9. the host skill has local version state and release tracking if the host skill itself is versioned

## 7. Targeting Rule

If the issue changes how an agent should reason, target an `agent` or `prompt`.

If the issue changes reusable domain behavior, target a `skill`, `checklist`, or `workflow`.

If the issue reveals weakness in learning gates, abstraction, promotion criteria, release process, or logging design, target `governance`, `workflow`, or the self-evolution `skill` itself.

Keep the domain tag aligned with the standards family that should change. Do not mix PRD, code, test, or research lessons unless the principle is explicitly cross-domain.

If the weakness is that a host skill says it will evolve but does not actually have the wrapper, files, or governance to do so consistently, target the host `skill`, `workflow`, or `governance`, and also consider whether `agent-self-evolution` needs a stronger integration rule.

## 8. Ready-To-Embed Agent Clause

Use this clause inside other agents when needed:

`After each completed task, run the agent-self-evolution post-task gate. Classify the task, decide whether reusable learning exists, complete both Loop 1 and Loop 2, prefer generalized principles over incidents, white-label cross-project skill records, allow no-change when appropriate, record collaborator-local learning only through the host skill's approved inbox, and reserve canonical history writes for maintainer merge/release work.`
