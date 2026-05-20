# User MVP Framework

## Goal

Build only the basic user system.

The user should be able to:

- Register
- Log in
- View a protected dashboard
- See current user info
- Log out

## Tech Stack

- Development framework: Agenics
- Frontend: React with JavaScript
- Backend: Go
- API framework: Gin

## Pages

```text
/login
/register
/dashboard
```

## Backend APIs

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Simple Project Structure

```text
frontend/
  src/
    pages/
      Login.jsx
      Register.jsx
      Dashboard.jsx
    auth/
      api.js
      ProtectedRoute.jsx
    lib/
      apiClient.js

backend/
  cmd/
    api/
      main.go
  internal/
    auth/
      handler.go
      service.go
      repository.go
      password.go
      token.go
    user/
      model.go
    response/
      response.go
```

## Main Rules

- Do not use TypeScript.
- Use React JavaScript files: `.jsx` and `.js`.
- Passwords must be hashed before saving.
- Password hashes must never be returned to the frontend.
- Auth tokens or session values must not be logged.
- Secrets must come from environment variables.
- Dashboard must require login.

## MVP Issues

1. Create basic Go backend
2. Create basic React frontend
3. Create auth backend structure
4. Implement register API
5. Implement login API
6. Implement current user API
7. Implement logout API
8. Create login page
9. Create register page
10. Create protected dashboard page
11. Add auth loading and error states
12. Add auth tests

## Done When

- User can register.
- User can log in.
- Logged-in user can open `/dashboard`.
- Logged-out user is redirected to `/login`.
- Dashboard shows current user info.
- User can log out.
- Password hash is never returned.
- Basic auth tests exist.

