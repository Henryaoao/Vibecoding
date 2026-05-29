# Prompt Design Reference

Use this reference for general text prompts, prompt templates, prompt improvement, and reusable instruction assets.

## Prompt Anatomy

A strong prompt separates:

- Role or operating stance, only when it changes behavior.
- Task and success target.
- Context and source material.
- Constraints and forbidden behavior.
- Examples or counterexamples.
- Output format.
- Review step before final answer.

Prefer concrete constraints over broad adjectives. "Use a concise table with columns A, B, C" is stronger than "be clear".

## Prompting Modes

- Zero-shot: use for simple tasks with obvious format and low ambiguity.
- Few-shot: use when style, classification boundary, formatting, or edge-case handling must be learned from examples.
- Decomposition: use when a task has separable analysis and production stages.
- Prompt chaining: use when each stage has a clear intermediate artifact.
- Self-review/evaluator loop: use when quality depends on criteria, not taste.
- Search/optimization: generate candidate prompts, test on fixtures, score, mutate, and keep the best.

Do not add elaborate reasoning scaffolds to tasks that need direct execution.

## Context Discipline

- Keep instructions outside quoted source content.
- Label source material clearly.
- Say what to do when context is insufficient.
- Forbid unsupported claims when the prompt depends on evidence.
- Include conflict handling when multiple sources may disagree.

## Examples

Use examples when:

- The desired style is hard to describe.
- The output format is strict.
- There are common false positives/false negatives.
- The task depends on domain-specific conventions.

Keep examples representative. Avoid examples that accidentally encode a single answer pattern.

## Output Contracts

Make the answer checkable:

- Define required sections.
- Define table columns or JSON schema when useful.
- Define length and language.
- Define pass/fail or acceptance criteria.
- Define what should be omitted.

## Prompt Improvement Loop

1. Capture the target task and examples of good/bad outputs.
2. Identify the failure mode: missing context, weak format, vague criteria, conflicting constraints, wrong model/tool target, or excessive autonomy.
3. Revise the smallest part of the prompt that controls the failure.
4. Test against at least one normal case and one edge case.
5. Record model/platform, variables, and validation results for reusable prompts.

## Platform And Model Fit

Adapt to the target platform:

- Chat agents benefit from role, task, constraints, and output format.
- Automation agents need tool permissions, state, stop rules, and evidence.
- Image/video models need visual and temporal details, not abstract intent alone.
- RAG systems need source boundaries and citation behavior.
- Coding agents need repo scope, conventions, verification commands, and change limits.

## Common Anti-Patterns

- Asking for "best possible" without a quality definition.
- Mixing user content and system instructions without boundaries.
- Hiding important constraints in prose.
- Adding too many examples that conflict with each other.
- Asking for long chain-of-thought when a short verification checklist is enough.
- Treating a prompt as final without testing it on fixtures.
