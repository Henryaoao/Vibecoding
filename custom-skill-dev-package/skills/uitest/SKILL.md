---
name: uitest
description: "Use the local joshhu/uitest UI style showcase as a visual reference library. Applies when the user asks for UI style exploration, visual inspiration, Apple-like polish, Bento layouts, Spatial UI, liquid glass, dashboard styling, landing page styling, or to compare several interface directions before implementing React UI."
---

# UI Test Style Reference

Use this skill when ProjectM needs visual direction, UI style references, or a concrete HTML example to translate into React components.

## Source

The local reference repository is:

`custom-skills/uitest/`

Important files:

- `custom-skills/uitest/index.html` - overview of all available styles.
- `custom-skills/uitest/styles/14-liquid-glass.html` - glass / Apple-like translucent reference.
- `custom-skills/uitest/styles/39-bento-box.html` - Bento layout reference.
- `custom-skills/uitest/styles/53-bento-grids.html` - Bento grid system reference.
- `custom-skills/uitest/styles/55-spatial-ui.html` - Spatial / Vision Pro style reference.
- `custom-skills/uitest/styles/28-data-dense-dashboard.html` - dense dashboard reference.
- `custom-skills/uitest/styles/30-executive-summary.html` - executive summary reference.

## Workflow

1. Read the relevant `custom-skills/uitest/styles/*.html` files before changing UI.
2. Extract only design intent: spacing, hierarchy, motion, surface treatment, color rhythm, interaction feel, and layout pattern.
3. Implement in the actual ProjectM stack, usually React + TypeScript + Vite under `ProjectM-source-code/frontend`.
4. Keep ProjectM product constraints from `AGENTS.md` and `docs/prd/` above this reference.
5. For ProjectM, prefer professional internal-portal UI over landing-page marketing composition.
6. Verify with a browser preview or screenshot when frontend code changes.

## ProjectM Defaults

- Use Apple-inspired polish only where it improves clarity: soft depth, clean type, restrained motion, clear hierarchy.
- Prefer light/dark mode support when touching global UI or layout shell.
- Use Bento blocks for summaries, dashboards, and content navigation.
- Keep mobile navigation usable with a hamburger or drawer pattern.
- Keep desktop navigation collapsible when requested.
- Do not introduce finance investment advice, browsing history, or extra roles.

## How To Invoke

Example user prompts:

```text
$uitest 用 55-spatial-ui 和 39-bento-box 作为参考，重做 ProjectM 首页。
$uitest 参考 liquid glass，帮我把导航和内容卡片做得更 Apple。
$uitest 选 3 个适合内部门户的 UI 风格，并说明适合原因。
```
