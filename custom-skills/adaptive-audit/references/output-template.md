# Output Template

## Domain

- artifact identifier or file under review
- selected domain
- selected internal subtype when the domain is `test-artifact`
- audit execution mode and evidence strength when the domain is `test-artifact`
- selected release surface when the domain is `skill-release`
- standards family
- why this routing is correct

## Rule Stack

- common rules applied
- domain rules applied
- whether any cross-domain standard is implicated

## Audit Conclusion

- overall readiness
- major risk concentration
- whether the conclusion is an independent pass, manager fallback, dry-run
  result, or self-check preflight

## Findings

- missing or weak standard
- implicated subtype or execution stage when relevant
- impact
- evidence label

## Evidence Paths And Reporting Contract

- strongest artifact path, row ID, or observed section behind each major claim
- when the domain is `test-artifact`, state whether the evidence is testcase
  definition, automation design, suite-smoke output, generic interaction
  health, or case-specific assertion evidence
- for execution reports, state the raw status vocabulary or counter semantics
  and whether totals come from raw rows or normalized buckets
- for module or suite reports, state whether current-run inputs, immutable
  archive paths, latest mirrors, screenshot policy, and secret scan freshness
  were verified
- for skill-release audits, state whether `SKILL.md`, `agents/openai.yaml`,
  references, scripts, assets, version files, release log, evolution log,
  install path, and validation commands were inspected

## Recommended Corrections

- what should change
- what should be verified next
- for skill-release audits, state whether the correction belongs in trigger
  metadata, domain references, scripts, validation gates, release governance,
  or shareability cleanup

## Post-Audit Evolution Gate

- artifact-level closeout completed: yes or no
- task class
- reusable learning: yes or no
- next action: no change / log only / candidate / promote / release
- if no, explicit `no change`

## Evolution Conclusion

- whether reusable learning exists
- whether it is domain-specific or cross-domain
- what standards family should absorb it
- whether the learning was recorded, promoted, released, or deferred
- whether Loop 2 found a weakness in the evolution process itself
