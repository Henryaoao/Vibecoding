# Target Selection

Use this guide to decide where a discovered learning belongs.

## 1. Keep It Local

Use when the lesson is:

- one-off
- environment-specific
- too narrow to generalize

## 2. Agent Rule

Use when the lesson changes how an agent should think or sequence work.

Examples:

- always separate verified facts from inferred facts
- always perform a post-task evolution check after substantial work

## 3. Skill Instruction

Use when the lesson changes domain-specific operating behavior for a reusable skill.

Examples:

- a PRD skill should always compare required markers with visible validation
- a research skill should always grade source confidence explicitly

## 4. Checklist or Reference

Use when the lesson belongs in a reusable audit or review matrix.

## 5. Script or Tooling

Use when the same mechanical work keeps recurring and should be automated.

Also use when a host skill claims a mandatory evolution gate but lacks the wrapper or helper path needed to execute it consistently.

## 6. Governance Rule

Use when the lesson changes:

- promotion thresholds
- versioning policy
- anti-overfit checks
- release acceptance process
- host-skill requirements for collaborator inbox wrappers, maintainer-only canonical records, and version state

Use governance, workflow, or the self-evolution skill itself when the weakness belongs to Loop 2 rather than the target domain.
