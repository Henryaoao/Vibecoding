# Post-Audit Evolution

Use this file after every completed adaptive-audit artifact review.

The artifact audit is not complete until this closeout has happened.

If multiple artifacts are being audited inside one conversation, run this closeout after each artifact before moving to the next one.

## 1. Mandatory Gate

After each completed artifact audit, answer:

- task class: trivial / standard / substantial / critical
- audit execution mode: independent-child-audit / manager-fallback-audit /
  dry-run-audit / self-check
- reusable learning: yes or no
- selected target standards layer: common, domain-specific, or both
- Loop 2 result: did the evolution process itself show weakness
- next action: no change / log only / candidate / promote / release

If the audit used manager fallback because an independent audit timed out or
errored, record that as process evidence. Do not promote the result to an
independent audit pass.

## 2. Default Execution Path

Use `scripts/run_post_audit_evolution.py` as the default wrapper.

Prefer:

- `--target-scope common` for cross-domain principles
- `--target-scope domain` for domain-specific principles
- `--target-scope both` when one principle updates both the common layer and a domain pack

For multi-artifact batches, call the wrapper once per artifact with an artifact-specific `--source-task` or equivalent identifier so the evolution history stays traceable at file level.

Read-only and review-control patterns:

- `--dry-run` prints the inbox or canonical payload without writing files
- `--skip-review` stops after the record-or-skip decision and does not run the
  backlog review, suggestion, or proposal commands
- `--record-no-change` writes an explicit `status=no_change` entry; without it,
  a no-change closeout stays console-only
- use `--dry-run --skip-review` for a fully read-only rehearsal of the closeout
- ordinary collaborator runs append only to
  `../evolution-inbox/<machine-username>.evolution-log.jsonl`
- canonical writes to `references/evolution-memory.md` and
  `references/evolution-log.jsonl` require `--allow-canonical-write` and are
  reserved for maintainer merge/release work

## 3. Runtime Inbox Governance

Collaborator-local audit evolution is inbox-first. The installed skill does not
mutate its own canonical evolution files during ordinary use.

At the start of each run, this skill should read:

```text
../evolution-inbox/<machine-username>.evolution-log.jsonl
```

If that file contains records for `adaptive-audit`, use them as provisional
runtime guidance in addition to this skill's packaged instructions and packaged
evolution history. If the inbox file is empty or missing, use only the installed
skill itself and its packaged evolution.

## 4. Central Governance

When maintainers merge and release adaptive-audit evolution, keep these files current:

- `references/evolution-memory.md`
- `references/evolution-log.jsonl`
- `references/version-state.json`
- `references/release-log.md`

When the change is a release, set `references/version-state.json` `release_id`
to the stable source task used for the release evolution record. The release
sync check requires an exact `release_id`/`source_task` match so same-day
maintenance records cannot satisfy the gate accidentally.

Collaborator-local post-audit runs should append inbox records, not edit these
files directly. Before central handoff or push after changing
`version-state.json` or `release-log.md`,
run `scripts/check_evolution_release_sync.py`. The release is not handoff-ready
unless the current version/date has a matching `evolution-log.jsonl` entry.

Before claiming a skill is white-labeled or shareable, scan raw governance
ledgers as well as summaries. Use `scripts/check_shareability_residue.py`; its
default package-local deny inventory lives at
`references/shareability-deny-patterns.json`. Add task-specific
`--deny-pattern` values only when auditing additional known source-project
terms that are not already in the package inventory.

## 5. Meta Weakness Rule

If the audit revealed that the evolution workflow was missing an execution path, inbox path, maintainer-only canonical history path, versioning, or a clear closeout contract, treat that as a Loop 2 weakness and evolve `agent-self-evolution` as well.
