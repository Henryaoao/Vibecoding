# Source Reading Synthesis

Use this file only when methodology provenance matters. It distills previously reviewed QA/testing methodology sources into reusable skill guidance without copying source text or relying on a local path.

## Source Groups

- Modern Playwright practice: current Playwright books emphasize user-visible behavior, semantic locators, fixtures, projects, traces, CI, visual checks, accessibility, mobile emulation, authentication state, data factories, and maintainability.
- Selenium and JUnit automation: the Selenium-Jupiter paper and Selenium-oriented books emphasize driver management, parameterized browser coverage, lifecycle hooks, remote/Docker execution, waits, locator discipline, and integration with test frameworks.
- Automation framework design: the automation framework books emphasize layered design, data-driven and keyword-driven ideas, object/page abstractions, TestLink or testcase management integration, reporting, logs, recoverability, CI, and long-term maintenance cost.
- Web/App automation practice: Web/App teaching books emphasize the automation adoption decision, Selenium/Appium basics, PO pattern, pytest/JUnit-style fixtures, data-driven tests, logs, reporting, and end-to-end project structure.
- Test design foundations: the software testing texts emphasize coverage criteria, equivalence classes, boundary values, decision tables, state transitions, graph/data-flow coverage, input-space models, regression selection, test plans, traceability, and oracle design.
- Performance engineering: the enterprise performance books emphasize performance value, metrics, maturity, process, business/data/monitoring/strategy/risk/execution models, environment preparation, JMeter/LoadRunner/tool choice, full-link analysis, tuning, effect display, and continuous performance engineering.
- Frontend TDD: the Svelte TDD book emphasizes red-green-refactor, unit and component tests, Playwright E2E checks, Vitest, Cucumber-style scenarios, test doubles, stores, service workers, and keeping component tests behavior-focused.

## Cross-Book Principles

1. Start with why the test exists: risk, requirement, contract, or user journey.
2. Select the cheapest reliable test level: unit/component/API before UI when the same risk can be proven lower in the stack.
3. Treat UI automation as a maintained product with architecture, data ownership, observability, and refactoring.
4. Use automation to accelerate feedback, regression confidence, compatibility checks, and repetitive data-heavy flows; do not use it to replace exploratory thinking.
5. Require explicit oracles. A test without a deterministic expected result is a script with hope attached.
6. Make failures diagnosable by saving trace/log/report/network/screenshot artifacts and by classifying likely ownership.
7. Performance testing is a model-driven activity. Scripts without workload, data, environment, and monitoring models are not a credible performance result.
8. Mature QA deliverables must be both human-readable and machine-executable: stable IDs, structured fields, unambiguous steps, observable assertions, and clear status.

## Current Official Docs To Check For Exact APIs

- Playwright: https://playwright.dev/docs/best-practices
- Playwright locators: https://playwright.dev/docs/locators
- Playwright fixtures: https://playwright.dev/docs/test-fixtures
- Playwright CI: https://playwright.dev/docs/ci
- Selenium waits: https://www.selenium.dev/documentation/webdriver/waits/
- Selenium locator practices: https://www.selenium.dev/documentation/test_practices/encouraged/locators/
- JMeter getting started: https://jmeter.apache.org/usermanual/get-started.html
- JMeter best practices: https://jmeter.apache.org/usermanual/best-practices.html

When exact syntax or version behavior matters, verify against official docs before finalizing code or commands.
