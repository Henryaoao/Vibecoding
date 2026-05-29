# Mobile Testing

## Matrix And Environment

State the test matrix explicitly:

- platform and OS version
- device model or emulator profile
- app build, flavor, and feature-flag state
- network condition, locale, timezone, and notification state

## Coverage Model

Cover as relevant:

- install, upgrade, cold start, warm start, and relaunch
- login, permission, biometric, deep-link, and notification flows
- background and foreground transitions
- offline, poor-network, retry, and resume behavior
- device rotation, keyboard, app interruption, and storage state

## Automation Guidance

Prefer:

- stable accessibility IDs or automation IDs
- explicit waits on app state instead of sleeps
- isolated test accounts and deterministic device state
- artifact capture for crashes, network events, and app logs

Avoid:

- coordinate-driven automation when a semantic locator exists
- shared device state between cases without reset rules
- silent fallback from mobile-specific assertions to generic text checks

## Manual Boundary

Keep manual-only work explicit when hardware, sensors, biometric prompts, visual quality, or external interruptions cannot be safely automated in the current environment.

## Red Flags

Fail or repair when:

- the device or OS matrix is hidden
- lifecycle assumptions are unstated
- selectors are fragile or inaccessible
- permission or network state is left implicit
