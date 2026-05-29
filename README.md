# ProjectM

ProjectM is a multi-end internal company portal project. The repository now includes the first runnable frontend/backend slice for the user portal, plus split PRD sources, agent guidance, PostgreSQL schema, Docker setup, and portable skill support.

## Product Scope

MVP modules:

- 今日公司简报
- 公司公告墙
- 员工论坛热帖
- 新人专区
- 财经轻资讯
- 文档中心
- 培训中心

Technology direction:

- Web frontend: React + TypeScript + Vite
- App frontend: React Native + TypeScript + Expo-managed workflow
- Backend: Go REST API
- Database: PostgreSQL 16
- Runtime: Docker Compose
- pgAdmin port: `5050`
- Roles: `user` and `super_user` only

## Important Documents

- `docs/prd/README.md`: PRD hierarchy, source-of-truth precedence, and reading order.
- `docs/prd/projectm-overall-prd.md`: stable ProjectM product constitution.
- `docs/prd/endpoints/`: endpoint-specific Web and App PRDs.
- `docs/prd/references/`: permissions/Admin guide, sample data, and OMX decision policy.
- `docs/prd/phases/`: foundation PRDs and 28 module × technical-layer PRDs for OMX execution.
- `docs/diagrams.md`: visual diagrams for architecture, roles, modules, database, Docker, and agent workflow.
- `AGENTS.md`: short agent operating contract.
- `agentschinese.md`: Chinese agent operating guide.
- `docs/agents/`: split agent guidance for OMX workflows, ProjectM roles, skills, and verification.
- `docs/engineering/codex-pre-edit-hook.md`: team setup guide for the Codex pre-edit git sync and collaboration-risk hook.
- `custom-skills/`: ProjectM-maintained custom skills and evolution tooling.
- `custom-skill-dev-package/`: portable mirror skills for collaborators who do not have the same local skill installation.

## Agent Guidance

Start with `AGENTS.md`. For details:

- `docs/agents/omx-workflows.md`: how OMX workflow skills map to ProjectM work.
- `docs/agents/project-roles.md`: Product, UX, Frontend, Backend, Database, DevOps, QA, Security, and Git roles.
- `docs/agents/skills.md`: installed skill selection and portable skill fallback.
- `docs/agents/verification.md`: checks to run before claiming completion.

If a collaborator does not have the same global skills installed, use:

```text
custom-skill-dev-package/skills/<skill-name>/SKILL.md
```

The portable skill index is:

```text
custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md
```

Install the Project-M Codex pre-edit hook once per machine to sync safely before Codex writes code and warn on collaboration hotspots:

```bash
node scripts/install-codex-pre-edit-hook.mjs
```

## Current Status

This repository now has a PRD-aligned runnable app baseline. Source code lives under `ProjectM-source-code/`; root docs remain the shared documentation source.

- `ProjectM-source-code/frontend/`: React + TypeScript + Vite user portal.
- `ProjectM-source-code/backend/`: Go REST API using MVC layering and `pgxpool` against PostgreSQL.
- `ProjectM-source-code/database/`: PostgreSQL schema, migrations, and seed data.
- `ProjectM-source-code/docker-compose.yml`: frontend, backend, postgres, pgAdmin, and optional Railway initializer.

From the repository root this starts the cloud-connected app stack. The backend
uses `DATABASE_URL` from local `.env`, so the app reads the Railway PostgreSQL
database by default:

```bash
cd /Users/henry/Desktop/AoAo/ProjectM
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml up --build -d backend frontend
```

Open the app:

```text
http://localhost:3000/
```

Check service health:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml ps
curl http://localhost:8080/healthz
```

Stop the app:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml down
```

Important: starting `backend` and `frontend` does not update the database.
Database initialization and migrations are explicit commands so production-like
Railway data is not changed accidentally.

Environment files:

- `.env.example` is the committed template.
- `.env` is local-only and ignored by git. Put real `DATABASE_URL` values there.
- Docker Compose reads `.env` automatically.
- `DATABASE_URL` is the Railway PostgreSQL URL used by the backend.
- `LOCAL_DATABASE_URL` / `COMPOSE_DATABASE_URL` are kept for local database work.

Microsoft Teams / Entra ID SSO configuration (optional):

- `SESSION_SECRET` signs the `projectm_session` cookie. Use a strong local value in `.env`; never commit production secrets.
- `TEAMS_CLIENT_ID`, `TEAMS_CLIENT_SECRET`, `TEAMS_TENANT_ID`, and `TEAMS_REDIRECT_URI` enable `/api/v1/auth/teams/start` and `/api/v1/auth/teams/callback`.
- `TEAMS_AUTH_URL`, `TEAMS_TOKEN_URL`, `TEAMS_USERINFO_URL`, and `TEAMS_SCOPES` default to Microsoft identity platform OAuth 2.0 / OIDC endpoints and can be overridden for tenant-specific needs.
- Unknown Teams users are created as regular `user` accounts only; OAuth never creates `super_user`. Teams SSO is the only supported login path.

Local development without Docker:

```bash
cd ProjectM-source-code/backend
go run ./cmd/api

cd ../frontend
npm install
npm run dev
```

Open the frontend at:

```text
http://localhost:3000/
```

The backend listens on:

```text
http://localhost:8080/
```

The frontend dev server proxies `/api/v1/*` to the Go backend.

### Teams SSO local configuration

Use placeholders in committed templates only; put real Microsoft Entra credentials in a local `.env` that is not committed.

1. Copy `.env.example` to `.env`.
2. In Microsoft Entra admin center, create/select an app registration, add a Web platform, and add this local redirect URI:

   ```text
   http://localhost:8080/api/v1/auth/teams/callback
   ```

3. Replace these local-only values in `.env`:

   ```text
   TEAMS_CLIENT_ID=<your-entra-application-client-id>
   TEAMS_CLIENT_SECRET=<your-entra-client-secret>
   TEAMS_TENANT_ID=<your-tenant-id-or-common>
   TEAMS_REDIRECT_URI=http://localhost:8080/api/v1/auth/teams/callback
   SESSION_SECRET=<long-random-local-secret>
   ```

   The implementation follows Microsoft's OAuth 2.0 authorization code flow and OpenID Connect userinfo endpoint: authorize through `/oauth2/v2.0/authorize`, exchange code through `/oauth2/v2.0/token`, and read profile fields from `https://graph.microsoft.com/oidc/userinfo`.

4. Start the stack with Docker Compose:

   ```bash
   docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml up --build -d backend frontend
   ```

### Database setup and migrations

Daily app startup does not run `db-init`. Run database initialization or
migrations only when the schema has changed, a new environment is being prepared,
or a migration file was added.

Run all currently wired Railway database setup scripts:

```bash
cd /Users/henry/Desktop/AoAo/ProjectM
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml --profile railway-init run --rm db-init
```

`db-init` applies:

- `database/init/001_projectm_schema.sql`
- `database/migrations/006_postgresql_optimization.sql`
- `database/migrations/007_add_teams_identity_to_users.sql`

The SQL uses `IF NOT EXISTS` where needed, so rerunning the command is intended
to be safe for the current schema. Still, it targets the `DATABASE_URL` in local
`.env`; if that value points at Railway, this updates the remote Railway
database.

Run one specific migration manually:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml run --rm db-init sh -c 'psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /database/migrations/007_add_teams_identity_to_users.sql'
```

Verify Teams SSO columns exist:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml run --rm db-init sh -c 'psql "$DATABASE_URL" -tAc "SELECT column_name FROM information_schema.columns WHERE table_name = '\''users'\'' AND column_name IN ('\''teams_user_id'\'', '\''teams_tenant_id'\'', '\''last_login_at'\'') ORDER BY column_name"'
```

Local PostgreSQL and pgAdmin are optional now:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml --profile local-db up -d postgres pgadmin
```

`docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml --profile railway-init run --rm db-init` prints migration output
directly in the terminal. If you start `db-init` with `up -d` instead, inspect it
with `docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml logs db-init`.

The database schema uses backend-generated semantic IDs such as
`DOC_<ULID>` instead of auto-incrementing numeric IDs, and includes virtual sample data
plus image URL fields for future frontend pages.

PostgreSQL review status:

- Time fields use `TIMESTAMPTZ`.
- JSONB fields are constrained by shape and indexed where useful.
- Foreign-key columns and published-list query paths have explicit indexes.
- Previous database SQL and admin UI Docker defaults have been replaced in the active files.

Current app structure:

```text
.
├── ProjectM-source-code/
│   ├── backend/
│   │   ├── cmd/api/
│   │   └── internal/
│   │       ├── controller/
│   │       ├── model/
│   │       ├── repository/
│   │       └── service/
│   ├── frontend/
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── services/
│   │       └── types/
│   └── database/
├── docs/
├── .env.example
└── AGENTS.md
```

## Constraints

- Keep application roles limited to `user` and `super_user`.
- Keep all `super_user` management/admin write workflows in the Web Admin Console; App is employee-facing only.
- Do not reintroduce `content_admin`, `department_admin`, or `system_admin`.
- Do not implement browsing history, `recent_views`, or equivalent tracking unless explicitly requested later.
- 财经轻资讯 must not include stock recommendations, buy/sell advice, individual stock predictions, or return promises.
- Never commit `.env` files with real secrets.

## Useful Commands

Documentation checks:

```bash
rg -n "content_admin|department_admin|system_admin|recent_views|TBD" docs AGENTS.md agentschinese.md README.md
rg -n "user|super_user|pgAdmin|5050|股票推荐|买卖建议|投资建议" docs AGENTS.md agentschinese.md README.md
rg -n "mysql|phpMyAdmin|3306|8081|INSERT IGNORE|UNSIGNED|ON UPDATE|utf8mb4" docs AGENTS.md agentschinese.md README.md ProjectM-source-code database
find docs/prd/phases/modules -mindepth 2 -maxdepth 2 -name '*-prd.md' | wc -l
```

OMX checks:

```bash
omx doctor
omx list --json
```

Future implementation checks, once code exists:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml up --build -d backend frontend
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
```
