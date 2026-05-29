# Skill Blueprint Template

## Skill Name

`skill-name`

## Trigger Description

Use when Codex needs to:

-

## Core Workflow

1. Classify the request.
2. Load only the required references.
3. Execute the procedure.
4. Verify the artifact.
5. Report changed files and residual risks.

## Runtime Resources

| Resource | Purpose | Load When |
| --- | --- | --- |
| `references/` | Detailed rules |  |
| `templates/` | Output structure |  |
| `scripts/` | Deterministic execution |  |
| `assets/` | Output assets |  |

## SKILL.md Outline

```markdown
---
name: skill-name
description: ...
---

# Skill Title

## Operating Loop

## Reference Loading

## Quality Rules
```

## Validation

- Frontmatter has only `name` and `description`.
- Skill name is lowercase hyphen-case.
- Description contains trigger conditions.
- SKILL.md links every runtime reference.
- Package excludes raw source dumps and process notes.
