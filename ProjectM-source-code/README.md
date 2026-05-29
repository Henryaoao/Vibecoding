# ProjectM Source Code

ProjectM source code lives in this folder. It contains the runnable frontend,
backend, Docker Compose, PostgreSQL, pgAdmin, and database initialization files.

## Source Layout

```text
ProjectM-source-code/
├── backend/
│   ├── cmd/api/
│   └── internal/
│       ├── config/
│       ├── controller/
│       ├── middleware/
│       ├── model/
│       ├── repository/
│       ├── response/
│       └── service/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── database/
└── docker-compose.yml
```

The backend follows MVC-style layering:

- `controller`: HTTP routes and request/response flow.
- `model`: shared data shapes and section definitions.
- `repository`: PostgreSQL access.
- `service`: business orchestration.

The frontend follows the same separation of concerns with pages, reusable
components, service clients, and shared types.

## Start

```bash
cd ProjectM-source-code
docker compose --env-file ../.env up --build -d backend frontend
```

Git is kept at the repository root. Docker Compose lives in this source-code
folder, and the command above reads the root `.env` through `--env-file ../.env`.
In the normal cloud-connected path,
the backend uses Railway's `DATABASE_URL` and only `frontend` plus `backend`
need to run. Starting `backend` and `frontend` does not run database migrations.

## Services

| Service | URL / Host | Notes |
| --- | --- | --- |
| Frontend | `http://localhost:3000` | React + Vite portal |
| Backend | `http://localhost:8080` | Go REST API connected to Railway PostgreSQL |
| PostgreSQL | `localhost:5432` | Optional local database with `--profile local-db` |
| pgAdmin | `http://localhost:5050` | Optional local PostgreSQL UI with `--profile local-db` |

## Teams SSO Local Configuration

Committed environment templates contain placeholders only. Copy the template to a local `.env` and never commit real Microsoft Entra credentials.

```bash
cp ../.env.example ../.env
```

In Microsoft Entra admin center, create/select an app registration, add a Web platform, and configure the local redirect URI:

```text
http://localhost:8080/api/v1/auth/teams/callback
```

Then replace these values in the local `.env` file:

```text
TEAMS_CLIENT_ID=<your-entra-application-client-id>
TEAMS_CLIENT_SECRET=<your-entra-client-secret>
TEAMS_TENANT_ID=<your-tenant-id-or-common>
TEAMS_REDIRECT_URI=http://localhost:8080/api/v1/auth/teams/callback
SESSION_SECRET=<long-random-local-secret>
```

The implementation follows Microsoft's OAuth 2.0 authorization code flow and OpenID Connect userinfo endpoint: authorize through `/oauth2/v2.0/authorize`, exchange code through `/oauth2/v2.0/token`, and read profile fields from `https://graph.microsoft.com/oidc/userinfo`.

Restart Docker Compose after changing SSO values:

```bash
docker compose --env-file ../.env up --build -d backend frontend
```

## Web Session Cookie

The Web login session cookie name is `projectm_session`.

Backend protected routes read this cookie as the browser session entry point.
The frontend uses Teams SSO to obtain this cookie; protected backend routes do
not accept development identity headers or demo credential login.

## Database

Default local values:

```text
Database: projectm
Username: projectm_user
Password: projectm_password
```

pgAdmin login:

```text
Email: admin@projectm.test
Password: pgadmin_password
Server host: postgres
Server port: 5432
Database username: projectm_user
Database password: projectm_password
```

The schema is initialized from:

```text
database/init/001_projectm_schema.sql
```

Current tables cover the ProjectM internal portal baseline:

- `users`
- `company_briefs`
- `announcements`
- `forum_posts`
- `forum_comments`
- `forum_reactions`
- `newcomer_resources`
- `finance_news`
- `documents`
- `document_downloads`
- `training_courses`
- `training_course_progress`
- `audit_logs`

Image URL fields are reserved in the schema for future frontend content, such
as user avatars, announcement covers, forum post images, document covers, and
training course covers.

Primary key design:

- Business tables use backend-generated semantic IDs, for example `DOC_<ULID>`.
- The ID format combines a short resource prefix with a ULID-style sortable string.
- PostgreSQL does not use auto-incrementing numeric IDs for business objects.
- Seed data uses fixed semantic IDs so tests and page mock data can refer to
  stable records.

PostgreSQL optimization notes:

- Time columns use `TIMESTAMPTZ` for consistent deployment behavior.
- `finance_news.tag_names_json` and `audit_logs.metadata_json` use JSONB with
  shape checks and GIN indexes.
- Foreign-key columns are indexed explicitly because PostgreSQL does not create
  FK indexes automatically.
- Published content lists use partial indexes that exclude soft-deleted rows.
- Existing databases can apply `database/migrations/006_postgresql_optimization.sql`
  and `database/migrations/007_add_teams_identity_to_users.sql` after the
  earlier migrations.

The schema also inserts virtual sample data for local development, including
demo users, announcements, briefs, forum posts, newcomer resources, finance
news, documents, and training courses.

## Useful Commands

```bash
docker compose --env-file ../.env config
docker compose --env-file ../.env up --build -d backend frontend
docker compose --env-file ../.env ps
curl http://localhost:8080/healthz
docker compose --env-file ../.env logs -f backend
docker compose --env-file ../.env logs -f frontend
docker compose --env-file ../.env logs -f postgres
docker compose --env-file ../.env down
```

From the repository root, this starts frontend and backend while keeping Docker
configuration inside `ProjectM-source-code/`:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml up --build -d backend frontend
```

Railway schema initialization and migrations are explicit so remote database
changes only happen when requested:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml --profile railway-init run --rm db-init
```

`db-init` currently applies:

- `database/init/001_projectm_schema.sql`
- `database/migrations/006_postgresql_optimization.sql`
- `database/migrations/007_add_teams_identity_to_users.sql`

Because `DATABASE_URL` usually points at Railway, running `db-init` updates the
remote Railway database. Use it when setting up a new database or after a new
migration file is added.

Run only the Teams SSO migration:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml run --rm db-init sh -c 'psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /database/migrations/007_add_teams_identity_to_users.sql'
```

Verify the Teams SSO columns:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml run --rm db-init sh -c 'psql "$DATABASE_URL" -tAc "SELECT column_name FROM information_schema.columns WHERE table_name = '\''users'\'' AND column_name IN ('\''teams_user_id'\'', '\''teams_tenant_id'\'', '\''last_login_at'\'') ORDER BY column_name"'
```

Local PostgreSQL and pgAdmin are optional:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml --profile local-db up -d postgres pgadmin
```

Compose does not rerun an exited one-shot container unless it is recreated. To
force the Railway initializer to run again:

```bash
docker compose --env-file .env -f ProjectM-source-code/docker-compose.yml --profile railway-init run --rm db-init
```

The repository root also contains `.env.example`. Copy its values into local
`.env` and paste Railway's `DATABASE_URL` there. `.env` is intentionally ignored
by git.

### Teams SSO backend configuration

Teams SSO is optional. Copy the repository root `.env.example` to a local `.env` and set:

- `SESSION_SECRET` for ProjectM session cookie signing.
- `TEAMS_CLIENT_ID`, `TEAMS_CLIENT_SECRET`, `TEAMS_TENANT_ID`, `TEAMS_REDIRECT_URI` from Microsoft Entra app registration. For local backend testing, use `http://localhost:8080/api/v1/auth/teams/callback` as the callback.
- Override `TEAMS_AUTH_URL`, `TEAMS_TOKEN_URL`, `TEAMS_USERINFO_URL`, or `TEAMS_SCOPES` only when the tenant requires different endpoints or scopes.

Runtime flow: `GET /api/v1/auth/teams/start` redirects to Microsoft identity platform; `GET /api/v1/auth/teams/callback` validates state, exchanges code for token, reads OIDC user info, maps or creates a ProjectM `user`, signs `projectm_session`, and redirects to `FRONTEND_URL`. Teams SSO is the only login path; demo credential login is not available. OAuth-created users are never `super_user` by default.

To recreate the database from a clean volume:

```bash
docker compose --env-file ../.env down -v
docker compose --env-file ../.env --profile local-db up -d postgres pgadmin
```

## Verification

```bash
(cd backend && go test ./...)
npm --prefix frontend run build
docker compose --env-file ../.env config --services
```
