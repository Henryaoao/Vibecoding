# Agent And Skill Design Reference

Use this reference for agent specs, Codex skills, tool-using workflows, multi-agent systems, and governed AI systems.

## Agent Core

An agent is not just a long prompt. Specify the system around the model:

- Mission and non-goals.
- Inputs, source-of-truth hierarchy, and output contract.
- Tool inventory and permission levels.
- State, memory, scratchpad, checkpoints, and context cleanup.
- Planning/execution loop.
- Verification, evaluation, and reporting.
- Guardrails, human review points, and stop conditions.

## Basic Agent Loop

Use a plan-act-observe-revise loop when autonomy is justified:

1. Understand the request and constraints.
2. Gather evidence or inspect the environment.
3. Choose the next action.
4. Use tools or produce an intermediate artifact.
5. Observe results.
6. Verify against criteria.
7. Continue, stop, or escalate.

Keep the loop bounded. Define maximum attempts, failure handling, and what to report when blocked.

## Tool Design

For every tool, define:

- Purpose.
- Input schema.
- Output schema.
- Risk level.
- Permission requirements.
- Failure modes.
- Whether human review is required before or after use.

Prefer structured APIs, parsers, and deterministic scripts for fragile operations. Do not expose broad write/destructive tools unless necessary.

## Memory And Context

Define what should persist and what should not:

- Short-term working context.
- Task-specific scratch notes.
- Durable user/project preferences.
- Artifacts and traces.
- Cleanup rules for stale or sensitive context.

Memory should improve future performance without preserving secrets, errors, or accidental assumptions.

## Guardrails

Add explicit checkpoints for:

- External messages.
- Production writes.
- Deletions, moves, resets, or irreversible file operations.
- Credentials and private data.
- Legal, medical, financial, or safety-critical advice.
- Model-generated code that will run in privileged environments.

Guardrails should be procedural, not decorative.

## Multi-Agent Patterns

Use multi-agent systems sparingly. Good patterns include:

- Manager plus workers with disjoint ownership.
- Generator plus evaluator.
- Researcher plus synthesizer.
- Planner plus executor.
- Specialist handoff by domain.

Define for each agent:

- Owned files/domains.
- Inputs and outputs.
- Tools and permissions.
- Communication format.
- Integration responsibility.
- Conflict resolution.

Avoid duplicate exploration and unclear handoffs.

## Evaluation

Evaluate agents as systems:

- Task success.
- Tool correctness.
- Constraint compliance.
- Robustness to ambiguous inputs.
- Safety and permission handling.
- Latency and cost.
- Evidence quality.
- Recovery from failures.

Use fixtures with expected behavior. Include ordinary cases, edge cases, and forbidden-action cases.

## Skill Design

A Codex skill should be an efficient onboarding guide:

- `SKILL.md` stays lean and procedural.
- Frontmatter description contains all triggering conditions.
- References hold detailed domain rules and are loaded only as needed.
- Templates encode repeatable output structures.
- Scripts are included only when deterministic execution is repeatedly needed.
- Avoid README, install guides, raw books, extraction logs, and large source dumps in the runtime skill.

Skill folder shape:

```text
skill-name/
  SKILL.md
  references/
  templates/
  scripts/     optional
  assets/      optional
```

## Skill Quality Checklist

- Name uses lowercase letters, digits, and hyphens.
- Description says what the skill does and when to use it.
- Body tells the agent how to route and what to load.
- Each reference is directly linked from SKILL.md.
- No duplicated long explanations across files.
- Templates are ready to fill.
- The package excludes source-library clutter and extraction dependencies.
