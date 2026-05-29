# Coding Prompt Template

## Brief

- Repository/workspace:
- Task:
- Files/modules likely involved:
- Constraints:
- Verification command:

## Prompt

```text
You are working in [repo/workspace].

Goal:
[goal]

Scope:
- Edit only:
- Do not change:

Workflow:
1. Inspect existing patterns.
2. Make the smallest safe change.
3. Add or update focused tests when needed.
4. Run verification.
5. Report changed files and test results.

Acceptance criteria:
[criteria]
```

## Review Checklist

- Scope is bounded.
- Existing conventions must be read before editing.
- Verification command is explicit.
- The prompt forbids unrelated refactors.
- The final response requires changed files and test results.
