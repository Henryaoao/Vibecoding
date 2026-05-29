# Video Prompting Reference

Use this reference for text-to-video, image-to-video, product ads, cinematic shots, animated social clips, and multi-shot video plans.

## Video Is Temporal

A video prompt must describe time, not just appearance:

- Subject motion.
- Camera motion.
- Scene/environment motion.
- Duration and pacing.
- Start state and end state.
- Continuity anchors.
- Transition rules when multiple shots are allowed.

## Single-Shot Prompt Anatomy

Specify:

- Subject and setting.
- Initial framing.
- Main action.
- Camera movement.
- Secondary scene motion.
- Lighting/style.
- Duration and speed.
- Constraints and exclusions.

Keep the action simple enough for the duration. A 5-second clip should usually have one main action.

## Image-To-Video

When starting from an image, define:

- What must remain identical.
- What may move.
- Camera motion.
- Object/character motion.
- Background motion.
- What must not change.

Identity, product shape, logos, and text usually need explicit preservation rules.

## Multi-Shot Plans

Use a shot table only when the platform or downstream editor can handle shot-level control. Include:

- Shot number.
- Duration.
- Visual action.
- Camera.
- Motion.
- Continuity anchor.
- Text/audio notes.

Do not cram unrelated scenes into a single prompt when the model expects one continuous clip.

## Motion Quality

Check for:

- Smooth temporal coherence.
- No contradictory subject and camera motion.
- No impossible physical transition.
- Clear foreground/background relationship.
- Consistent identity across frames.
- Reasonable density for duration.

## Prompt Optimization

Optimize for generated video quality, not only semantic completeness:

1. Start with the core action.
2. Add camera motion.
3. Add scene motion.
4. Add style/lighting.
5. Add constraints.
6. Test and revise the weakest dimension.

## Review Checklist

- The prompt describes visible motion.
- Subject motion and camera motion are both explicit.
- Duration and complexity are aligned.
- Continuity anchors are defined.
- Reference image rules are clear.
- Brand/product/text constraints are protected.
