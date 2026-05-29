from __future__ import annotations

import argparse
import getpass
import os
import json
import subprocess
import sys
import uuid
from datetime import date
from pathlib import Path


DOMAIN_TO_FAMILY = {
    "prd": "requirements-quality",
    "code-review": "code-quality",
    "test-artifact": "test-quality",
    "research": "analysis-quality",
    "workflow": "process-quality",
    "skill-release": "skill-release-quality",
    "generic": "cross-domain-quality",
}


def resolve_target(skill_dir: Path, domain_key: str, target_scope: str) -> str:
    if target_scope == "common":
        return "adaptive-audit/references/common-checklist.md"
    domain_path = skill_dir / "references" / "domains" / f"{domain_key}.md"
    if target_scope == "domain":
        return f"adaptive-audit/{domain_path.relative_to(skill_dir).as_posix()}"
    return "adaptive-audit/references/common-checklist.md + adaptive-audit/references/domains/" + f"{domain_key}.md"


def run_command(command: list[str]) -> int:
    result = subprocess.run(command, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    return result.returncode


def append_jsonl(path: Path, payload: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    if existing and not existing.endswith("\n"):
        existing += "\n"
    path.write_text(existing + json.dumps(payload, ensure_ascii=False) + "\n", encoding="utf-8")


def read_skill_version(skill_dir: Path) -> str:
    version_file = skill_dir / "references" / "version-state.json"
    if not version_file.exists():
        return ""
    try:
        data = json.loads(version_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return ""
    return str(data.get("version", ""))


def build_inbox_payload(args: argparse.Namespace, skill_dir: Path, target_artifact: str, target_type: str) -> dict[str, str]:
    return {
        "record_id": str(uuid.uuid4()),
        "date": args.entry_date or date.today().isoformat(),
        "contributor": args.contributor,
        "skill": "adaptive-audit",
        "skill_version": read_skill_version(skill_dir),
        "source_task": args.source_task,
        "target_artifact": target_artifact,
        "target_type": target_type,
        "summary": args.summary,
        "action": args.action,
        "status": args.status,
        "domain_key": args.domain_key,
        "standard_family": DOMAIN_TO_FAMILY[args.domain_key],
        "standard_area": args.standard_area or "",
        "task_class": args.task_class,
        "task_type": args.task_type,
        "loop": args.loop,
        "meta_focus": args.meta_focus or "",
        "category": args.category or "",
        "impact": args.impact or "",
        "confidence": args.confidence or "",
        "failure_mode": args.failure_mode or "",
        "pattern_key": args.pattern_key or "",
        "principle_key": args.principle_key or "",
        "principle": args.principle or "",
        "abstraction_level": args.abstraction_level,
        "merge_status": "pending",
    }


def resolve_evolution_skill_dir(skill_dir: Path, override: str | None) -> Path:
    if override:
        return Path(override)
    candidates = [skill_dir.parent / "agent-self-evolution"]
    codex_home = os.environ.get("CODEX_HOME")
    if codex_home:
        candidates.append(Path(codex_home) / "skills" / "agent-self-evolution")
    candidates.append(Path.home() / ".codex" / "skills" / "agent-self-evolution")
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[-1]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run the standard post-audit evolution closeout for adaptive-audit.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  Read-only rehearsal:\n"
            "    python scripts/run_post_audit_evolution.py --source-task demo "
            "--domain-key test-artifact --target-scope domain --summary preview "
            "--action preview --status no_change --dry-run --skip-review\n\n"
            "  Durable no-change closeout without backlog review:\n"
            "    python scripts/run_post_audit_evolution.py --source-task demo "
            "--domain-key test-artifact --target-scope domain --summary done "
            "--action no_change --status no_change --record-no-change "
            "--skip-review"
        ),
    )
    parser.add_argument(
        "--skill-dir",
        default=str(Path(__file__).resolve().parents[1]),
        help="Adaptive-audit skill root. Defaults to the parent of this script.",
    )
    parser.add_argument(
        "--evolution-skill-dir",
        help="Override the sibling agent-self-evolution skill directory when needed.",
    )
    parser.add_argument(
        "--python-exe",
        default=sys.executable,
        help="Python executable used for downstream self-evolution scripts.",
    )
    parser.add_argument("--source-task", required=True, help="Stable identifier for the completed audit unit.")
    parser.add_argument(
        "--domain-key",
        choices=["prd", "code-review", "test-artifact", "research", "workflow", "skill-release", "generic"],
        required=True,
        help="Selected adaptive-audit domain for the completed audit.",
    )
    parser.add_argument(
        "--target-scope",
        choices=["common", "domain", "both"],
        required=True,
        help="Which adaptive-audit standards layer the learning targets.",
    )
    parser.add_argument("--summary", required=True, help="Short reusable summary of the learning or closeout.")
    parser.add_argument("--action", required=True, help="Planned action or explicit no-change conclusion.")
    parser.add_argument(
        "--status",
        choices=["no_change", "logged", "candidate", "promoted", "released", "deferred"],
        default="logged",
        help="Lifecycle state to record for the closeout.",
    )
    parser.add_argument(
        "--task-class",
        choices=["trivial", "standard", "substantial", "critical"],
        default="standard",
        help="Task criticality used by the post-audit gate.",
    )
    parser.add_argument("--task-type", default="audit", help="Free-form audit type label, such as workbook-audit.")
    parser.add_argument("--standard-area", help="More precise standards area inside the selected domain family.")
    parser.add_argument(
        "--loop",
        choices=["target", "meta", "both"],
        default="both",
        help="Whether the learning affected the target standards, the meta loop, or both.",
    )
    parser.add_argument("--meta-focus", help="Optional short Loop 2 focus label.")
    parser.add_argument("--category", help="Optional reusable category tag.")
    parser.add_argument("--impact", help="Optional impact summary.")
    parser.add_argument("--confidence", help="Optional confidence label or score.")
    parser.add_argument("--failure-mode", help="Optional reusable failure mode statement.")
    parser.add_argument("--pattern-key", help="Optional stable pattern key.")
    parser.add_argument("--principle-key", help="Optional stable principle key.")
    parser.add_argument("--principle", help="Optional generalized principle text.")
    parser.add_argument("--contributor", default=getpass.getuser(), help="Contributor name for collaborator inbox records. Defaults to the local OS username.")
    parser.add_argument("--entry-date", help="Record date. Defaults to today.")
    parser.add_argument(
        "--abstraction-level",
        choices=["symptom", "failure_mode", "principle", "rule"],
        default="principle",
        help="Most generalized level that the current closeout safely reached.",
    )
    parser.add_argument(
        "--record-no-change",
        action="store_true",
        help="Persist an explicit no-change record instead of leaving that outcome console-only.",
    )
    parser.add_argument(
        "--skip-review",
        action="store_true",
        help="Skip evolution backlog review, suggestion, and proposal commands after the record step.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview the record payload without writing inbox or canonical evolution files.",
    )
    parser.add_argument(
        "--allow-canonical-write",
        action="store_true",
        help="Write adaptive-audit canonical evolution-memory.md/evolution-log.jsonl. Use only for maintainer merge/release work.",
    )
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    evolution_skill_dir = resolve_evolution_skill_dir(skill_dir, args.evolution_skill_dir)
    target_artifact = resolve_target(skill_dir, args.domain_key, args.target_scope)
    target_type = "checklist" if args.target_scope in {"common", "domain", "both"} else "skill"
    scripts_dir = evolution_skill_dir / "scripts"
    if not scripts_dir.exists():
        print(
            "agent-self-evolution scripts directory not found: "
            f"{scripts_dir}",
            file=sys.stderr,
        )
        return 2

    if args.dry_run and not args.skip_review:
        print(
            "Dry run enabled: the insight payload will be previewed only. "
            "Review commands still run unless --skip-review is also set.",
            file=sys.stderr,
        )

    record_command = [
        args.python_exe,
        str(scripts_dir / "record_insight.py"),
        "--skill-dir",
        str(skill_dir),
        "--source-task",
        args.source_task,
        "--target-artifact",
        target_artifact,
        "--target-type",
        target_type,
        "--summary",
        args.summary,
        "--action",
        args.action,
        "--status",
        args.status,
        "--domain-key",
        args.domain_key,
        "--standard-family",
        DOMAIN_TO_FAMILY[args.domain_key],
        "--task-class",
        args.task_class,
        "--task-type",
        args.task_type,
        "--loop",
        args.loop,
        "--abstraction-level",
        args.abstraction_level,
        "--entry-date",
        args.entry_date or date.today().isoformat(),
    ]

    optional_pairs = [
        ("--standard-area", args.standard_area),
        ("--meta-focus", args.meta_focus),
        ("--category", args.category),
        ("--impact", args.impact),
        ("--confidence", args.confidence),
        ("--failure-mode", args.failure_mode),
        ("--pattern-key", args.pattern_key),
        ("--principle-key", args.principle_key),
        ("--principle", args.principle),
    ]
    for flag, value in optional_pairs:
        if value:
            record_command.extend([flag, value])
    if args.dry_run:
        record_command.append("--dry-run")
    if args.allow_canonical_write:
        record_command.append("--allow-canonical-write")

    # record_insight.py already accepts status=no_change. This flag only decides
    # whether the wrapper should emit an explicit no-change record at all.
    should_record = args.status != "no_change" or args.record_no_change
    if should_record:
        if args.allow_canonical_write:
            rc = run_command(record_command)
            if rc != 0:
                return rc
        else:
            inbox_payload = build_inbox_payload(args, skill_dir, target_artifact, target_type)
            inbox_path = skill_dir.parent / "evolution-inbox" / f"{args.contributor}.evolution-log.jsonl"
            if args.dry_run:
                print(json.dumps(inbox_payload, ensure_ascii=False))
                print(f"Dry run: would append collaborator inbox record to {inbox_path}")
            else:
                append_jsonl(inbox_path, inbox_payload)
                print(f"Recorded collaborator inbox insight in {inbox_path}")
    else:
        print(
            "Skipped recording because status is no_change and --record-no-change "
            "was not set.",
        )

    if args.skip_review:
        return 0

    if not args.allow_canonical_write:
        print("Skipped canonical evolution review because collaborator-local runs write inbox records only.")
        return 0

    review_commands = [
        [args.python_exe, str(scripts_dir / "evolution_review.py"), "--skill-dir", str(skill_dir)],
        [args.python_exe, str(scripts_dir / "suggest_changes.py"), "--skill-dir", str(skill_dir)],
        [args.python_exe, str(scripts_dir / "propose_upgrade.py"), "--skill-dir", str(skill_dir)],
    ]
    for command in review_commands:
        rc = run_command(command)
        if rc != 0:
            return rc
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
