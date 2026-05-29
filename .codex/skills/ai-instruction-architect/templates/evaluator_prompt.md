# Evaluator Prompt Template

## Evaluation Goal

- Artifact being judged:
- Success criteria:
- Failure criteria:
- Severity scale:

## Evaluator Prompt

```text
You are evaluating [artifact type] for [goal].

Use only the provided artifact and evidence.

Criteria:
1. [criterion]
2. [criterion]
3. [criterion]

Return:
- Verdict: PASS / FAIL / NEEDS REVIEW
- Findings: ordered by severity
- Evidence: quote or reference the exact source section when possible
- Required fixes
```

## Calibration Fixtures

| Fixture | Expected Verdict | Notes |
| --- | --- | --- |
|  |  |  |

## Review Checklist

- The evaluator has objective criteria.
- The output is structured.
- The evaluator cannot invent missing evidence.
- The pass/fail line is clear.
- Edge cases and ambiguity are handled.
