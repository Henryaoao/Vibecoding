# Frontend TDD

## Red-Green-Refactor

Use TDD when behavior can be specified before implementation:

1. Write a small failing test for one visible behavior or contract.
2. Implement the smallest useful change.
3. Refactor test and production code while preserving behavior.
4. Repeat until the feature is expressed through a readable test suite.

Avoid broad snapshot-first testing. Use snapshots only when intentional structural regression is the risk.

## Test Level Selection

- Unit tests: pure functions, validators, reducers, formatters, stores, and business rules.
- Component tests: rendered states, props, events, conditional UI, accessibility semantics, and interaction behavior.
- API or route tests: request/response contracts, validation, authorization, persistence, and error handling.
- E2E tests: critical user journeys, integration confidence, auth, routing, and high-risk browser behavior.
- Cucumber/BDD: shared product language for scenario alignment, not a substitute for precise assertions.

## Component Test Quality

Prefer tests that:

- Name the user-observable behavior.
- Arrange only data needed by the behavior.
- Interact through the DOM like a user where possible.
- Assert visible state, emitted events, API calls, or store changes.
- Keep component mocks narrow and behavior-oriented.

Avoid tests that:

- Mirror implementation structure.
- Assert every prop or internal variable.
- Overuse mocks until the test no longer proves integration.
- Hide a complex flow behind unreadable helper magic.

## Test Doubles

Use test doubles to isolate slow, external, or hard-to-control collaborators. Keep them simple:

- Stub fixed responses for deterministic behavior.
- Spy on externally visible calls when the call is the contract.
- Mock third-party components only when their behavior is not under test.
- Prefer real child components when integration risk matters.

If mocks become more complex than the production collaborator, move the test up a level or simplify the design.
