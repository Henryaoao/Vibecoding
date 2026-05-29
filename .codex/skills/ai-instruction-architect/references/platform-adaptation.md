# Platform Adaptation Reference

Use this reference when an instruction asset must run on a named model, app, API,
agent runtime, media generator, voice surface, RAG stack, coding agent, or
evaluation harness. Do not hard-code volatile parameter names. Instead, identify
the platform capability class, required inputs, unsupported behaviors, and the
verification path.

## Universal Checks

- Target surface: chat, automation agent, image, video, voice, multimodal, RAG,
  coding, or evaluator.
- Authority layers: system/developer/user/tool messages, prompt fields, workflow
  steps, or platform-specific configuration.
- Input contract: text, files, images, audio, tools, retrieved context, examples,
  variables, or prior state.
- Output contract: free text, JSON/schema, tool call, generated media, code diff,
  scores, citations, or review report.
- Capability limits: context size, tool availability, file access, media duration,
  aspect ratio, latency, cost, safety policy, memory, concurrency, and streaming.
- Failure behavior: refusal, partial output, missing context, tool error,
  non-determinism, unsupported format, or platform truncation.
- Validation method: dry run, fixture test, rubric review, schema validation,
  render/playback check, unit test, or human approval gate.

## Chat And Agent Runtimes

- Separate durable instructions from task-local context.
- State tool permissions, stop rules, evidence requirements, and escalation
  triggers for any agent that can act outside the chat response.
- Prefer output schemas or section contracts when downstream parsing matters.
- Add memory rules only when persistence is actually needed; state what must not
  be remembered.
- Include platform-neutral fallbacks for unavailable tools or missing files.

## Image Platforms

- Check how the platform receives references: uploaded image, style image,
  mask/edit input, seed-like control, aspect ratio, or text only.
- Describe visible subject, composition, lighting, materials, camera angle,
  constraints, and what must remain unchanged.
- Avoid relying on abstract intent, hidden text, or exact typography unless the
  platform can control it.
- Validate by inspecting the rendered image for subject accuracy, artifacts,
  brand/source boundary, text legibility, and required dimensions.

## Video Platforms

- Convert intent into shots, duration, camera movement, subject motion,
  continuity, setting, and temporal constraints.
- Distinguish text-to-video, image-to-video, frame extension, product shot, and
  storyboard workflows.
- Keep prompts modular when the platform has short clip limits or weak long-range
  continuity.
- Validate playback for motion coherence, cuts, identity drift, unwanted text,
  timing, frame safety, and required aspect ratio.

## Voice And Multimodal Platforms

- Define speaking role, conversation objective, turn-taking, latency tolerance,
  interruption behavior, allowed tools, and safety handoff.
- For voice, specify tone, pacing, pronunciation needs, disfluency policy, and
  what should be confirmed verbally.
- For multimodal input, state how images, screenshots, audio, or video should be
  inspected and how uncertainty should be reported.
- Validate with a short conversation fixture covering normal input, ambiguity,
  interruption, and unsafe or out-of-scope requests.

## RAG, Coding, And Evaluator Platforms

- RAG: define retrieval scope, source ranking, citation behavior, conflict
  handling, and the answer boundary when sources are insufficient.
- Coding: define repo scope, style conventions, allowed edits, verification
  commands, dependency policy, and how to handle dirty worktrees.
- Evaluator: define rubric dimensions, scoring scale, evidence requirements,
  pass/fail threshold, and how to report uncertainty.
- Validate with fixtures that include one clear pass, one clear fail, and one
  ambiguous or missing-context case.

## Adaptation Output

When platform fit matters, add a short section to the deliverable:

- Target platform assumptions.
- Required runtime capabilities.
- Platform-specific constraints to confirm.
- Fixture or manual check to run before production use.
