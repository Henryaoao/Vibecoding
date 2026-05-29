# High-Risk Admin And Backoffice Layering

Use this reference for admin, CRM, finance, wallet, approval, reporting,
permission, or other credentialed backoffice systems where automation can expose
sensitive data or trigger business side effects.

## 1. Layer The Delivery

Do not claim full business correctness from safe shell automation. Use explicit
coverage layers:

- `L1 safe baseline`: authenticated discovery, module decomposition, menu
  visibility, route reachability, page shell, safe method/path/status metadata,
  representative no-auth guards, and explicit blocked or confirmation-needed
  boundaries.
- `L2 page and functional-area baseline`: module-specific page groups,
  controls, filters, table headers, tabs, placeholders, pagination shells,
  report-denominator governance, stale-result checks, and no sensitive row/body
  retention.
- `L3 module business rules`: controlled fixtures, field whitelist, stable
  product oracle, rollback or cleanup, role/account rules, and business-state
  assertions that can convert selected confirmation-needed rows into executable
  tests.
- `L4 cross-module flow`: approved end-to-end state transitions across modules,
  such as create -> approve -> record -> report, with fixture and rollback
  ownership across every touched module.
- `L5 regression and monitoring`: scheduled safe subsets, historical trend
  reports, route/menu drift detection, flake tracking, and recurring secret
  scans.

State the active layer in testcase packs, automation specs, execution reports,
and handoff summaries. A layer can be complete while deeper layers remain 0%.

## 2. Preserve Status Buckets

Keep the approved case universe intact:

- `passed`: backed by current execution or evidence for the specific case
  assertion.
- `blocked`: unsafe without approval, fixture, rollback, field whitelist, or
  mutation/export/download permission.
- `confirmation-needed`: missing product rule, safe data, role matrix, oracle,
  route binding, or redaction policy.
- `manual-only`: requires human judgment or governance review.

Blocked and confirmation-needed rows are not failed work and must not be
converted into weak smoke passes to improve percentages.

## 3. Credentialed Runner Preflight

Default credential protocol:

- Use Bitwarden-style local secret prompts for credentialed website/admin QA.
- Never ask the user to paste passwords, one-time codes, cookies, tokens,
  Authorization headers, storage state, or secret-manager item JSON into chat.
- If Bitwarden CLI or an approved equivalent is not available, stop at a
  credential-provider blocked state and ask the user to install/configure the
  approved provider or explicitly approve a project-specific alternative.
- Do not silently fall back to copied cookies, copied storageState, hardcoded
  passwords, checked-in auth files, browser profile scraping, or raw secret
  exports.
- A project may rename the provider or secret item, but the interaction model
  stays the same: local shell prompts, non-secret item selection, no secret
  values written to files, reports, logs, or chat.

Before asking a user for local credentials, verify the runner path without
secrets:

- dependency install and package script entry point
- browser/runtime availability and version cache
- Bitwarden CLI or approved provider availability and non-secret status checks
- prompt and input method for local unlocks, item selection, and one-time codes
- no trace, video, screenshot, storage state, cookie, token, header, raw body, or
  secret-manager item JSON persistence
- blocked artifact creation when any stage fails
- clear stage labels so a failure says whether it stopped at unlock, login,
  two-factor, dashboard, evidence collection, normalization, or report build

Never ask the user to paste passwords, one-time codes, cookies, tokens, storage
state, or secret-manager item JSON into chat.

## 3.1 Credentialed Web Discovery

For "enter the website and analyze it" tasks, run the access workflow before
writing module testcases:

1. define target URL, observed login route, workspace, credential item selection
   strategy, and forbidden artifact types
2. run the no-secret preflight
3. open a local prompt for Bitwarden unlock, item selection, and one-time code
4. keep login and discovery in one controlled browser process unless the project
   explicitly approves a different model
5. collect only redacted evidence: menu labels, route/path, page title, safe
   control labels, table headers, placeholder text, and method/path/status
   network metadata
6. exclude screenshots, videos, traces, storageState, cookies, tokens, headers,
   request/response bodies, row values, customer/account/financial data, and raw
   secret-manager JSON unless a separate redaction policy approves them
7. write a completed or blocked discovery artifact with stage, timestamp, paths,
   and non-secret failure reason
8. run secret scan before treating the discovery as a source of truth

Only after this discovery gate should the agent decompose modules, design the
L1/L2/L3 plan, or write module-level testcase packs.

## 3.2 Current Menu Tree Truth Gate

For authenticated admin products, module scope must come from the current live
menu tree before adding, deleting, restoring, or regrouping testcase cases. Do
not infer current scope from old reports, old bundles, screenshots, file names,
or memory alone.

Use this gate whenever the work affects case existence, module grouping, report
denominators, or deletion/restoration of historical module artifacts:

1. Open the current authorized UI or use a fresh redacted authenticated
   inventory runner.
2. Capture the full visible navigation tree:
   - top-level navigation items
   - hover/dropdown child menus for every top-level item
   - side menus opened from global header utilities such as Settings
   - avatar/profile menus, platform/language menus, notification menus,
     tab counters, overflow dialogs, drawers, and other global shell controls
3. Keep parent/child grouping consistent. If `User` children are not reported
   as independent top-level modules, then `Settings` children must also stay
   nested under `Settings` in the final report. Child-module specs may exist,
   but report grouping should show the real product hierarchy.
4. Compare candidate case IDs against the live menu tree and any collaborator
   clarification source, such as an Excel file. A case may be removed from the
   active denominator only when the current UI has no matching top-level item,
   child menu, side-menu entry, global control, route-safe evidence, or
   collaborator rule that keeps it in scope.
5. If collaborator notes say a case exists, has a route, has a product rule, or
   should be manual-only/blocked rather than automated, do not delete it merely
   because its old module name is no longer a top-level menu. Reclassify it
   under the current parent module or keep it as `confirmation-needed` until
   the route is safely checked.
6. Only treat cases as deletion candidates when the live menu tree does not
   expose the area and the clarification source says the module/page does not
   exist, is not needed, or is explicitly outside current scope.

The gate output should be a small evidence artifact that lists verified
top-level modules, child menus, global-header controls, side-menu controls,
historical modules restored because they map to current menus, historical
modules excluded because no current evidence supports them, and cases kept
because collaborator notes supplied a valid current rule.

Deletion without this evidence is a hard gate failure.

## 3.3 Layered UI Discovery And Modal Discipline

For authenticated admin shells, never decide page behavior from URL and main
content alone. Many backoffice apps update the background route or table while a
blocking dialog, drawer, popover, toast, or tab-limit confirmation is still the
real user decision point.

After every menu click, tab click, route change, filter action, or boundary
probe, inspect the layered UI surfaces before recording the conclusion:

- modal/dialog/alert content and buttons
- drawer, popover, dropdown, menu, tooltip, and confirm overlay content
- toast/status/live-region messages
- tab strip count, tab order, active tab, close buttons, and breadcrumb/header
  state
- URL, document title, selected navigation state, and main content

Do not claim that a prompt is absent just because the URL or page body changed.
If an overlay exists, its visible text and buttons are primary evidence. Record
the overlay wording, the background state it covers, and the safe next choices.

For tabbed admin workspaces, treat tab overflow as its own global-header case:

- establish the current count and tab order before opening another page
- trigger the 11th page from a safe read-only menu or route
- capture the confirmation wording, including which existing tab will close and
  which new page will open
- verify `Cancel` keeps the existing tab set and selected tab unchanged
- verify `Confirm` only when the action is front-end tab replacement, then prove
  the named old tab was removed, the new tab was added, the selected tab matches
  the visible page, and the count remains at the configured limit
- infer eviction rules such as FIFO only after at least two observed overflow
  transitions, not from a single example

When a page contains state-changing buttons, exports, approvals, deletion,
logout, role changes, platform/language switching, or other side-effect paths,
do not click confirmation buttons unless the case scope and user approval make
that action safe. Leave the case `confirmation-needed` or `blocked` with the
exact overlay evidence.

## 3.4 Safe Unknown-Control Exploration

Do not leave safe unknown UI elements unexplored. In admin/backoffice shells,
counters, badges, tab indicators, toggle-looking controls, compact icon buttons,
empty-state links, pagination widgets, and small header utilities often carry
real behavior that belongs in the testcase pack.

If an element is visible and the next action is non-destructive, the QA agent
must run a bounded exploration before writing or auditing cases. Safe exploration
means the action does not submit, save, export, download, approve, reject,
delete, logout, send notifications, change roles, change platform/language
settings persistently, or mutate business data.

For each safe unknown control:

1. Record the initial visible state, nearby labels, DOM role/class when useful,
   URL, active tab, selected nav item, and relevant counts.
2. Form a concrete hypothesis, such as "open tab count", "pending task badge",
   "pagination size", "notification unread count", or "platform selector".
3. Trigger the smallest safe action that should affect the hypothesis.
4. Compare before/after: visible text, selected tab, tab order, modal/dialog
   text, URL, main heading, table shell, badge/counter value, and non-secret
   network path/status metadata when available.
5. Repeat with a second safe transition when a rule or pattern is being inferred
   rather than directly stated.
6. Convert the discovered behavior into explicit testcase rows with setup,
   steps, expected result, oracle, and safety boundary.

Only keep the behavior `Pending` when the next useful action would be
destructive, credential-sensitive, data-sensitive, role-sensitive, or dependent
on a product rule that cannot be safely observed. In that case, record exactly
what was safely tried and what approval or fixture is needed next.

## 4. Current-Run And Report Hygiene

For module-scoped execution:

- archive or clear `current-run` before a new module run
- prove the current run only contains evidence for the active module
- map pass-producing tests only to approved automatable case IDs
- keep blocked, confirmation-needed, skipped, and manual-only rows in the report
  denominator
- treat `latest` report mirrors as convenience only; immutable evidence belongs
  in versioned report and execution archives
- run secret scans after credentialed evidence collection and after report
  generation
- if screenshot count is zero, state whether this is a safety policy or a
  missing artifact
- case-level report screenshots must come from the case's own runtime state
  whenever the case is executed. Capture the screenshot immediately after the
  key assertion while the browser is still on the verified page, dialog, filter,
  table, or empty state. Do not attach a generic dashboard, global header,
  module dropdown, side menu, or module overview screenshot to individual case
  rows.
- authorized admin overview screenshots may support module inventory or
  navigation evidence, but they are not pass evidence for business-page cases.
- if the user explicitly approves authorized business-page screenshots, visible
  business page content, filters, table rows, field names, and dialogs may be
  captured as case evidence. The standing prohibited screenshot content remains:
  passwords, one-time codes, token/cookie/session values, Authorization headers,
  raw secret-manager UI/items, and unapproved destructive/write actions.
- when screenshots are approved, update the testcase/script/report boundary
  text so it no longer says "no row values" or "no screenshots"; stale safety
  wording causes misleading reports even if the script behavior is correct.

Any stale evidence must be labeled historical. It cannot prove current route,
mapping, or report behavior after testcase, script, fixture, helper, report, or
environment changes.

## 5. Manager Progress Cadence

For long manager-style QA work, report progress at every stage gate:

- total modules and completed modules
- current module, slug, layer, and stage
- case denominator and status distribution
- commands just run and strongest evidence paths
- report archive and latest mirror, if generated
- accepted warnings, blocked scope, and confirmation-needed scope
- next module or next decisive gate
- approximate current-module and overall progress, clearly labeled as estimates

Do not wait until final closeout to update ledgers or the user-facing status.
If an independent child audit times out or errors, label the fallback explicitly
as a manager hard-gate review rather than an independent audit pass.
