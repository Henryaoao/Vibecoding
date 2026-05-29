from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path


def append_text(path: Path, text: str) -> None:
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    if existing and not existing.endswith("\n"):
        existing += "\n"
    path.write_text(existing + text, encoding="utf-8")


def append_jsonl(path: Path, payload: dict[str, str]) -> None:
    append_text(path, json.dumps(payload, ensure_ascii=False) + "\n")


def build_note(args: argparse.Namespace) -> str:
    lines = [
        "",
        f"- Date: {args.entry_date or date.today().isoformat()}",
        f"- Source task: {args.source_task}",
        f"- Target artifact: {args.target_artifact}",
        f"- Target type: {args.target_type}",
    ]
    optional = [
        ("Domain key", args.domain_key),
        ("Standard family", args.standard_family),
        ("Standard area", args.standard_area),
        ("Task class", args.task_class),
        ("Task type", args.task_type),
        ("Loop", args.loop),
        ("Meta focus", args.meta_focus),
        ("Category", args.category),
        ("Impact", args.impact),
        ("Confidence", args.confidence),
        ("Failure mode", args.failure_mode),
        ("Pattern key", args.pattern_key),
        ("Principle key", args.principle_key),
        ("Principle", args.principle),
        ("Abstraction level", args.abstraction_level),
    ]
    for label, value in optional:
        if value:
            lines.append(f"- {label}: {value}")
    lines.extend(
        [
            f"- Summary: {args.summary}",
            f"- Recommended action: {args.action}",
            f"- Status: {args.status}",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Record a structured self-evolution insight.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--source-task", required=True)
    parser.add_argument("--target-artifact", required=True)
    parser.add_argument("--target-type", choices=["agent", "skill", "checklist", "script", "workflow", "prompt", "template", "governance"], required=True)
    parser.add_argument("--summary", required=True)
    parser.add_argument("--action", required=True)
    parser.add_argument("--status", choices=["no_change", "logged", "candidate", "promoted", "released", "deferred"], default="logged")
    parser.add_argument("--domain-key")
    parser.add_argument("--standard-family")
    parser.add_argument("--standard-area")
    parser.add_argument("--task-class", choices=["trivial", "standard", "substantial", "critical"])
    parser.add_argument("--task-type")
    parser.add_argument("--loop", choices=["target", "meta", "both"], default="target")
    parser.add_argument("--meta-focus")
    parser.add_argument("--category")
    parser.add_argument("--impact")
    parser.add_argument("--confidence")
    parser.add_argument("--failure-mode")
    parser.add_argument("--pattern-key")
    parser.add_argument("--principle-key")
    parser.add_argument("--principle")
    parser.add_argument("--abstraction-level", choices=["symptom", "failure_mode", "principle", "rule"])
    parser.add_argument("--entry-date")
    parser.add_argument(
        "--allow-canonical-write",
        action="store_true",
        help="Required to write references/evolution-memory.md and references/evolution-log.jsonl. Use only for maintainer merge/release work.",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    memory_path = skill_dir / "references" / "evolution-memory.md"
    log_path = skill_dir / "references" / "evolution-log.jsonl"
    note = build_note(args)
    payload = {
        "date": args.entry_date or date.today().isoformat(),
        "source_task": args.source_task,
        "target_artifact": args.target_artifact,
        "target_type": args.target_type,
        "summary": args.summary,
        "action": args.action,
        "status": args.status,
        "domain_key": args.domain_key or "",
        "standard_family": args.standard_family or "",
        "standard_area": args.standard_area or "",
        "task_class": args.task_class or "",
        "task_type": args.task_type or "",
        "loop": args.loop or "",
        "meta_focus": args.meta_focus or "",
        "category": args.category or "",
        "impact": args.impact or "",
        "confidence": args.confidence or "",
        "failure_mode": args.failure_mode or "",
        "pattern_key": args.pattern_key or "",
        "principle_key": args.principle_key or "",
        "principle": args.principle or "",
        "abstraction_level": args.abstraction_level or "",
    }

    if args.dry_run:
        print(note, end="")
        print(json.dumps(payload, ensure_ascii=False))
        return 0

    if not args.allow_canonical_write:
        print(
            "Refusing to write canonical evolution history without --allow-canonical-write. "
            "Collaborator-local evolution must be recorded through the host skill's evolution-inbox wrapper; "
            "canonical evolution-memory.md/evolution-log.jsonl writes are reserved for maintainer merge/release work.",
            file=sys.stderr,
        )
        return 2

    append_text(memory_path, note)
    append_jsonl(log_path, payload)
    print(f"Recorded insight in {memory_path}")
    print(f"Recorded structured insight in {log_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
