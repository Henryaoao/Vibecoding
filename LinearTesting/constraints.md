# User Feature Constraints

## Purpose

This document defines the technical and product constraints for the user feature MVP.

The goal is to keep user registration, login, logout, and protected access clear, secure, and testable.

## Scope

This phase covers user account functionality only:

- User registration
- User login
- Current user lookup
- Logout
- Protected dashboard route
- Auth loading states
- Auth error states
- Auth-related tests

## Technology Constraints

### Development Framework

- Agenics is the development framework used to organize and drive the project workflow.
- Agenics should be used for planning, issue breakdown, implementation flow, and agent-assisted development coordination.
- Agenics must not bypass application security rules, authentication rules, or review requirements.

### Frontend

- React is the frontend framework.
- Frontend code must be written in JavaScript.
- The frontend must communicate with the backend through API endpoints only.
- The frontend must never access the database directly.
- The frontend must never store passwords, password hashes, tokens in logs, or application secrets.

### Backend

- Go is the backend language.
- Backend APIs should follow the project API response standard.
- Auth logic must live on the backend.
- Password hashing must happen only on the backend.
- Token or session creation must happen only on the backend.
- Secrets must come from environment variables.
- No secrets may be hardcoded.

## Security Constraints

- Passwords must never be stored in plaintext.
- Password hashes must never be returned to the frontend.
- Auth tokens or session values must never be logged.
- API errors must not expose internal stack traces.
- Private endpoints must require authentication.
- Users must only access their own current-user data.
- Logout must invalidate or clear the active auth session/token according to the chosen auth design.
- Sensitive values must be masked in logs.

## Architecture Constraints

Backend auth code should follow this structure:

```text
backend/
  internal/
    auth/
    handler/
    service/
    repository/
    model/
  pkg/
    response/
    errors/
    validator/
```

Handler responsibilities:

- Parse request
- Validate input
- Call service layer
- Return standardized response

Service responsibilities:

- Auth business logic
- Password hashing/checking
- Token/session issuing
- Logout coordination

Repository responsibilities:

- User lookup
- User creation
- Session or refresh token persistence if used

## API Constraints

All auth endpoints must use standardized responses.

Success response:

```json
{
  "success": true,
  "data": {},
  "request_id": "req_abc123"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  },
  "request_id": "req_abc123"
}
```

Required auth endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Frontend Constraints

- `/login` must exist.
- `/register` must exist.
- `/dashboard` must be protected.
- Logged-out users must be redirected to `/login`.
- Login/register forms must show validation errors.
- Login/register forms must show loading states during submission.
- Successful login must redirect to `/dashboard`.
- Dashboard must show current user information when available.
- Dashboard must provide a logout action.

## Testing Constraints

Auth work is not complete unless tests cover:

- Register success
- Register validation failure
- Duplicate email rejection
- Login success
- Login invalid credentials
- Current user lookup while authenticated
- Current user lookup while logged out
- Logout behavior
- Protected dashboard redirect
- Auth loading and error UI states
