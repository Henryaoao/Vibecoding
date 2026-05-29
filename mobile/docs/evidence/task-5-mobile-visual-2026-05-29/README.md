# Task 5 mobile visual acceptance evidence — 2026-05-29

Scope: mobile only. Device target: iOS Simulator `iPhone 17`, Expo Go via Metro on port `8094`. Source revision: `b91dc47`.

Reference screenshots: `ui reference/retro futurism/09-mobile-home.png` through `ui reference/retro futurism/16-mobile-training.png`. Task 5 emphasis: briefs, finance, newcomer.

## Screenshot artifacts

| Route | Artifact | Acceptance notes |
| --- | --- | --- |
| Home / briefs entry | `09-home-ios.png` | Pink/pastel pixel-frame shell, hard borders/shadows, large dashboard hero and module entry retained. |
| Briefs | `10-briefs-ios.png` | Single visible search input, single summary rail, single sort control group, single reset affordance; no duplicate filter/sort block visible in captured viewport. |
| Newcomer | `13-newcomer-ios.png` | Single visible search input, single summary rail, one category/task filter group, one reset affordance; active newcomer/task scope retained. |
| Finance | `14-finance-ios.png` | Single visible search input, single tag filter group, single sort group, single reset affordance; finance non-investment-advice disclaimer visible in hero copy. |

All PNGs are 1206 x 2622 simulator screenshots. The blue `Tools` floating control is the Expo Go simulator development overlay, not app UI.

## Reproduction commands

```bash
# From the worker worktree; app was served from the main worktree because mobile/node_modules exists there.
xcrun simctl boot 'iPhone 17' || true
xcrun simctl bootstatus 'iPhone 17' -b
open -a Simulator
npm --prefix /Users/garrison/Desktop/Project-M/mobile run ios -- --port 8094 --clear

# After Metro finished bundling and opened Expo Go:
mkdir -p .omx/reports/task-5-mobile-visual
xcrun simctl io booted screenshot .omx/reports/task-5-mobile-visual/00-initial.png
xcrun simctl openurl booted 'exp://192.168.1.22:8094/--/modules/briefs'
sleep 2
xcrun simctl io booted screenshot .omx/reports/task-5-mobile-visual/10-briefs-ios.png
xcrun simctl openurl booted 'exp://192.168.1.22:8094/--/modules/finance'
sleep 2
xcrun simctl io booted screenshot .omx/reports/task-5-mobile-visual/14-finance-ios.png
xcrun simctl openurl booted 'exp://192.168.1.22:8094/--/modules/newcomer'
sleep 2
xcrun simctl io booted screenshot .omx/reports/task-5-mobile-visual/13-newcomer-ios.png
```

## Verification commands

- `npm --prefix /Users/garrison/Desktop/Project-M/mobile run typecheck`
- `npm --prefix /Users/garrison/Desktop/Project-M/mobile test -- --runTestsByPath src/screens/__tests__/briefsScreen.test.tsx src/screens/__tests__/financeScreen.test.tsx src/screens/__tests__/newcomerScreen.test.tsx --runInBand`
- `git diff --check -- mobile`
- `sips -g pixelWidth -g pixelHeight mobile/docs/evidence/task-5-mobile-visual-2026-05-29/*.png`
- `npm --prefix /Users/garrison/Desktop/Project-M/mobile run lint` → not available; `mobile/package.json` has no lint script.
- `npm --prefix /Users/garrison/Desktop/Project-M/mobile test -- --runInBand` → current unrelated full-suite gap: `announcementsScreen` and `forumHotScreen` duplicate/stale summary assertions fail; the Task 5 emphasis suites pass.

## Limits

- Screenshots were captured through Expo Go rather than a production build, so the simulator development `Tools` overlay is present.
- Visual acceptance here is screenshot evidence plus static/manual inspection against the listed reference set; no pixel-diff automation was introduced and no new dependencies were added.
