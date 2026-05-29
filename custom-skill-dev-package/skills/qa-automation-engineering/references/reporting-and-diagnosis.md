# Reporting And Diagnosis

## Failure Ownership Ladder

Classify each material failure as one of:

- product defect
- script defect
- environment or data issue
- requirement gap
- confirmation needed
- mixed ownership

Explain why the chosen ownership is the best-supported call and what uncertainty remains.

## Evidence Bundle

Prefer to gather:

- command or runner invocation
- suite or case identifiers
- report path, trace, screenshot, video, or log path
- fixture or account context
- environment/build/version context

## Diagnosis Workflow

1. restate the failing behavior in observable terms
2. identify the nearest trustworthy evidence
3. separate product, script, environment, and requirement explanations
4. state what is verified versus inferred
5. name the next decisive check if uncertainty remains

## Report Contract

Execution and triage reports should usually include:

- totals and case counts when execution happened
- pass, fail, blocked, warning, and not-automated states when relevant
- failure ownership summary
- strongest evidence paths
- residual risks and next repair target

## Manager Progress Contract

For long-running manager-style QA work, status updates should include:

- total modules and completed modules
- active module, slug, coverage layer, and current gate
- case denominator and status distribution
- commands or checks just completed
- strongest evidence, execution, and report archive paths
- accepted warnings, blocked scope, and confirmation-needed scope
- current-module and overall progress estimates, labeled as estimates
- next decisive action

Update this at stage gates such as kickoff, evidence collection, testcase slice,
case audit, full case pack, automation mapping, script audit, execution,
normalization, report generation, postcheck, and closeout.

## Report Source Hygiene

Separate immutable evidence from convenience mirrors:

- use versioned report archives as evidence sources
- treat `latest` mirrors as pointers only
- label historical execution and report artifacts as stale after relevant
  testcase, script, fixture, helper, report, or environment changes
- state whether zero screenshots means a deliberate safety policy or missing
  artifacts
- run secret scans after sensitive evidence collection and report generation

## Report Data Freshness Gate

When testcase artifacts are repaired, the report data pipeline must be refreshed
or explicitly marked stale. Do not assume a report reads Markdown testcase files
directly.

Before saying a report reflects a repair, verify the changed case IDs in every
generated layer the project uses:

- authoritative testcase source, such as child fragments or the merged case pack
- generated approved-case JSON or approved denominator snapshot
- normalized result data
- screenshot manifest, when screenshots are part of the report
- versioned HTML archive and latest mirror, when HTML was regenerated

If only the Markdown testcase source changed, say that the report data has not
been refreshed and give the exact builder or report command that must run next.
If approved JSON was rebuilt but normalized data or HTML was not, name the fresh
layer and the stale layer separately. If the user asked for a refreshed report,
the task is not done until the changed case IDs are verified in normalized data
and in the generated HTML, or a precise blocker is recorded.

## HTML Report Template Work

When a project has an HTML report template, treat it as a report contract rather
than decorative styling. Load the local template first, then preserve:

- required pages and navigation
- approved case denominator and status buckets
- case-level rows rather than spec-only summaries
- screenshot and sensitive artifact policy
- versioned archive plus latest mirror separation
- report postcheck and secret scan requirements
- module or layer naming, such as L2 page baseline or L3 business-state report

Use `references/html-report-template-capability.md` for reusable rules and the
project template for local details.

## Red Flags

Do not ship a diagnosis that:

- calls the product broken without ruling on script or environment evidence
- calls the script broken without checking requirement or data assumptions
- omits the report or artifact path behind a major claim
- hides that a conclusion is still confirmation-needed
