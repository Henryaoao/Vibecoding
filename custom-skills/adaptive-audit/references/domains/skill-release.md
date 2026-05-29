# Skill Release Standards Pack

Use this pack when auditing a Codex skill folder, bundled skill package, skill
release, skill installation handoff, or skill hardening request.

Apply this pack in addition to `references/common-checklist.md`.

## 1. Trigger And Interface Contract

Check:

- `SKILL.md` frontmatter has a clear `name` and trigger-worthy `description`
- the description names the real task surfaces the skill should own
- `agents/openai.yaml`, when present, matches the skill's current capabilities
- the default prompt does not overfit to one project or user
- the skill can be invoked by someone who has not seen the original project

## 2. Progressive Disclosure And Scope

Check:

- `SKILL.md` stays lean and points to references only when needed
- domain, framework, provider, or workflow variants live in separate references
- references are directly discoverable from `SKILL.md`
- scripts are used for fragile or repeatable checks instead of prose-only rules
- bundled files are necessary for the skill's function, not process clutter

## 3. Portability And Shareability

Check:

- no machine-specific absolute paths, usernames, workspace names, or drive roots
- no project-specific names remain unless they are intentionally examples
- local template or asset paths are treated as discoverable/project-provided
- dependency discovery uses sibling skill paths, environment variables, or the
  current user's home directory rather than fixed local folders
- examples and evolution history are white-labeled when the skill is meant to be
  shared outside the originating project
- source-project deny-pattern inventories are package-local release gates, and
  raw governance ledgers must pass the default inventory before a white-label
  claim is accepted

## 4. Validation Gates

Check:

- the skill passes structural validation
- referenced scripts can run or provide a clear preflight failure
- JSON, YAML, JSONL, and Markdown governance files parse where relevant
- release/version files are synchronized
- if the skill maintains evolution files, the current release has a matching
  evolution-log entry
- handoff checks fail closed when mandatory skill-release gates are missing
- raw governance ledgers are scanned for local paths, project residue, and
  source-project terms before any white-label or shareability claim is accepted

## 5. Dependency And Install Handoff

Check:

- required sibling skills, plugins, CLIs, runtimes, or templates are named as
  dependencies instead of implied by local machine state
- missing dependencies produce an actionable preflight failure, not a silent
  partial run
- install or copy steps describe the skill folder boundary and do not depend on
  the original repository layout
- standalone skill packages include or reference their dependency handoff
  contract inside the package, not only in a parent repository README
- validation commands can be run from a fresh install location
- optional dependencies have an explicit degraded mode or a clear stop rule

## 6. Bundled Resource Contract

Check:

- every `scripts/`, `references/`, `assets/`, or `agents/` file exists for a
  reason tied to the skill's runtime behavior
- generated caches such as `__pycache__` and `.pyc` files, private ledgers,
  one-off reports, local screenshots, and process notes are excluded from
  shared skill packages even when they are ignored by version control
- references are named and routed so another agent can discover the right file
  without knowing the source project
- assets and templates are treated as project-provided inputs unless they are
  actually bundled in the skill

## 7. Evolution Governance

Check:

- post-task or post-audit evolution is explicit when the skill claims evolution
- evolution logs distinguish no-change, logged, candidate, promoted, released,
  and deferred outcomes
- release logs describe actual skill-body changes, not only task history
- version bumps match the blast radius of the change
- self-evolution scripts do not silently edit standards without reviewable
  records

## 8. Security And Secret Safety

Check:

- skill instructions do not ask users to paste secrets into chat
- secret-manager workflows use local prompts and redaction boundaries
- scripts and examples avoid checked-in tokens, cookies, storage state, or raw
  secret-manager exports
- report, screenshot, trace, and generated artifact policies exclude sensitive
  values unless explicitly approved by the project

## 9. Release Verdict

A skill-release audit should report:

- release-ready / release-ready-with-warnings / not-release-ready
- blocking issues by file path and rule
- shareability risks
- validation commands run and results
- dependency and install-handoff readiness
- bundled-resource and cache cleanliness
- whether release, version, and evolution records are synchronized
- whether raw governance ledgers support any white-label/shareability claim
- exact follow-up changes needed before sharing or publishing
