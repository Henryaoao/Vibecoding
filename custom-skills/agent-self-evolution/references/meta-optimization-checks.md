# Meta Optimization Checks

Use this file for Loop 2.

The question is not only whether the target artifact should improve. The question is also whether the evolution system itself needs improvement.

## 1. Trigger Quality

Ask:

- did the post-task gate fire at the right depth
- was the task misclassified as trivial, standard, substantial, or critical
- should a stronger trigger rule exist for this class of work
- if multiple artifacts were completed, did the gate run per artifact instead of being delayed until the conversation ended

## 2. Abstraction Quality

Ask:

- did the case resist abstraction
- did the agent jump from symptom to rule too quickly
- is a missing intermediate principle causing overfit risk

## 3. Targeting Quality

Ask:

- was it difficult to decide whether the change belonged to the agent, the skill, the checklist, the workflow, or governance
- does target selection need a clearer rule or example

## 4. Promotion-Gate Quality

Ask:

- are current promotion thresholds too permissive
- are they too strict to capture meaningful repeated lessons
- should diversity requirements become stronger

## 5. Logging Quality

Ask:

- did the logging schema miss an important dimension
- was it hard to express Loop 1 versus Loop 2 learning
- was it hard to express domain-specific versus cross-domain learning
- should a new field be captured for later analysis

## 6. Tooling Quality

Ask:

- did repetitive manual work remain that should become a script
- did a script output make review harder instead of easier
- should the standard cycle be more automated
- did a host skill lack a concrete wrapper or default invocation path for the mandatory gate

## 7. Output-Contract Quality

Ask:

- would another agent produce the same structure from this skill
- are the expected outputs clear enough for consistent adoption
- should the minimum output contract become stricter

## 8. Governance Quality

Ask:

- is the release process too vague
- are version-bump rules sufficient
- should meta-skill changes require stronger evidence
- is a host skill claiming self-evolution without a collaborator inbox wrapper, maintainer-only canonical recording path, version state, or release notes

## 9. Action Mapping

If the weakness is about thinking order, target `workflow` or `prompt`.

If the weakness is about structure or reusable instructions, target `skill` or `checklist`.

If the weakness is about thresholds, logs, or releases, target `governance`.

If the weakness is about repetitive mechanics, target `script`.
