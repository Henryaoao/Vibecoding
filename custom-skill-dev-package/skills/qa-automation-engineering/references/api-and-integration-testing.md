# API And Integration Testing

## Contract Inventory

Before designing or patching tests, identify:

- endpoint or message contract
- auth model and roles
- request schema, headers, and idempotency rules
- response schema, status codes, and error model
- dependent services, queues, webhooks, caches, or downstream side effects

## Coverage Model

Cover as relevant:

- happy path and negative path
- auth and permission variants
- schema validation and type drift
- boundary values, nullability, optional fields, and enum drift
- retries, duplicates, ordering, pagination, filtering, and partial failure
- asynchronous completion, eventual consistency, and timeout behavior

## Automation Guidance

Prefer:

- direct contract assertions over string-only checks
- deterministic fixture setup and cleanup
- isolated test data and idempotent setup where possible
- explicit correlation IDs, request IDs, or trace IDs in debug output

Avoid:

- shared mutable fixtures with hidden coupling
- assertion-free smoke calls
- pass criteria that ignore side effects or downstream state

## Observability

Capture enough evidence to explain a failure:

- request payload or fixture reference
- response body and status
- timing and retry behavior
- relevant logs, events, or downstream record checks

## Red Flags

Fail or repair when:

- the contract source is unclear
- the oracle ignores business meaning
- the environment or data dependency is hidden
- the test assumes ordering, timing, or retries without stating it
