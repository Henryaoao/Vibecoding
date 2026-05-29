# Parked Mobile Feature Areas

This folder stores mobile feature files that are intentionally out of active scope.
Do not import, reference, test, or extend files in this folder during normal mobile development.

Restore only after the user explicitly reactivates the feature and the active PRD set supports it.

## Categories

- `admin-console/`: mobile Admin Console routes, admin API client, admin confirmation component, and admin tests.
- `notifications/`: push notification registration, notification click routing, notification settings route, notification API client, and notification tests.
- `favorites/`: personal-center favorites route.
- `download-history/`: personal-center download history route.
- `legacy-architecture/`: previous mobile architecture document that included parked feature scope.
- `legacy-prototype/`: previous static prototype spec and HTML prototype that included parked feature scope.

## Restore Notes

Each category preserves enough original path context to restore by reversing the move:

- `app/...` content goes back under `mobile/app/...`.
- `src/api/...` content goes back under `mobile/src/api/...`.
- `src/components/...` content goes back under `mobile/src/components/...`.
- `src/notifications/...` content goes back under `mobile/src/notifications/...`.
- `tests/...` content goes back under the matching `mobile/src/**/__tests__/...` folder.

Shared files may still contain dormant mock data, endpoint constants, or type definitions because those are mixed with active module contracts. They are not active requirements while this folder is parked.
