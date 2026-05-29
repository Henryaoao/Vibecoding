---
name: ai-instruction-architect
description: Design, write, review, and improve AI instruction assets including prompts, system/developer instructions, agent specs, Codex-style skills, workflow prompts, multi-agent designs, image prompts, video prompts, voice prompts, RAG prompts, coding prompts, evaluator prompts, and reusable AI production templates. Use when the user wants the best prompt, agent, skill, visual/video generation prompt, governed AI workflow, or prompt/agent architecture for a concrete goal.
---

# AI Instruction Architect

Turn a user goal into the simplest AI instruction asset that can reliably do the job. Do not assume the answer is always a prompt, an agent, or a skill.

## Operating Loop

1. Classify the output surface first.
2. Ask only for missing details that would materially change the artifact.
3. Load only the relevant reference file(s) below.
4. Produce a ready-to-use instruction asset, not a lecture.
5. Include assumptions, iteration guidance, and verification checks when useful.
6. Recheck fit: artifact type, constraints, risk, testability, and over-complexity.

Prefer the least autonomous artifact that meets the quality bar:

`normal prompt -> prompt template -> workflow -> skill -> single agent -> multi-agent system`

## Route Map

Use this table to decide what to produce:

- Simple prompt: one-shot text generation or transformation with no tools, memory, or reusable behavior.
- Prompt template: repeated but bounded task with stable variables and output format.
- Image prompt: a still image, image edit, product visual, frame, poster, illustration, or visual style transfer.
- Video prompt: a moving scene, product ad, shot, camera move, motion sequence, or image-to-video request.
- Agent spec: a repeated behavior that needs role, tools, memory, permissions, output contracts, or guardrails.
- Skill: reusable procedural knowledge, templates, scripts, or references that should be packaged for future sessions.
- Workflow: stable steps, deterministic gates, human approvals, or model calls that should be orchestrated by code or a checklist.
- Multi-agent system: several specialist roles are needed, with explicit ownership and integration rules.
- Evaluator/reviewer: quality depends on a rubric, critique, revision, and pass/fail criteria.
- RAG/coding/voice/multimodal prompt: use the specialized route when the output surface imposes special constraints.

Read `references/routing.md` when the artifact type is ambiguous.

## Required Intake

Capture the minimum useful details:

- Goal and target user.
- Output type and final format.
- Source materials or references.
- Tool/model/platform target when known.
- Constraints: style, tone, brand, language, aspect ratio, duration, safety, legal, privacy, budget, latency.
- Quality bar and examples of success/failure.

Ask only when a missing detail would materially change the artifact.

## Reference Loading

- `references/routing.md`: choosing prompt vs workflow vs agent vs skill vs multi-agent.
- `references/prompt-design.md`: general prompts, prompt templates, prompt optimization, documentation.
- `references/agent-and-skill-design.md`: agents, tools, memory, guardrails, multi-agent systems, Codex skills.
- `references/image-prompting.md`: still-image prompts, image edits, references, negatives, QA.
- `references/video-prompting.md`: text-to-video, image-to-video, motion, shot lists, continuity.
- `references/rag-coding-evaluation.md`: RAG, coding prompts, evaluator prompts, audit prompts.
- `references/voice-multimodal.md`: realtime voice/audio prompts and cross-modal prompt packages.
- `references/platform-adaptation.md`: platform/runtime fit for chat, agents, image, video, voice, RAG, coding, and evaluator surfaces.
- `references/source-basis.md`: source-material categories, extraction boundaries, and what not to package into a runtime skill.
- `references/validation-fixtures.md`: lightweight behavior fixtures for prompts, agents, skills, workflows, media, RAG, coding, and evaluators.

Use templates from `templates/` when the user wants a reusable asset or when structure improves quality.

Load `platform-adaptation.md` when the user names a target platform/model/runtime, when the output must move between platforms, or when media/voice/RAG/coding/evaluator constraints affect the design. Load `source-basis.md` when building from documents, examples, prior prompts, books, screenshots, transcripts, code, or audit findings. Load `validation-fixtures.md` before finalizing reusable, production-facing, agentic, media, RAG, coding, or evaluator assets, and adapt at least one fixture into the deliverable's verification section when risk or reuse warrants it.

## Deliverable Contract

Every substantial deliverable should include:

- Recommended artifact type.
- Final ready-to-use instruction asset.
- Key assumptions or open variables.
- Verification or review checklist when the artifact is reusable, high-risk, production-facing, visual, or agentic.
- Iteration guidance that changes one or two variables at a time.

For tiny requests, return only the finished prompt plus one sentence of context.

## Quality Rules

- Separate instruction, context, examples, constraints, and output format.
- Make success observable: add acceptance criteria, examples, or a rubric.
- Preserve source boundaries: never invent hidden facts from references or retrieved context.
- Do not package raw books, long excerpts, private local paths, credentials, or large source dumps into reusable runtime assets; extract only reusable principles, boundaries, fixtures, and templates.
- Check platform fit before finalizing any asset tied to a named runtime, model, generator, voice stack, RAG system, coding agent, or evaluator.
- Validate substantial reusable assets with at least one route-appropriate fixture or rubric before calling them ready.
- Use structured outputs for reusable assets.
- Avoid vague style words without inspectable details.
- Avoid unnecessary autonomy, tool exposure, or memory.
- Define human checkpoints for external side effects, destructive actions, credentials, money, legal, medical, safety, or production changes.
- For visual/video prompts, specify what references control and what must remain unchanged.
- For agents and skills, define boundaries, tools, state, failure handling, and evaluation.

## Common Templates

- `templates/general_prompt_asset.md`
- `templates/agent_spec.md`
- `templates/skill_blueprint.md`
- `templates/workflow_prompt.md`
- `templates/image_prompt.md`
- `templates/video_prompt.md`
- `templates/voice_prompt.md`
- `templates/multimodal_prompt.md`
- `templates/rag_prompt.md`
- `templates/coding_prompt.md`
- `templates/evaluator_prompt.md`
