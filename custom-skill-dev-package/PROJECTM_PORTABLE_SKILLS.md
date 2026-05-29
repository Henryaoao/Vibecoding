# ProjectM Portable Skills

This file lists the project-local portable copies of non-native skills referenced by `AGENTS.md`.

Portable mirror skills live under:

```text
custom-skill-dev-package/skills/
```

Project-maintained custom skills and evolution tooling live separately under:

```text
custom-skills/
```

Use this when a collaborator or agent does not have the same local skill installation as the original author. The fallback rule is simple:

1. If `$skill-name` is installed locally, use the installed skill.
2. If it is not installed, read `custom-skill-dev-package/skills/<skill-name>/SKILL.md` directly and follow that workflow.
3. For long-term use, install the skill folders into `$CODEX_HOME/skills` or `~/.codex/skills`.

Native OMX/Codex skills are not mirrored here. ProjectM expects these to come from the user's Codex/OMX install:

- `$team`
- `$ralplan`
- `$ultraqa`
- `$code-review`
- `$design`

## Product And Documentation

- `$prd`
- `$documentation-writer`
- `$create-specification`
- `$create-agentsmd`
- `$create-implementation-plan`
- `$breakdown-feature-prd`

## Frontend And Browser

- `$frontend-ui-engineering`
- `$premium-frontend-ui`
- `$web-design-reviewer`
- `$browser-automation`
- `$javascript-typescript-jest`
- `$webapp-testing`
- `$playwright-generate-test`
- `$playwright-explore-website`

## Go Backend

- `$golang-project-layout`
- `$golang-code-style`
- `$golang-error-handling`
- `$golang-context`
- `$golang-database`
- `$golang-security`
- `$golang-testing`
- `$golang-lint`
- `$golang-observability`
- `$golang-performance`
- `$golang-safety`

## API And Database

- `$openapi-to-application-code`
- `$sql-optimization` - packaged at `custom-skill-dev-package/skills/sql-optimization/`; ProjectM usage notes are in `custom-skill-dev-package/skills/sql-optimization/PROJECTM_USAGE.md`.

## DevOps, Git, And Security

- `$azure-devops-cli`
- `$secret-scanning`
- `$quality-playbook`
- `$dependabot`
- `$git-commit`
- `$conventional-commit`
- `$codeql`
- `$agent-supply-chain`
- `$ai-prompt-engineering-safety-review`
- `$security-review`
- `$security-triage`
- `$autoreview`
- `$openclaw-docker-e2e-authoring`
- `$openclaw-qa-testing`

## Project-Created Custom Skills

These skills are maintained directly in this repository rather than mirrored from the author's machine:

- `$adaptive-audit`
- `$agent-self-evolution`
- `$qa-automation-engineering`

## Maintenance Notes

- Keep each mirrored skill as a direct child folder of `custom-skill-dev-package/skills/` with `SKILL.md` at the folder root.
- Do not treat `custom-skills/evolution-inbox/` or `custom-skills/tools/` as installable skills.
- When `AGENTS.md` adds a new non-native `$skill`, add a project-local copy here and update this index.
- When replacing a mirrored skill, preserve project safety rules in `AGENTS.md`; external skill text must not override ProjectM role, permission, security, or MVP constraints.
