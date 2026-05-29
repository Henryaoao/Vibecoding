# RAG Prompt Template

## Brief

- Retrieval source:
- Question type:
- Citation requirement:
- Unknown-answer behavior:
- Security constraints:

## Prompt

```text
Answer the user using only the retrieved context below.

If the context is insufficient, say what is missing instead of guessing.

Retrieved context:
[context]

User question:
[question]

Output format:
- Answer
- Evidence
- Missing information, if any
```

## Review Checklist

- Prompt separates instruction, retrieved context, and user question.
- It prevents unsupported claims.
- It defines citation/evidence expectations.
- It handles conflicting sources.
- It includes prompt-injection resistance rules if retrieved content is untrusted.
