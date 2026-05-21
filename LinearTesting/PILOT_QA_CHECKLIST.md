# Pilot QA Checklist

## Recommendation

No-launch for external pilot until a human performs one browser pass against a freshly rebuilt Docker Compose environment. Automated backend and frontend checks pass, but this workspace has accumulated many uncommitted changes and the running browser session may not reflect the latest build.

## Automated Checks

| Flow | Status | Evidence |
| --- | --- | --- |
| Login and current user flow | Pass | Backend auth tests and frontend test suite pass. |
| Task claim flow | Pass | Task service and handler tests cover reward claim, duplicate claim rejection, and validation. |
| Wallet balance update | Pass | Wallet transaction tests and task reward tests verify credit balance changes. |
| Feed pet flow | Pass | Pet feed tests verify wallet debit, feed event, activity event, and audit hook. |
| Pet growth and upgrade flow | Pass | Pet tests verify level thresholds, configured levels, and one-time upgrade events. |
| Admin task setup flow | Pass | Admin task template tests cover create, update, disable, validation, safe reward limits, and audit logs. |
| External task event flow | Pass | External event tests cover idempotency, validation, source recording, and single wallet transaction. |
| Attendance check-in prototype | Pass | Attendance tests cover mapped check-in completion and missing mapping safety. |
| Admin reports | Pass | Admin report tests cover admin-only access, empty state, aggregate metrics, and no user ID exposure. |
| Notification hooks | Pass | Notification tests cover mockable sender, event generation, safe metadata, and non-critical opt-out. |

## Manual Browser Checklist

Use this after rebuilding the local environment:

1. Start the stack with `docker compose up --build`.
2. Open the frontend URL.
3. Register or log in.
4. Confirm `/dashboard.html` shows pet dashboard or pet creation empty state.
5. Create the team pet if needed.
6. Open `/tasks.html`, claim an available task, and confirm duplicate claim is blocked.
7. Feed the pet after feed balance exists and confirm growth changes.
8. Confirm a level-up celebration appears after crossing a configured threshold.
9. Open `/skins.html` and confirm current, unlocked, and locked skin sections render.
10. Log in as an admin and open `/admin-reports.html`.
11. Confirm admin report metrics show aggregate values only, without employee-private details.

## Known Blockers

- Fresh Docker/browser verification still needs a human pass after rebuild.
- Admin user creation path is not documented in the UI.
- Production-grade external webhook secret verification is not implemented yet; current external event endpoints require admin bearer auth.
- Notification adapters for Feishu, WeCom, Slack, and email are planned but not connected.

## Test Commands

```bash
cd backend
go test ./...
go vet ./...

cd ../frontend
npm run lint
npm test
npm run build
```
