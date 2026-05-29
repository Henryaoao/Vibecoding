# Install Handoff

Use this when auditing or sharing the `adaptive-audit` skill as a standalone
skill package.

## Required Runtime Boundary

`adaptive-audit` can be read and used for ordinary audit reasoning by itself.
Its collaborator-local post-audit evolution closeout writes to the sibling
`evolution-inbox/`. Maintainer canonical evolution/release work requires the
`agent-self-evolution` skill scripts.

For a normal install, place these skills as siblings:

- `adaptive-audit`
- `agent-self-evolution`

The default wrapper resolves `agent-self-evolution` in this order:

- sibling skill directory beside `adaptive-audit`
- `$CODEX_HOME/skills/agent-self-evolution`
- current user's home skill directory

If the dependency is installed elsewhere for maintainer canonical writes, pass
`--evolution-skill-dir` to `scripts/run_post_audit_evolution.py`.

## Fresh Install Preflight

Before declaring a shared package release-ready, run:

- structural skill validation
- `scripts/check_evolution_release_sync.py`
- `scripts/check_shareability_residue.py`
- a dry-run post-audit closeout against the intended install layout

Missing `agent-self-evolution` should fail closed for maintainer canonical
writes with an actionable preflight message. It must not be treated as a
successful canonical evolution closeout.

## Package Cleanliness

Do not package generated caches or local task residue:

- `__pycache__`
- `.pyc` or `.pyo` files
- local reports, screenshots, traces, or private ledgers
- checked-in secret artifacts or secret-manager exports
