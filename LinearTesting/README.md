# AOA Auth MVP

Local auth MVP with React frontend, Go Gin backend, MySQL, and phpMyAdmin.

## Docker Start

```bash
docker compose up --build
```

Docker Compose can run without `.env` by using local development defaults. If a
`.env` file exists, Docker Compose automatically reads it and overrides those
defaults.

If MySQL previously failed during first start, reset the failed containers and
empty local volume before starting again:

```bash
docker compose down -v
docker compose up --build
```

## GitHub Codespaces

From the Codespaces terminal:

```bash
cd LinearTesting
docker compose up --build
```

Open the **Ports** panel and use the forwarded URLs for:

- `5173`: frontend
- `8080`: backend API
- `8081`: phpMyAdmin
- `3306`: MySQL

If Codespaces asks about port visibility, keep database/backend ports private
for local testing.

## Access URLs

| Service | URL | Notes |
| --- | --- | --- |
| Frontend | `http://localhost:5173` | React app |
| Backend health | `http://localhost:8080/api/health` | API smoke test |
| Backend auth API | `http://localhost:8080/api/auth/*` | Register/login/me/logout |
| phpMyAdmin | `http://localhost:8081` | MySQL web UI |
| MySQL | `localhost:3306` | Host port for local DB tools |

## phpMyAdmin Login

Open:

```text
http://localhost:8081
```

Use:

```text
Server: mysql
Username: auth_user
Password: auth_password
Database: auth_mvp
```

Root local-only login:

```text
Username: root
Password: root_password
```

## Smoke Tests

Backend:

```bash
curl http://localhost:8080/api/health
```

Frontend:

```text
http://localhost:5173
```

Expected user flow:

1. Open frontend.
2. Register a user.
3. Land on `/dashboard`.
4. See current user email and role.
5. Log out.
6. Log in again.

## Local Env Files

- `.env`: local Docker Compose values, ignored by git.
- `docker.env.example`: reference copy of required Docker env values.
- `docker-compose.yml`: frontend, backend, MySQL, and phpMyAdmin services.

## Safety

The included credentials are local development values only. Do not reuse them for production.

Test:
Henry@gmail.com
qweqwe12
