# Voice And Multimodal Reference

Use this reference for realtime voice prompts, audio agents, multimodal creative prompts, and packages that combine text, image, video, audio, or UI.

## Voice And Realtime Prompts

Voice prompts should be short, operational, and interruption-aware:

- Role and user relationship.
- Conversation goal.
- Speaking style and language.
- Clarification behavior.
- Handling unclear, noisy, partial, or interrupted audio.
- What to do when the user changes topic.
- Safety or escalation rules.

Avoid long hidden policies in realtime voice prompts unless they are essential. Short bullets usually perform better.

## Voice Flow

Define:

- Greeting or entry behavior.
- How to ask clarifying questions.
- How to confirm actions.
- How to recover from mishearing.
- How to summarize decisions.
- How to end the interaction.

## Multimodal Packages

When the asset spans multiple modalities, define each layer:

- Text message or narration.
- Image prompt or frame prompt.
- Video prompt or shot plan.
- Audio/voice/music direction.
- UI or layout requirements.
- Shared brand/style/identity constraints.

Then define cross-modal consistency:

- Character/product identity.
- Tone.
- Color and lighting.
- Timeline/sequence.
- Text overlays and captions.
- Accessibility requirements.

## Reference Control

State which input controls which output dimension:

- A logo controls brand mark only.
- A product photo controls geometry and material.
- A storyboard controls action and sequence.
- A voice sample controls tone only if permitted.
- A style frame controls lighting/palette/composition.

## Review Checklist

- Each modality has a complete prompt.
- Shared identity and style constraints are explicit.
- One modality does not contradict another.
- The final package names platform/model assumptions.
- The output includes iteration steps and review criteria.
