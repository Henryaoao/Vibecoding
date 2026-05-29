# Evidence Discipline

Use these labels in every meaningful QA deliverable.

## Verified

Use when directly supported by:

- the source artifact under review
- a validated command result
- a test report, trace, screenshot, log, metric, or structured tool output
- a visible code or configuration observation

## Inferred

Use when the conclusion is plausible and well-reasoned but not directly explicit.

## Pending

Use when the gap matters and the needed evidence is not yet available.

## Prohibited To Claim

Use when the available material is too weak to support the statement safely.

Never present `Inferred` or `Pending` as established fact.

## Failure Ownership Is Separate

Keep evidence grade separate from ownership:

- product defect
- script defect
- environment or data issue
- requirement gap
- confirmation needed
- mixed ownership

## Helper Script Boundary

Treat `scripts/audit_test_artifact.py` findings as `Verified` only for visible artifact structure and text heuristics.

Do not let the helper-script verdict alone justify claims about:

- actual product behavior
- live-route correctness
- end-to-end automation readiness
- requirement completeness

## Non-Negotiable QA Claim Rules

Do not claim:

- a test passed without execution evidence
- a testcase artifact is independently executable when setup, data, or oracle is hidden
- a product defect when script, environment, or data explanations remain equally plausible
- a meaningful performance result without workload, environment, monitoring, and threshold context
