# Common Checklist

Use this checklist on every audit, regardless of domain.

These are the shared rules layer for the adaptive audit agent.

## 1. Authenticity

- Is the artifact actually the artifact type it claims to be?
- Is it mixing instructions about how to create the artifact with the artifact itself?
- Is the purpose explicit?

## 2. Scope

- Is the scope clear?
- Are in-scope and out-of-scope boundaries visible?
- Is the intended user, system, or audience explicit?
- If this is a parent, master, umbrella, or index artifact, does it map its claimed child coverage to concrete child artifacts and explicit coverage states?
- If the artifact declares shared or mandatory subordinate standards, do those artifacts actually exist in the deliverable set instead of remaining unresolved placeholders?

## 3. Core Logic

- Is the main behavior, claim, or flow understandable?
- Are triggers and outcomes defined?
- Are success and failure paths both represented?

## 4. Edge Cases

- Are negative cases present?
- Are boundary conditions present?
- Are dependency or chained conditions considered?
- Is silent failure risk addressed?
- For interactive failure paths, did the audit inspect the full feedback stack instead of stopping at one symptom?

## 5. State and Dependency Handling

- Are states, transitions, or phases explained where relevant?
- Are approvals, dependencies, or external systems acknowledged?
- Is failure recovery, retry, rollback, or escalation defined when needed?

## 6. Observability

- Can another reviewer verify the result?
- Are assertions, checkpoints, or evidence hooks visible?
- Are dynamic variables treated as variables instead of frozen constants?
- When one failure path produces multiple simultaneous signals, are all observable layers captured separately, such as field error, global feedback, request emission, and backend response?
- If downstream execution depends on setup context, are the required context axes explicit, such as role, login state, language, platform, mode, or environment?

## 7. Evidence Discipline

- Is each conclusion clearly verified, inferred, pending, or prohibited to claim?
- Are guesses separated from observed facts?

## 8. Readiness

- Is the artifact actionable for its intended downstream use?
- Are the main blockers explicit?
