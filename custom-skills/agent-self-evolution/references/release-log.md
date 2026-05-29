# Release Log

## Current Version

- Version: 1.5.1
- Date: 2026-05-26
- Summary: Locked canonical evolution writes behind maintainer-only approval so collaborator evolution records go to inbox only.

## Releases

### 1.5.1 - 2026-05-26

- Made `scripts/record_insight.py` fail closed for non-dry-run canonical history writes unless `--allow-canonical-write` is passed.
- Added `--allow-canonical-write` to `scripts/run_evolution_cycle.py` and pass-through recording so canonical `evolution-memory.md` / `evolution-log.jsonl` writes are deliberate maintainer actions.
- Clarified that collaborator-local evolution records must be written only to a host skill's sibling `evolution-inbox/` and wait for maintainer consolidation.

### 1.5.0 - 2026-05-25

- Added cross-project white-label rules so shared skill evolution records must remove project, customer, repository, ticket, environment, internal-system, and one-project module identifiers before logging or promotion.
- Clarified that host skills can use either sibling inbox records for collaborator-local unmerged learning or canonical history for maintainer releases.
- Updated the ready-to-embed integration clause so host skills must white-label cross-project records before writing to an approved inbox or canonical history path.

### 1.0.0 - 2026-04-29

- Established the independent `agent-self-evolution` meta-skill.
- Added a double-loop evolution model for target change and evolution-process change.
- Added target selection, anti-overfit rules, and change-decision guidance.
- Added structured logging, proposal, and release-governance scripts.

### 1.1.0 - 2026-04-29

- Added a universal agent integration contract, mandatory post-task gate, and loop-aware self-evolution tooling.
- Added a reusable integration contract so any future agent can adopt the post-task gate consistently.
- Added Loop 2 meta-optimization checks and richer output requirements.
- Added run_evolution_cycle.py plus loop-aware logging, review, and change-suggestion support.

### 1.2.0 - 2026-04-29

- Added domain-aware evolution so reusable agents can improve the correct standards family instead of mixing all learning together.
- Added domain-key, standard-family, and standard-area support to self-evolution logging.
- Updated review and suggestion tooling to keep promotion pressure separated by domain.
- Extended the integration contract and output model with explicit domain-target selection.

### 1.3.0 - 2026-04-29

- Added host-skill integration enforcement so mandatory self-evolution requires a real execution path, an approved recording path, and Loop 2 enforcement.
- Strengthened the integration contract so reusable skills that claim self-evolution must provide a concrete wrapper or default invocation path.
- Added Loop 2 checks for host-skill inbox/canonical records, version state, and release tracking when the host skill itself evolves.
- Updated prompts and decision guidance so missing execution paths are treated as real meta-evolution weaknesses.

### 1.4.0 - 2026-04-29

- Made self-evolution artifact-scoped for multi-unit work so each completed file or subtask must run its own gate before batch wrap-up.
- Strengthened the integration contract so multi-artifact conversations must run the post-task gate per completed unit.
- Added Loop 2 checks to catch delayed end-of-conversation evolution when per-artifact gates were required.
