# Code Review Standards Pack

Use this pack when the artifact is code, a diff, or a review request for an implementation.

Apply this pack in addition to `references/common-checklist.md`.

## 1. Correctness

Check:

- behavior matches intent
- edge cases are handled
- invariants are preserved
- no obvious logic break exists

## 2. Regression Risk

Check:

- existing flows likely affected
- state transitions changed safely
- interfaces remain compatible
- failure handling still works

## 3. Test Coverage

Check:

- tests exist for new behavior
- negative paths are covered
- boundary cases are covered
- flaky or overly coupled tests were avoided

## 4. Reliability and Safety

Check:

- error handling
- retries and timeouts where relevant
- security and permission impacts
- destructive actions guarded

## 5. Maintainability

Check:

- code is understandable
- abstractions fit the surrounding system
- duplicated logic is justified or reduced
- observability is adequate
