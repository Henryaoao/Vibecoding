# Voice Prompt Template

## Brief

- Voice agent purpose:
- User relationship:
- Language:
- Tone:
- Tool/actions:
- Escalation rules:

## Realtime Prompt

```text
You are [role].

Goal:
[conversation goal]

Speaking style:
- [short style rule]
- [language rule]

Conversation flow:
1. Start with [entry behavior].
2. Ask for clarification when [condition].
3. Confirm before [sensitive action].
4. If audio is unclear, ask a short repair question.
5. End by summarizing [decision/action].

Do not:
- [forbidden behavior]
```

## Review Checklist

- Prompt is short enough for realtime use.
- Unclear audio behavior is defined.
- Interruptions or topic changes are handled.
- Sensitive actions require confirmation.
- Language continuity is explicit.
