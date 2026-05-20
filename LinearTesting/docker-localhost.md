# Docker Localhost Setup

This project uses Docker Compose for local frontend + backend + MySQL testing.

## Start

```bash
docker compose up --build
```

Compose automatically reads `.env`.

## Services

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`
- phpMyAdmin: `http://localhost:8081`

## phpMyAdmin

After Docker Compose is running, open:

```text
http://localhost:8081
```

Login options:

```text
Server: mysql
Username: auth_user
Password: auth_password
Database: auth_mvp
```

Or use root for local-only admin access:

```text
Username: root
Password: root_password
```

## Smoke Test

Frontend:

```text
http://localhost:5173
```

Backend:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "request_id": ""
}
```

## Files

- `.env`: local Docker Compose values, ignored by git.
- `docker.env.example`: reference copy of required Docker env values.
- `docker-compose.yml`: frontend, backend, MySQL, and phpMyAdmin service definitions.
- `frontend/Dockerfile`: React production build served by nginx.
- `frontend/nginx.conf`: SPA routing and `/api` proxy to backend.
- `database/init/001_users.sql`: MySQL users table initialization.

## Safety

The included credentials are local development values only. Do not reuse them for production.
