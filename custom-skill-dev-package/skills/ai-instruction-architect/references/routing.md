# Routing Reference

Use this reference when deciding what kind of AI instruction asset to create.

## Decision Ladder

Choose the simplest surface that gives reliable behavior:

1. Normal prompt: one-off task, no tools, no persistence, low risk.
2. Prompt template: repeated task with stable variables, style, or output format.
3. Workflow: predictable multi-step process, deterministic checks, or human approvals.
4. Skill: reusable domain procedure, templates, references, or scripts that future Codex sessions should load on demand.
5. Single agent: model must decide steps, use tools, maintain context, recover from partial failures, or act over time.
6. Multi-agent system: independent specialist roles, parallel work, adversarial review, or handoffs are genuinely useful.

Do not escalate to an agent only because the task sounds important. Escalate when autonomy, tool use, state, and verification are necessary.

## Prompt Is Enough When

- The task is bounded and can be answered in one pass.
- Inputs are available in the conversation or a small artifact.
- No persistent memory or external side effects are needed.
- Failure is easy for the user to see and correct.

## Use A Workflow When

- Steps are known in advance.
- Deterministic validation matters more than open-ended autonomy.
- Human approval gates are needed.
- The task can be decomposed into repeatable stages.

## Use A Skill When

- Future sessions should reuse domain procedures, templates, references, or scripts.
- The knowledge is local, specialized, or too tedious to restate each time.
- Progressive disclosure matters: metadata triggers the skill, SKILL.md routes, references load only when needed.
- The skill can stay lean; do not bundle raw books, large source dumps, or process notes unless directly needed at runtime.

## Use A Single Agent When

- The model must plan, act, observe, and revise over several steps.
- Tools or files are central to the task.
- The agent needs bounded memory, checkpoints, permissions, or failure handling.
- Success requires more than one LLM call but cannot be fully scripted.

## Use Multi-Agent Only When

- Distinct specialists can work independently.
- One role should critique, evaluate, or integrate another role's work.
- Parallelism materially reduces time or improves coverage.
- Ownership boundaries can be made explicit.

Avoid multi-agent designs where every agent reads the same context and does the same work.

## Risk Routing

Raise the governance level when the asset can affect:

- Production systems, data deletion, code commits, deployments, money, contracts, medical/legal advice, private data, emails/messages to third parties, credential handling, or irreversible external actions.

For these, add explicit permissions, human checkpoints, logs, rollback/stop rules, and evaluation fixtures.

## Output Shape

When the user asks for "the best prompt", include:

- The final prompt.
- Variables to fill.
- Why this structure fits.
- A short test checklist.

When the user asks for an agent/skill/workflow, include:

- Mission.
- Boundaries and non-goals.
- Inputs and outputs.
- Tools/permissions.
- State/memory.
- Workflow.
- Guardrails.
- Evaluation.
