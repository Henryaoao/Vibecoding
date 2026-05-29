# Mobile Screenshot Visual Acceptance - 2026-05-29

## Scope

This pass validates the mobile-only duplicate control fix for:

- `mobile/app/modules/briefs.tsx`
- `mobile/app/modules/finance.tsx`
- `mobile/app/modules/newcomer.tsx`

Reference visuals:

- `ui reference/pink pixel art/10-mobile-briefs.png`
- `ui reference/pink pixel art/13-mobile-newcomer.png`
- `ui reference/pink pixel art/14-mobile-finance.png`

## Environment

- Runtime: Expo iOS dev server
- Device: iPhone 17 simulator
- Screenshot size: 1206 x 2622 PNG
- Command used to start the app:

```sh
CI=1 npm --prefix mobile run ios -- --port 19007
```

## Screenshot Commands

```sh
xcrun simctl openurl booted 'exp://192.168.1.22:19007/--/modules/briefs'
sleep 2
xcrun simctl io booted screenshot mobile/docs/visual-acceptance/2026-05-29/briefs.png

xcrun simctl openurl booted 'exp://192.168.1.22:19007/--/modules/finance'
sleep 3
xcrun simctl io booted screenshot mobile/docs/visual-acceptance/2026-05-29/finance.png

xcrun simctl openurl booted 'exp://192.168.1.22:19007/--/modules/newcomer'
sleep 3
xcrun simctl io booted screenshot mobile/docs/visual-acceptance/2026-05-29/newcomer.png
```

## Artifacts

| Page | Screenshot |
| --- | --- |
| 今日公司简报 | `briefs.png` |
| 财经轻资讯 | `finance.png` |
| 新人专区 | `newcomer.png` |
| Initial app state capture | `login-or-current.png` |

## Acceptance Notes

- Briefs shows one sort row (`最新优先`, `最早优先`) and one reset control after the status summary.
- Finance shows one category filter group, one sort row (`最新优先`, `来源名称`), one reset control, and keeps the no-investment-advice disclaimer visible in the hero copy.
- Newcomer shows one content sort row, one task status filter row, one task sort row, and one reset control. The summary wraps but does not create a second control block.
- All three pages preserve the pink pixel art shell: thick purple outlines, hard shadows, cream cards, pink hero panel, and checkerboard lower background.

