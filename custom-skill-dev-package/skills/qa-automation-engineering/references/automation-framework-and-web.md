# Automation Framework And Web Testing

## Automation Adoption

Automate when the flow is stable, repeatable, valuable, and observable. Prefer manual or exploratory treatment when requirements are volatile, UX judgment dominates, or setup cannot be made deterministic.

A good automation target has:

- Stable requirement or regression value.
- Repeatable environment and data.
- Deterministic pass/fail oracle.
- Reasonable maintenance cost.
- Clear failure artifacts.

## Framework Architecture

Prefer a small layered structure:

- Specs: readable user scenarios and assertions.
- Fixtures: browser/session/data/environment setup and teardown.
- Domain helpers: business actions such as login, create order, approve request.
- Page or component objects: locators and page-local operations; keep assertions close to behavior when practical.
- Data factories: generate valid, invalid, boundary, and cleanup-safe data.
- Reporters/artifacts: traces, screenshots, videos, logs, network, and JSON/HTML reports.

Avoid building a giant universal framework before real tests demand it. Add abstraction only when it reduces meaningful duplication or isolates volatility.

## Playwright Guidance

When using Playwright:

- Prefer `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`, `getByAltText`, `getByTitle`, and configured test IDs before CSS or XPath.
- Assert user-visible behavior with web-first `expect` assertions.
- Keep tests isolated by context, storage state, user, and data.
- Use fixtures for repeated setup; keep fixture scope intentional.
- Use projects for browser/device/role/environment matrices.
- Use `storageState` for login reuse only when the saved state is owned, refreshable, and not hiding auth behavior that must be tested.
- Use trace viewer and HTML reports for CI failures; collect screenshots/video only when they add diagnostic value.
- Use parallelism and sharding only after data isolation and resource constraints are understood.
- Treat visual and accessibility checks as targeted risk checks, not broad blanket assertions.
- For file upload/download, auth, iframes, Shadow DOM, mobile emulation, and network mocking, add local helper functions only after one concrete use proves the pattern.
- After actions that can open menus, dialogs, drawers, confirms, toasts, or
  tabbed-workspace boundaries, assert the layered UI state before relying on URL
  or main-content assertions. A route can change behind a blocking modal, so
  dialog text, buttons, tab strip count/order/selection, breadcrumbs, and live
  region messages are part of the oracle.
- For admin tab-overflow automation, make the precondition explicit, such as
  `10 / 10` open tabs. Trigger a safe 11th page, assert the confirmation names
  the old tab to close and the new page to open, cover `Cancel` preservation,
  and cover `Confirm` replacement only when it is a front-end tab action with no
  business mutation.
- For unknown but non-destructive UI controls, automate discovery with a small
  before/after probe before designing the final assertion. Capture initial
  state, perform one safe action, compare the specific UI surfaces that should
  change, and repeat once when inferring a rule. Do not skip a safe behavior
  simply because its label is terse.

## Selenium And Appium Guidance

When using Selenium/Appium:

- Prefer stable IDs, accessibility labels, names, and meaningful attributes; use long XPath chains only as a last resort.
- Use explicit waits around user-observable readiness; avoid global sleeps and broad implicit waits.
- Centralize driver/browser/session lifecycle through the test framework.
- Use parameterized browser/device execution only when the target matrix has business value.
- Keep Appium device/emulator setup, desired capabilities, app install state, and cleanup explicit.

## Flaky Test Repair

Classify flakiness before editing:

- Locator flake: selector resolves multiple, stale, hidden, or wrong elements.
- Wait flake: app state is not ready when action/assertion runs.
- Data flake: test data collides, expires, or is mutated by another test.
- Environment flake: network, backend, browser, clock, or resource pressure.
- Product flake: real nondeterministic behavior or race condition.

Repair pattern:

1. Reproduce locally with trace/logs.
2. Identify ownership using artifacts.
3. Replace brittle selector/wait/data setup with semantic and deterministic alternatives.
4. Add a focused regression test or helper only for the verified failure class.
5. Rerun the affected batch and report remaining risk.

## CI Reporting

A professional automation report should include:

- Commit/build, environment, browser/device, test subset, and command.
- Total, passed, failed, skipped, flaky, blocked, and not automated.
- Failure classification and owner.
- Artifact paths.
- New defects or script repairs needed.
- Recommendation on release confidence.

## Credentialed Admin Runner Controls

For credentialed admin or backoffice automation, add a no-secret preflight
before asking for user input:

- Bitwarden-style local prompts are the default credential protocol for
  website/admin QA. Do not request secrets in chat, and do not switch to pasted
  cookies, tokens, storageState, hardcoded passwords, browser profile scraping,
  or raw secret exports unless the user explicitly approves a different
  project-specific provider model.
- package script and wrapper entry point exist
- browser/runtime cache can launch
- Bitwarden CLI or approved provider path and status checks are non-secret
- local prompts collect vault unlock, item selection, passwords, and one-time
  codes outside chat
- failed unlock, login, two-factor, dashboard, collection, normalization, or
  report stages write blocked artifacts with non-secret stage labels
- trace, screenshot, video, storageState, cookies, tokens, Authorization
  headers, raw request/response bodies, secret-manager item JSON, and row-level
  sensitive values are not persisted

If the preflight is incomplete, block the credentialed run and finish the safe
runner repair first.

For site discovery, keep authentication and redacted inventory collection in
one controlled runner. Store only menu/route/title/control/header and
method/path/status metadata, then run secret scan before using the inventory to
split modules or write testcases.

## Approved-Case And Current-Run Hygiene

When converting approved cases into Playwright or other automation:

- only `automatable` rows may become pass-producing test annotations
- blocked, confirmation-needed, skipped, and manual-only rows must stay in the
  report denominator but must not be executed as passes
- verify missing and forbidden case IDs before execution
- clear or archive the module `current-run` before each module-level report run
- prove report inputs belong to the active module, not an earlier module
- after testcase repairs, rebuild the affected approved-case/report-data
  snapshot before report generation; do not let reports read stale generated
  JSON while testcase Markdown has changed
- treat a failed first run as script, data, environment, or product owned only
  after evidence separates those explanations
- rerun the smallest impacted scope after repair unless shared helpers,
  fixtures, or report logic changed
