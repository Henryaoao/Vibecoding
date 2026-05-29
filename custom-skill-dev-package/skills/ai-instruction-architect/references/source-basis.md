# Source Basis Reference

Use this reference when an instruction asset is derived from books, docs,
screenshots, transcripts, examples, product specs, prior prompts, code, or
workflows. The goal is to preserve evidence boundaries without bundling raw
source material into the skill.

## Source Categories

- User-provided task brief: explicit goals, constraints, audience, and desired
  output format.
- Product or domain documents: PRDs, specs, policies, process docs, help pages,
  API docs, schemas, and manuals.
- Existing instruction assets: prompts, agents, skills, workflows, templates,
  rubrics, or evaluation reports.
- Examples and counterexamples: good outputs, bad outputs, edge cases, test
  cases, transcripts, screenshots, and generated media.
- Runtime evidence: platform docs, tool capability notes, logs, validation
  results, model behavior observations, and current configuration.
- Domain literature: books, papers, training materials, or expert notes used to
  extract general principles.

## Extraction Boundaries

- Extract reusable principles, constraints, terms, rubrics, and failure patterns.
- Do not include raw books, long excerpts, full proprietary docs, private
  desktop paths, credentials, tokens, or large source dumps in the runtime skill.
- Keep source-local facts separate from generalized guidance.
- When a fact is source-specific, label it as source-derived and avoid promoting
  it into a universal rule.
- Summarize examples into lightweight fixtures unless exact examples are needed
  for testing and are safe to include.
- Preserve citation or provenance notes in the work product when the user needs
  auditability, but keep the installed skill package clean.

## Synthesis Rules

- Prefer cross-source consensus over a single attractive example.
- Record conflict handling when sources disagree.
- Turn recurring source patterns into checklists or templates.
- Turn fragile source-specific procedures into explicit assumptions or variables.
- If a source cannot be inspected, state the gap instead of inventing details.

## Deliverable Note

When source grounding is material, include:

- Source categories used.
- What was extracted.
- What was intentionally excluded.
- Any open source gaps that affect confidence.
