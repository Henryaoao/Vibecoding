# Video Prompt Template

## Brief

- Goal:
- Platform/model:
- Duration:
- Aspect ratio:
- Starting image/reference:
- Continuity anchor:

## Single-Shot Prompt

`[Subject] [motion/action] in [setting]. Camera: [camera motion/framing]. Scene motion: [environment/product/background movement]. Style and lighting: [visual style, lens/lighting if relevant]. Duration/pacing: [seconds, speed]. Constraints: [preserve/avoid/brand/text/audio rules].`

## Multi-Shot Plan

| Shot | Duration | Visual Action | Camera | Motion | Continuity Anchor | Text/Audio Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |

## Iteration Plan

1. Start with the simplest motion that proves the scene works.
2. Add subject motion, camera motion, scene motion, and style in separate passes.
3. Use image-to-video/reference assets when identity, product, or brand consistency matters.
4. Avoid packing unrelated scene changes into one short clip unless the platform supports multi-shot control.

## Review Checklist

- Prompt describes motion, not only appearance.
- Subject motion and camera motion do not conflict.
- Duration and scene complexity are aligned.
- Reference image or character consistency rules are explicit.
- Product/brand/text constraints are preserved.
