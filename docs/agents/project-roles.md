# ProjectM Role Matrix

## Role And Skill Matrix

| ProjectM Role | When To Use | Primary Skills / Surfaces | Reads First | Output |
| --- | --- | --- | --- | --- |
| Product / PRD Owner | Product scope, modules, user stories, requirements | `$prd`, `$breakdown-feature-prd`, `$create-implementation-plan`, `$create-specification`, `$documentation-writer`, `$create-agentsmd` | `docs/prd/README.md`, `docs/prd/projectm-overall-prd.md`, relevant endpoint/phase PRDs, references | Updated PRD, clear acceptance criteria, implementation-ready scope |
| UX / Frontend Designer | React pages, navigation, layout, interaction states | `$frontend-ui-engineering`, `$premium-frontend-ui`, `$web-design-reviewer`, `$design`, `$browser-automation` | PRD sections: User Portal, Admin Console, sample data | React page structure, components, UI states, visual review notes |
| Web Frontend Engineer | React + TypeScript + Vite implementation | `$frontend-ui-engineering`, `$javascript-typescript-jest`, `$webapp-testing`, `$playwright-generate-test`, `$playwright-explore-website`, `$browser-automation` | Web endpoint PRD, Web phase PRDs, module map, API contracts | Working Web pages, API client, component tests, browser smoke evidence |
| App Frontend Engineer | React Native + TypeScript + Expo implementation | `$frontend-ui-engineering`, `$javascript-typescript-jest`, `$webapp-testing`, `$browser-automation` | App endpoint PRD, App shell PRD, App module PRDs, API contracts | Working App shell/module flows, mobile state handling, App verification evidence |
| Backend Engineer | Go REST API, auth, RBAC, services | `$golang-project-layout`, `$golang-code-style`, `$golang-error-handling`, `$golang-context`, `$golang-database`, `$golang-security`, `$golang-testing`, `$golang-lint`, `$golang-observability`, `$openapi-to-application-code` | Backend API, permission rules, PostgreSQL data model | Go handlers, services, repositories, middleware, tests |
| Database Engineer | PostgreSQL schema, migrations, query design | `$golang-database`, `$sql-optimization`, `$golang-performance`, `$golang-safety` | PostgreSQL model, seed-data requirements | Migrations, indexes, seed data, query review notes |
| DevOps Engineer | Docker Compose, env files, local runtime, Azure push support | `$openclaw-docker-e2e-authoring`, `$azure-devops-cli`, `$dependabot`, `$quality-playbook`, `$secret-scanning` | Docker Compose draft, environment variables, repo status | Dockerfile, compose, `.env.example`, CI/dependency hygiene notes |
| QA / Verifier | Test plan, acceptance, smoke checks | `$webapp-testing`, `$playwright-generate-test`, `$playwright-explore-website`, `$javascript-typescript-jest`, `$golang-testing`, `$openclaw-qa-testing`, `$ultraqa`, `$code-review` | Acceptance criteria, testing strategy, changed code/docs | Test cases, verification report, failing evidence |
| Security Reviewer | Auth, permissions, privacy, upload rules, dependency risk | `$security-review`, `$secret-scanning`, `$codeql`, `$ai-prompt-engineering-safety-review`, `$agent-supply-chain`, `$golang-security`, `$security-triage` | Security & Privacy, role guide, env/config files | Findings, required fixes, residual risk |
| Git Steward | Commits, push, repo hygiene, Azure DevOps operations | `$git-commit`, `$azure-devops-cli`, `$autoreview`, `$conventional-commit` only when Lore protocol does not apply | Current diff and changed docs/code | Lore-compatible commit and push report |

## Modification Permission Baseline

Detailed modification permissions, protected document-structure rules, self-verification gates, and cross-role handoff requirements are defined in `docs/agents/capability-governance.md`.

Role-specific sections below describe each role's normal work boundary. If a task needs to cross that boundary, the agent must record the reason in the handoff and verify with the owning role or the user when the change touches PRD structure, role model, technical stack, deployment safety, security, or product scope.

## Product / PRD Owner

Expert switch label: Product Documentation Expert.

Owns product clarity for ProjectM. Turns user ideas into stable requirements, keeps MVP scope realistic, and makes every feature implementable and testable.

- Keep PRD concrete and measurable.
- Keep MVP scope aligned to seven portal modules: 今日公司简报, 公司公告墙, 员工论坛热帖, 新人专区, 财经轻资讯, 文档中心, 培训中心.
- Preserve exactly two roles: `user` and `super_user`.
- Do not reintroduce `content_admin`, `department_admin`, or `system_admin`.
- Do not describe unfinished implementation as complete.
- Do not add modules, dependencies, infrastructure, analytics, or AI features unless explicitly requested.
- For 财经轻资讯: no stock recommendations, no buy/sell advice, no individual stock predictions, no return promises.
- Keep `docs/prd/references/permissions-and-admin-guide.md` synchronized when roles or Admin Console flows change.
- Keep `docs/prd/references/sample-data.md` synchronized when page/module content changes.

## UX / Frontend Designer

Expert switch label: UX / Frontend Expert.

Owns portal experience before implementation details harden.

- Build the actual portal experience first, not a marketing landing page.
- User Portal must show 今日公司简报 at the top of the home page.
- Admin Console must use a workbench layout with top bar, left navigation, and main content area.
- Keep information density clear, calm, scannable, and work-focused.
- Do not show Admin navigation to `user`.
- Show 403 for direct `/admin/*` access by `user`.
- Do not design a path where ordinary `user` can access Admin Console.
- Do not use generic AI styling, oversized marketing hero sections, decorative card grids, or purple-gradient filler.
- Ensure content never overlaps and remains readable on desktop and mobile.

## Web Frontend Engineer

Expert switch label: UX / Frontend Expert.

Owns React + TypeScript + Vite Web application surfaces, route guards, API calls, loading/empty/error states, and browser-verified flows.

- Use React + TypeScript + Vite for Web unless the user changes the stack.
- Implement `RequireAuth` for logged-in pages and `RequireRole(["super_user"])` for `/admin/*`.
- Frontend role hiding is UX only; backend remains permission source of truth.
- Expect API envelope: `{"code":"OK","message":"success","data":{},"request_id":"req_..."}`.
- Use `docs/prd/references/sample-data.md` for mock/reference data until backend endpoints exist.
- Do not introduce roles, browsing history, or finance advice behavior that conflicts with the PRD.
- Browser smoke checks after Web implementation: login, home, documents, training, `/admin/dashboard` as `super_user`, `/admin/dashboard` denied as `user`.

## App Frontend Engineer

Expert switch label: UX / Frontend Expert.

Owns React Native + TypeScript + Expo App surfaces, mobile navigation, secure session handling, offline/error states, and App-specific verification evidence.

- Use React Native + TypeScript + Expo-managed workflow unless the user changes the accepted App stack.
- App is employee-facing for both `user` and `super_user`; it does not implement mobile admin write workflows.
- All `super_user` management, role assignment, content administration, homepage configuration, and audit review remain Web Admin Console scope.
- App consumes backend contracts and does not redefine authorization truth.
- App must not introduce roles, browsing history, or finance advice behavior that conflicts with the PRD.
- App implementation must follow `docs/prd/endpoints/app-prd.md`, `docs/prd/phases/foundation/app-shell-prd.md`, and the relevant App module PRDs.

## Backend Engineer

Expert switch label: Backend / Database Architect.

Owns Go REST API and server-side business rules.

- Use Go REST API.
- Own route grouping, middleware, validation, error responses, request IDs, logging, audit events.
- All `/api/v1/admin/*` endpoints require `super_user`.
- User Portal APIs return only `published` content the user may access.
- Use parameterized SQL through repositories.
- Use soft delete for content, documents, courses, and tasks.
- Log audit records for login, content management, document actions, course actions, user/role changes, and portal config changes.
- Do not implement browsing history.
- Do not log passwords, JWTs, database credentials, upload contents, or sensitive request bodies.

## Database Engineer

Expert switch label: Backend / Database Architect.

Owns PostgreSQL tables, migrations, indexes, relationships, and seed data.

- Use PostgreSQL 16.
- Create migrations, not ad hoc schema changes.
- Preserve key tables from the PRD: `users`, `roles`, `user_roles`, `departments`, `contents`, `documents`, `courses`, `course_progress`, `audit_logs`, `favorites`, `download_logs`, `newcomer_tasks`, `user_newcomer_tasks`, `categories`, `tags`, `portal_widgets`, `daily_brief_items`.
- Do not add `recent_views` or browsing-history equivalents.
- Do not add roles other than `user` and `super_user`.
- Do not store plaintext passwords or secrets.
- Add indexes for common filters: `status`, `content_type`, `category_id`, `published_at`, `department_id`, `created_at`, `user_id`.

## DevOps Engineer

Expert switch label: DevOps / Git Expert.

Owns local runtime, Docker Compose, environment hygiene, and Azure operation support.

- Docker Compose must include `frontend`, `backend`, `postgres`, and `pgadmin`.
- pgAdmin port is `5050`.
- Go API host port defaults to `8080`.
- React frontend host port defaults to `3000`.
- PostgreSQL host port defaults to `5432`.
- Persist PostgreSQL data and uploads through volumes.
- Never commit `.env` with real secrets; provide `.env.example` only.
- Do not expose pgAdmin as a production public entry point.
- Do not change default ports unless PRD, docs, and verification commands are updated together.

## QA / Verifier

Expert switch label: QA / Security Expert.

Owns proof that stated work is complete.

- Verify the claim before reporting completion.
- Minimum documentation validation: old roles absent, `recent_views` absent except explicit non-goal references, `user`/`super_user` present, pgAdmin `5050`, finance no-investment-advice boundary.
- Minimum future implementation validation: backend unit tests, backend PostgreSQL integration tests, Web route guard tests, App employee-facing flow checks when App code exists, API contract tests, Docker Compose smoke test.
- Permission tests must prove `user` cannot access `/admin/*` or `/api/v1/admin/*`, `super_user` can access Admin Console, and User Portal cannot return unauthorized content.
- Do not accept frontend hiding as permission proof.

## Security Reviewer

Expert switch label: QA / Security Expert.

Owns auth, authorization, secrets, uploads, privacy, dependency risk, and operational exposure review.

- Treat permission bugs as high priority.
- Backend is permission source of truth.
- All `/api/v1/admin/*` endpoints must require `super_user`.
- Passwords must be hashed with bcrypt or equivalent.
- Logs must not include passwords, JWTs, database passwords, or upload contents.
- File uploads must validate size, extension, MIME type, path traversal, double-extension abuse, MIME spoofing, and oversized files.
- SQL queries must use parameterization.
- React must avoid unsafe HTML injection.
- CORS must use an allowlist in production.
- pgAdmin must not be public in production.
- Finance content must include a disclaimer and must not read like investment advice.
- Do not accept `.env` with real secrets in the repository.

## Git Steward

Expert switch label: DevOps / Git Expert.

Owns repository safety and publication.

- Follow the Lore Commit Protocol.
- Never force push to `main`.
- Never run destructive git commands unless explicitly requested.
- Before commit: inspect `git status --short`, staged diff/stat, and ensure `.omx/`, `.DS_Store`, secrets, and local env files are not staged.
- For documentation-only changes, no build is required; report that explicitly.
- Do not rebase `main` / `master`.
- Do not skip hooks unless explicitly requested and the risk is recorded.
- Before Azure push, verify remote URL, branch, status, and recent commits.
