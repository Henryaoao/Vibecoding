# Validation Fixtures Reference

Use these lightweight fixtures to test whether an instruction asset is usable,
bounded, and aligned with the requested surface. Adapt the content to the user's
domain instead of copying it mechanically.

## General Prompt

- Request: "Rewrite this customer update so it is concise, calm, and preserves
  all commitments."
- Expected artifact: A ready-to-use prompt with source/content boundary,
  style constraints, output format, and insufficiency behavior.
- Pass criteria: Keeps user text separate from instructions; defines tone and
  length; forbids new commitments; returns only the rewritten update unless
  asked for rationale.
- Red flags: Vague "make it better"; no boundary for invented facts; asks for
  hidden reasoning; no output contract.

## Agent Spec

- Request: "Create an agent that monitors support tickets and drafts escalation
  summaries."
- Expected artifact: Agent mission, tools, permissions, memory, workflow,
  stop rules, human approvals, outputs, and evaluation.
- Pass criteria: Read-only default; explicit escalation thresholds; no automatic
  customer messages without approval; evidence links in summaries.
- Red flags: Unbounded inbox access; vague autonomy; no privacy handling; no
  failure path for missing ticket data.

## Skill Blueprint

- Request: "Package our release-note writing process as a Codex skill."
- Expected artifact: Skill scope, trigger description, SKILL.md body outline,
  references/templates plan, and validation checklist.
- Pass criteria: Progressive disclosure; no raw source dumps; clear reference
  loading rules; templates only where reusable.
- Red flags: README-style docs in the skill package; bloated SKILL.md; local
  machine paths; no fixture for behavior validation.

## Workflow

- Request: "Design a repeatable workflow for turning a PRD into test cases."
- Expected artifact: Ordered stages, inputs/outputs, human gates, deterministic
  checks, ownership, and pass/fail criteria.
- Pass criteria: Separates extraction, coverage mapping, row generation,
  review, and rework; defines traceability; includes stop conditions.
- Red flags: Treats the workflow as a single prompt; no evidence gate; no
  handling for missing requirements.

## Image

- Request: "Prompt an image model for a realistic product hero image from this
  reference."
- Expected artifact: Still-image prompt with subject, composition, lighting,
  material, camera, reference-control rules, aspect ratio, and QA checklist.
- Pass criteria: States what must remain unchanged; avoids unsupported exact
  text claims; includes artifact checks for realism and brand consistency.
- Red flags: Abstract style words only; no reference boundary; no dimension or
  composition target; asks for impossible fine text.

## Video

- Request: "Create a 6-second product reveal video prompt."
- Expected artifact: Text-to-video or image-to-video prompt with shot, motion,
  timing, camera, continuity, negative constraints, and playback QA.
- Pass criteria: Duration is explicit; motion is physically inspectable; first
  and final frames are described; continuity risks are called out.
- Red flags: Static image prompt reused as video; no timing; conflicting camera
  moves; no identity-drift checks.

## Voice Or Multimodal

- Request: "Design a realtime voice assistant prompt for onboarding calls."
- Expected artifact: Voice behavior prompt with role, turn-taking, tone,
  confirmation behavior, tool rules, interruption handling, and transcript QA.
- Pass criteria: Defines what to say aloud vs log silently; handles ambiguity;
  includes escalation for sensitive topics.
- Red flags: Text-chat prompt pasted into voice; no latency or interruption
  rules; collects sensitive data without consent.

## RAG

- Request: "Write a RAG answer prompt for internal policy questions."
- Expected artifact: Prompt with retrieval scope, citation rules, conflict
  handling, insufficient-source behavior, and answer format.
- Pass criteria: Answers only from retrieved sources; cites specific evidence;
  flags missing or conflicting policy; separates summary from sources.
- Red flags: Uses model memory as policy truth; no citation requirement; hides
  uncertainty; treats stale sources as current.

## Coding

- Request: "Create a coding-agent prompt to fix a bug in an existing repo."
- Expected artifact: Coding prompt with repo-reading sequence, edit scope,
  style constraints, dirty-worktree handling, tests, and final reporting.
- Pass criteria: Reads before editing; preserves unrelated changes; lists
  verification commands; asks before destructive operations.
- Red flags: Broad refactor license; no tests; ignores user changes; uses
  destructive git commands by default.

## Evaluator

- Request: "Build a reviewer prompt for scoring generated PRDs."
- Expected artifact: Evaluator prompt with rubric, scale, evidence requirements,
  severity definitions, pass threshold, and report format.
- Pass criteria: Findings cite exact evidence; severity is calibrated; missing
  evidence is a failure mode; summary follows findings.
- Red flags: Taste-based critique; no pass/fail threshold; no source boundary;
  averages away critical blockers.
