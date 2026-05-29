# Workflow Standards Pack

Use this pack when the artifact defines operational steps, approvals, handoffs, or SOP-like process behavior.

Apply this pack in addition to `references/common-checklist.md`.

## 1. Actor Model

Check:

- roles are explicit
- ownership is clear
- authority boundaries are defined

## 2. Flow Integrity

Check:

- triggers are defined
- steps are ordered clearly
- handoffs are explicit
- exit conditions are defined

## 3. Failure and Recovery

Check:

- exception paths exist
- retries or escalation paths exist
- stuck-state handling is defined
- rollback or manual intervention is defined when needed

## 4. Observability and Compliance

Check:

- approvals are auditable
- notifications are defined
- compliance steps are explicit
- timing or SLA assumptions are visible
