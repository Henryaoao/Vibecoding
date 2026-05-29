# PRD Standards Pack

Use this pack when the artifact is a PRD, BRD, feature spec, page spec, or requirements document.

Apply this pack in addition to `references/common-checklist.md`.

## 1. Minimum Standards

Check:

- actual requirement language instead of writing advice
- clear scope: master, domain, page, or flow
- role, route, goal, structure, rules, scenarios, and automation contract
- if this is a master or umbrella PRD, a concrete child-artifact traceability matrix and explicit `covered` or equivalent exit criteria
- if this PRD declares shared-rule artifacts as mandatory, those artifacts must exist in the current deliverable set or be explicitly outside the current scope

## 2. Interaction Standards

For each meaningful action, require:

- precondition
- user action
- system response
- success result
- failure result
- observable outcome

## 3. Validation Standards

For each form or submit path, require:

- empty input behavior
- invalid format behavior
- boundary behavior
- cross-field behavior
- submit success
- submit failure
- state echo after refresh when relevant
- layered failure observability when relevant, including field-level feedback, page-level or global feedback, whether the request is blocked or still sent, and the backend outcome if a request still occurs
- explicit treatment of conflicting or duplicate feedback layers so the PRD can distinguish the intended behavior from the currently observed implementation

## 4. State Standards

Require explicit states, transitions, owners, and visible feedback for:

- draft
- pending
- approved
- rejected
- cancelled

or equivalent domain states.

## 4A. Shared-Rule and Master-PRD Standards

Require:

- explicit precedence order when multiple sources can decide one output, such as language priority, ownership priority, or context priority
- explicit fallback behavior when the preferred branch is unavailable
- explicit default branch when no preferred source exists
- no unresolved `A or B` alternatives in global-rule PRDs unless the condition deciding each branch is also defined

## 5. Multilingual Standards

If multiple languages exist, require:

- language differences
- cross-language invariants
- language priority rules
- legal or compliance text consistency

## 6. Automation Standards

Require:

- stable route or entry contract
- explicit execution context axes when relevant, including role, login state, language, platform, mode, or environment
- stable assertions
- explicit dynamic-value handling
- clear success and failure checkpoints
- explicit statement of whether important negative paths are blocked locally or still sent to the backend
- explicit backend failure outcome or page failure result when the request is still sent
- semantic error assertions by default for validation and feedback, unless the text is legal, compliance-critical, security-sensitive, or being audited for wording quality, typo, or misleading copy
