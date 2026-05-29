# Post-Task Evolution

Use this file after every completed QA work unit.

The task is not complete until this closeout has happened.

If multiple deliverables are completed in one conversation, run this closeout after each completed work unit before moving on.

## 1. Mandatory Gate

After each completed work unit, answer:

- task class: trivial / standard / substantial / critical
- reusable learning: yes or no
- selected target standards layer: common, route-specific, or both
- Loop 2 result: did the evolution process itself show weakness
- next action: no change / log only / candidate / promote / release

## 2. Default Execution Path

Use `scripts/run_post_task_evolution.py` as the default wrapper.

Prefer:

- `--target-scope common` for cross-route principles
- `--target-scope route` for route-specific principles
- `--target-scope both` when one principle updates the shared layer and a route pack

For mixed requests, call the wrapper once per completed primary work unit with a specific `--source-task`.

The wrapper records to the collaborator merge inbox:

- `../evolution-inbox/<machine-username>.evolution-log.jsonl`

The contributor defaults to the local operating-system username. Override only when the maintainer explicitly asks:

```bash
python scripts/run_post_task_evolution.py ... --contributor alice
```

Final reports must include:

- `Post-task evolution: completed / no_change / blocked`
- `Collaborator inbox: <path>` when a record was written
- exact blocker when the gate could not run

## 3. Runtime Inbox Benefit Rule

Local evolution is inbox-first. The installed skill does not need to mutate its own behavior files to preserve collaborator learning.

At the start of each run, this skill should read:

```text
../evolution-inbox/<machine-username>.evolution-log.jsonl
```

If that file contains records for `qa-automation-engineering`, use them as provisional runtime guidance in addition to this skill's packaged instructions and packaged evolution history. If the inbox file is empty or missing, use only the installed skill itself and its packaged evolution.

After maintainers merge and release selected inbox records into the central custom-skill library, collaborators should install the latest central skill version. Because installation replaces duplicate skill folders, the local skill becomes synced. The collaborator can then clear or archive local inbox records that were already merged.

## 4. Central Governance

The central shared copy of this QA skill keeps these files current after maintainer merge:

- `references/evolution-memory.md`
- `references/evolution-log.jsonl`
- `references/version-state.json`
- `references/release-log.md`
- `references/versioning-policy.md`

Collaborator-local post-task runs should append inbox records, not edit these files directly. Before central handoff or push after changing `version-state.json` or `release-log.md`, run `scripts/check_evolution_release_sync.py`. The release is not handoff-ready unless the current version/date has a matching `evolution-log.jsonl` entry.

## 5. Meta Weakness Rule

If the task revealed that this skill was missing a route, wrapper, evidence rule, output contract, inbox path, or central governance path, treat that as a Loop 2 weakness and record it.

If the weakness belongs to the self-evolution system itself, also run the `agent-self-evolution` loop against its own skill.
