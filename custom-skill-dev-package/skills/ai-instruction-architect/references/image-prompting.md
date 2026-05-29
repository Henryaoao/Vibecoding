# Image Prompting Reference

Use this reference for still-image generation, image editing, product visuals, posters, thumbnails, character sheets, visual styles, and frame prompts.

## Image Prompt Anatomy

Specify:

- Subject: who or what is visible.
- Action or moment: what is happening.
- Environment: location, background, time, context.
- Composition: framing, angle, foreground/background, focal point.
- Style or medium: photography, illustration, render, diagram, UI mockup, etc.
- Lighting and color: source, mood, contrast, palette.
- Materials and texture: surface details that affect realism.
- Constraints: aspect ratio, text/no text, logo use, transparency, background, exclusions.

Separate subject from style. A style word can accidentally change subject identity unless identity is explicitly preserved.

## Reference Images

When references are provided, state what each controls:

- Identity or likeness.
- Product shape/material.
- Color palette.
- Pose or composition.
- Lighting.
- Background.
- Style.

Also state what should not be copied if relevant.

## Prompt Density

Use compact prompts for simple images. Use structured prompts for:

- Multiple people or objects.
- Brand/product constraints.
- Exact text or logos.
- Hands, faces, anatomy, diagrams, or UI details.
- Image edits with regions to preserve.
- Professional or commercial deliverables.

## Negative Constraints

Use negatives for concrete exclusions:

- "no text"
- "no watermark"
- "no extra fingers"
- "no cropped product"
- "avoid cartoon style"

Do not overload negatives. Excess negatives can remove useful visual detail or confuse the model.

## Image Editing

For edits, specify:

- Preserve exactly.
- Change only.
- Target region.
- Desired replacement.
- Lighting/perspective matching.
- Output background and dimensions.

If the user wants realism, include camera/framing/material constraints rather than only "realistic".

## Review Checklist

- The subject is unambiguous.
- Composition is inspectable.
- Lighting and material details support the goal.
- Required exclusions are explicit.
- Text/logo/background/transparency rules are explicit.
- Reference-image control is clear.
- The prompt does not contain conflicting styles.

## Iteration

Change one or two variables per revision:

- Composition.
- Lighting.
- Style.
- Subject detail.
- Background.
- Aspect ratio.
- Exclusions.

Record the best prompt and the observed failure it fixed.
