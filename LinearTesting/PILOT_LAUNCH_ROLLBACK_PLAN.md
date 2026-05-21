# Pilot Launch and Rollback Plan

## Launch Decision

Launch the pilot only after the checks in `PILOT_QA_CHECKLIST.md` pass against a freshly rebuilt Docker Compose environment.

Current launch mode:

- Pilot type: internal employee pilot
- Trading/live-risk mode: not applicable to this virtual pet pilot
- Support owner: Henry
- Engineering owner: Henry
- Feedback tracker: Linear project `Henry`
- Support channel: create or use `#aoa-pet-pilot-support` before inviting pilot users

## Pilot Team Selection

Start with a small team before expanding.

Recommended first cohort:

- 3 to 8 internal users
- 1 admin/support owner
- 1 engineering owner
- Users who can test login, task claim, feed, skin, and mobile flows

Do not invite all employees until:

- Core task-to-feed flow is stable
- Admin report page can be opened by an admin
- Rollback steps have been rehearsed once
- Feedback channel and Linear triage process are active

## Required Environment Variables

Use local development values only for the pilot unless a separate hosted environment is prepared.

Backend and database:

```text
APP_ENV=development
APP_PORT=8080
MYSQL_DATABASE=auth_mvp
MYSQL_USER=auth_user
MYSQL_PASSWORD=auth_password
MYSQL_ROOT_PASSWORD=root_password
DATABASE_URL=auth_user:auth_password@tcp(mysql:3306)/auth_mvp?parseTime=true
```

Frontend:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Docker services:

```text
Frontend: 5173
Backend API: 8080
phpMyAdmin: 8081
MySQL: 3306
```

For GitHub Codespaces, use the forwarded port URLs from the Ports panel.

## Pre-Launch Checklist

Run these steps before inviting pilot users:

1. Pull the latest code from the pilot branch.
2. Rebuild from a clean Docker Compose state if previous MySQL init failed.
3. Start the stack with `docker compose up --build`.
4. Confirm MySQL is healthy.
5. Open the frontend on port `5173`.
6. Register or log in with a pilot user.
7. Open `/dashboard.html`.
8. Create the team pet if the empty state appears.
9. Open `/tasks.html` and claim a task.
10. Feed the pet from the dashboard.
11. Open `/skins.html` and confirm locked/unlocked skins render.
12. Log in as admin and open `/admin-reports.html`.
13. Confirm no sensitive user details are exposed in admin reports.
14. Confirm mobile browser has no horizontal scrolling.
15. Post the launch message in the support channel.

## Deployment Steps

Local or Codespaces pilot deployment:

```bash
docker compose down
docker compose up --build
```

If MySQL was previously initialized with broken or old local data:

```bash
docker compose down -v
docker compose up --build
```

After startup:

1. Open frontend port `5173`.
2. Open backend health endpoint `/api/health`.
3. Keep backend, MySQL, and phpMyAdmin ports private in Codespaces unless the pilot explicitly needs access.
4. Share only the frontend URL with pilot users.

## Pilot Support Process

Use the support channel for quick reports and Linear for tracked work.

Support channel format:

```text
Issue:
Page:
User role:
Steps:
Expected:
Actual:
Screenshot:
```

Linear triage:

- Create one Linear issue per bug or product request.
- Label pilot bugs as `Bug`.
- Label copy/UI improvements as `Improvement`.
- Mark security, auth, or data exposure issues as high priority.
- Keep pilot launch blockers in the current project milestone.

Response expectations:

- Critical auth/data issue: stop pilot and roll back immediately.
- Broken task-to-feed flow: pause new users and patch before expansion.
- Copy/layout issue: keep pilot running unless it blocks completion.

## Rollback Triggers

Rollback immediately if any of these happen:

- Users cannot log in or register.
- Task claim creates duplicate rewards.
- Feed action deducts balance incorrectly.
- Admin report exposes private employee-level details.
- MySQL container repeatedly fails to start.
- Frontend build serves broken pages.
- Pilot users are blocked from the main dashboard.

## Rollback Steps

Local or Codespaces rollback:

1. Stop the current stack:

```bash
docker compose down
```

2. Checkout the last known good commit or branch:

```bash
git checkout <last-known-good-ref>
```

3. Rebuild and restart:

```bash
docker compose up --build
```

4. Verify:

- `/api/health` returns healthy response.
- `/login.html` opens.
- `/dashboard.html` loads after login.
- `/tasks.html` still allows safe task claim.

5. Post a rollback notice in the support channel.
6. Create a Linear incident issue with the failure reason and affected users.

If database state is corrupted in a local-only pilot:

```bash
docker compose down -v
docker compose up --build
```

Use volume reset only when pilot data can be safely discarded.

## Feedback Collection Plan

Collect feedback for at least one working day before expanding the pilot.

Questions for pilot users:

1. Was login/register clear?
2. Could you understand what task to complete?
3. Did claiming a task and feeding the pet feel connected?
4. Did the dashboard feel friendly and non-punitive?
5. Did the mobile layout work without horizontal scrolling?
6. What copy felt confusing?
7. What reward or skin would make the flow more fun?

Convert feedback into Linear tasks using this priority:

- P1: login, data safety, reward correctness, blocked core flow
- P2: confusing user flow, broken mobile layout, admin report issue
- P3: copy polish, mascot naming, skin ideas, empty state improvements

## Post-Launch Review

After the pilot window:

1. Summarize user feedback.
2. Review task completion and feed activity.
3. Review admin report output.
4. Decide whether to expand, pause, or rebuild a specific flow.
5. Update `PILOT_QA_CHECKLIST.md` with any new manual checks found during pilot.
