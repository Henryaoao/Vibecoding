# Mobile active route audit — 2026-05-29

Scope: `mobile/` only. Source of truth: `mobile/docs/mobile-prd-implementation-guide.md` and `mobile/docs/mobile-ui-visual-reference.md`.

## Active routes checked

| Route area | Files | Audit result |
| --- | --- | --- |
| Auth and shell | `app/index.tsx`, `app/_layout.tsx`, `app/(auth)/login.tsx`, `app/(tabs)/_layout.tsx` | Active auth shell only; no mobile Admin route restored. |
| Home | `app/(tabs)/index.tsx` | Home keeps the left-top menu entry and pink pixel hero/card treatment. |
| Module lists | `app/modules/briefs.tsx`, `app/modules/announcements.tsx`, `app/modules/forum-hot.tsx`, `app/modules/newcomer.tsx`, `app/modules/finance.tsx` | Lists now expose a shared pixel count/status rail and resettable search/filter/sort state where applicable. |
| Documents | `app/(tabs)/documents.tsx`, `app/documents/[id].tsx` | Document list has resettable backend-aligned filters; detail permission non-disclosure remains unchanged. |
| Training | `app/(tabs)/training.tsx`, `app/training/[id].tsx` | Training list has resettable keyword/filter/sort controls; detail progress flow remains unchanged. |
| Personal center | `app/(tabs)/me.tsx`, `app/me/training.tsx`, `app/me/newcomer-tasks/index.tsx`, `app/me/newcomer-tasks/[id].tsx` | Active personal workflows only: profile, training progress, and current user's newcomer tasks. |
| Details | `app/briefs/[id].tsx`, `app/announcements/[id].tsx`, `app/forum-hot/[id].tsx`, `app/newcomer/[id].tsx`, `app/finance/[id].tsx` | Detail routes stay read-only except active user-owned progress/task actions. |

## Guardrails confirmed

- Parked mobile Admin, push, notification preferences, favorites UI, personal download history, and passive browsing/recent history were not restored.
- Home remains the only global menu surface; other pages continue through the shared `Screen` back affordance.
- Finance list/detail keeps the “非投资建议” boundary.
- Search/filter/sort controls use existing pixel tokens, hard borders, hard shadows, and resettable state panels.

## Follow-up risks

- Static taxonomies for announcement categories and finance tags still require code updates if backend taxonomy changes.
- Full visual parity with refs `09-mobile-home.png` through `16-mobile-training.png` still benefits from device screenshot review; this pass focused on code-level consistency and route smoke tests.
