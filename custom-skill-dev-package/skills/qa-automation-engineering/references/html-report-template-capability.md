# HTML Report Template Capability

Use this reference when a QA task needs a generated HTML report, report template,
report builder, report audit, report postcheck, or handoff-ready execution
summary.

If the project contains a local report template, load it before designing or
changing the report. If the user provides a path, use that path. If no path is
provided, discover likely templates with file search before inventing a report
contract. Common locations include:

- `reports/templates/*.md`
- `templates/*report*.md`
- `**/templates/*report*.md`
- `**/*report*template*.md`
- `**/*html*report*.md`

The local project template is the source of truth for page names, visual
structure, required checks, and project-specific safety wording. This reference
defines the reusable contract to preserve across projects.

If no local template exists, proceed with this reusable contract and clearly
state that no project-specific report template was found. Do not assume any
previous project's folder layout, page names, or report commands exist in
another project.

## 1. Report Scope Contract

Every report must state:

- module or suite slug
- Chinese or user-facing module name when applicable
- report version
- target site or application
- route or surface under test
- execution command and execution scope
- approved case denominator
- data sources: case pack, audit, execution results, normalized results,
  screenshot manifest, secret scan, and postcheck
- immutable archive path and latest mirror path

Do not build a report from stale or cross-module data. If report inputs are
missing or historical, label them as such.

## 2. Case-Level Denominator

HTML reports for testcase-driven work should be case-level, not spec-only.

Preserve the approved case universe:

- passed
- passed_with_warnings
- failed
- blocked
- skipped
- not_automated
- confirmation-needed
- manual-only

Do not hide blocked, confirmation-needed, skipped, manual-only, or not-automated
rows from totals. Do not count denominator-only rows as passed execution.

## 3. Required Pages

A module or suite HTML report should usually include:

- `index.html`: overview
- `failures.html`: failed items
- `warnings.html`: warnings and confirmation-needed items
- `blocked.html`: blocked items
- `missing-dependencies.html`: missing dependencies or confirmation-needed items
- `manual-not-automated.html`: manual-only or not automated items
- `all-results.html`: complete case-level rows
- `modules.html`: module or functional-area summary
- `screenshots/`: referenced safe screenshots, when approved

If a project intentionally uses a smaller page set, explain why and ensure the
postcheck matches that project contract.

## 4. Usability And Navigation

Reports should be readable as a handoff artifact:

- top navigation links across report pages
- summary cards or counts linking to details
- chart or status links where charts exist
- stable anchors for module names and case IDs
- case IDs linked to full result rows
- module names linked to module summaries
- screenshot thumbnails or buttons with current-page lightbox behavior
- responsive layout that keeps text readable

Avoid burying decisive reasons in long paragraphs. Use short labeled segments
such as:

- `判定`
- `脚本映射`
- `通过依据`
- `依赖边界`
- `未满足条件`
- `执行范围`
- `判定边界`
- `待补依据`
- `审计证据`

## 5. Screenshot And Sensitive Artifact Policy

Screenshots are evidence only when they are safe and relevant.

For credentialed admin, finance, wallet, approval, CRM, reporting, permission,
or other sensitive systems:

- screenshots default to excluded unless the project has explicit approval and
  redaction rules
- record screenshot candidate and screenshot reason per case where possible
- if screenshot count is zero, state whether this is a deliberate safety policy
  or a missing artifact
- never save screenshots that expose passwords, one-time codes, tokens, cookies,
  Authorization headers, storage state, secret-manager contents, real account
  rows, financial data, bank data, customer data, permission secrets, or other
  sensitive values

Trace, video, raw request/response body, headers, cookies, tokens, storageState,
and secret-manager item JSON follow the same exclusion rule unless separately
approved.

## 6. Report Generation Gate

Before generating:

- verify approved case count from source, not hand-entered numbers
- verify that repaired testcase rows have been rebuilt into the generated
  approved-case snapshot; do not rely on Markdown changes alone
- verify current execution results belong to the active module or suite
- normalize raw execution results into report statuses
- merge safe screenshot manifests only after redaction/safety checks
- preserve blocked and confirmation-needed rows in the normalized output

After generating:

- write a versioned archive directory
- refresh the latest mirror only as a convenience pointer
- write report postcheck data
- run secret scan over report data, latest mirror, archives, current execution,
  and network/evidence directories
- verify `passed=true`, `complete=true`, and no findings before handoff

## 6.1 Report Data Freshness After Repair

Case repair and report generation are separate stages. A repaired testcase row
does not change the report until the project's generated report inputs are
rebuilt.

For testcase-driven reports:

1. Identify the authoritative testcase source for the changed case ID. If a
   builder reads a child fragment, update that source before the merged pack or
   generated JSON.
2. Run the existing approved-case builder for every affected module or suite.
3. Verify the changed case IDs in the generated approved-case JSON.
4. If a report is requested, rebuild normalization from the current execution
   evidence and rebuilt approved-case snapshot.
5. Verify the changed case IDs in normalized data and in the versioned HTML
   archive. Refreshing only `latest` is not enough evidence.
6. If any layer was not rebuilt, state that the report is stale at that layer
   and give the exact next command.

Never manually edit generated approved-case JSON or normalized result JSON as
the primary fix unless the project lacks a builder and the exception is
recorded. Generated JSON is a cache or report input, not the testcase source of
truth.

## 7. Postcheck And Audit

A report postcheck should verify:

- expected pages exist
- charts or summary components exist when required
- navigation links and anchors are clickable
- full case rows rendered equals approved denominator
- module anchors match the module or functional-area groups
- screenshot manifest and lightbox behavior match policy
- latest mirror points to the intended report
- no old module labels, hardcoded counts, or stale routes leaked into the report
- changed case IDs from recent repairs are reflected in approved JSON,
  normalized data, and HTML when a refreshed report was requested
- secret scan is current and clean

Report audit should distinguish:

- testcase-pack quality
- automation-spec quality
- execution-report quality
- mixed-bundle quality

Passing the report audit means the report is honest about evidence and
boundaries. It does not mean every business behavior in the product passed.

## 8. Layered Report Naming

For layered admin/backoffice QA, include scope and layer in report naming when
useful:

- `module-l2-page-functional-area_<timestamp>_v<version>`
- `module-l3-business-state_<timestamp>_v<version>`
- `cross-module-l4-e2e_<timestamp>_v<version>`
- `all-modules-case-level_<timestamp>_v<version>`

The report body must state what the layer proves and what remains prohibited to
claim.
