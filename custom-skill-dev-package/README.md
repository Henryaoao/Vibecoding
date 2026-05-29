# ProjectM Custom Skill Dev Package

This folder contains portable copies of non-native skills used by ProjectM
agents. They are separated from `custom-skills/` so the core custom skill
workspace stays focused on skills maintained directly by this project.

## What Belongs Here

- Mirrored third-party or local installed skills that ProjectM agents may need.
- Skill fallback packages for collaborators who do not have the same global
  Codex or OMX skill installation.
- Project-specific usage notes for mirrored skills, such as
  `skills/sql-optimization/PROJECTM_USAGE.md`.

## What Does Not Belong Here

- Project-maintained self-evolving skills.
- Evolution inbox tools and canonical evolution merge process files.
- New experimental ProjectM-authored skills before they are accepted as core.

Those stay in:

```text
custom-skills/
```

## Folder Layout

```text
custom-skill-dev-package/
  README.md
  PROJECTM_PORTABLE_SKILLS.md
  skills/
    prd/
    sql-optimization/
    golang-database/
    ...
```

## Fallback Rule

When a referenced `$skill` is not installed on a collaborator's machine:

1. Look up the skill in `PROJECTM_PORTABLE_SKILLS.md`.
2. Read `skills/<skill-name>/SKILL.md`.
3. Follow that workflow manually.
4. If the skill will be used repeatedly, copy `skills/<skill-name>/` into
   `$CODEX_HOME/skills` or `~/.codex/skills`.

## Maintenance Rule

If a mirrored skill is updated from the author's machine, replace the matching
folder under `skills/` and update `PROJECTM_PORTABLE_SKILLS.md` if the path,
purpose, or usage notes changed.
