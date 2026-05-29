# Evolution Loop

Run this loop after every completed task.

For trivial tasks, allow a quick `no change` conclusion.

## 1. Classify the task

Choose:

- trivial
- standard
- substantial
- critical

Use `references/integration-contract.md` when the depth is unclear.

## 2. Capture the task signal

Write down:

- task type
- target artifact
- observed friction
- observed success
- workaround or surprise

## 3. Decide whether learning exists

No learning signal if:

- the task was trivial
- the issue was purely accidental and local
- the case does not generalize

If no learning exists, emit `no change` and stop.

## 4. If learning exists, abstract upward

Move from:

- symptom
- failure mode
- principle
- reusable rule

## 5. Check both loops

- Loop 1: should the target artifact evolve?
- Loop 2: should the evolution method itself evolve?

Use `references/meta-optimization-checks.md` for Loop 2.

## 6. Choose an action

- no change
- log only
- candidate
- promotion proposal
- release proposal
