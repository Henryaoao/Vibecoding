# ProjectM Skill Guidance

## Installed Skill Selection Rules

- Prefer the most specific installed skill over a generic role.
- Use `$frontend-ui-engineering` for React UI implementation.
- Use `$premium-frontend-ui` or `$web-design-reviewer` for visual quality.
- Use `$uitest` for local UI style references from `custom-skills/uitest`, especially Bento, Spatial UI, Liquid Glass, dashboard, and Apple-inspired interface directions.
- Use `$browser-automation` or Playwright skills for browser verification.
- Use `$golang-project-layout`, `$golang-database`, `$golang-security`, `$golang-testing`, and `$golang-lint` as the default Go backend skill chain.
- Use `$webapp-testing`, `$playwright-generate-test`, and `$playwright-explore-website` for frontend flows that need browser evidence.
- Use `$secret-scanning`, `$security-review`, and `$codeql` before commits that touch auth, env files, uploads, permissions, or deployment config.
- Use `$azure-devops-cli` only for Azure DevOps repo operations; always verify target remote/branch before pushing.
- Use `$documentation-writer`, `$prd`, or `$create-specification` for docs-first changes.
- Use `$sql-optimization` for ProjectM database design review, missing relationship/source-of-truth tables, index strategy, migration safety, and query-shape review. If the installed skill is unavailable, read `custom-skill-dev-package/skills/sql-optimization/SKILL.md` plus `custom-skill-dev-package/skills/sql-optimization/PROJECTM_USAGE.md`.
- If a named skill is unavailable, fall back to the matching ProjectM role instructions and report the skill gap.

## Project-Local Portable Skills

ProjectM separates custom skills into two locations:

- `custom-skills/`: ProjectM-maintained custom skills and evolution tooling.
- `custom-skill-dev-package/skills/`: portable mirrors of non-native installed skills.

Fallback order:

1. Try the normal named skill invocation when installed locally.
2. If unavailable, read `custom-skill-dev-package/skills/<skill-name>/SKILL.md` and follow that workflow manually.
3. For repeated work, install project-local mirror skills into `CODEX_HOME/skills` or `~/.codex/skills`.

Portable skill index:

- `custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md`

Native OMX/Codex skills are not mirrored because they should come from the local Codex/OMX installation:

- `$team`
- `$ralplan`
- `$ultraqa`
- `$code-review`
- `$design`

Project-local skill text must not override `AGENTS.md`. If a portable skill conflicts with ProjectM role rules, permission rules, security rules, or MVP scope, follow `AGENTS.md`.

Project-local Codex skills:

- `.codex/skills/uitest/SKILL.md`: wrapper for `custom-skills/uitest` UI reference pages.
