from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def build_base_command(python_exe: str, script_path: Path, args: list[str]) -> list[str]:
    return [python_exe, str(script_path), *args]


def run_command(command: list[str], title: str) -> int:
    print(f"## {title}")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    print()
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the standard post-task self-evolution cycle.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--python-exe", default=sys.executable)
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
        help="Permit writing canonical evolution-memory.md/evolution-log.jsonl. Use only for maintainer merge/release work.",
    )
    parser.add_argument("--record-no-change", action="store_true")
    parser.add_argument("--skip-review", action="store_true")
    parser.add_argument("--threshold", type=int, default=2)
    parser.add_argument("--require-target-diversity", type=int, default=1)
    parser.add_argument("--require-context-axes", type=int, default=1)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    scripts_dir = skill_dir / "scripts"

    record_args = [
        "--skill-dir",
        str(skill_dir),
        "--source-task",
        args.source_task,
        "--target-artifact",
        args.target_artifact,
        "--target-type",
        args.target_type,
        "--summary",
        args.summary,
        "--action",
        args.action,
        "--status",
        args.status,
        "--loop",
        args.loop,
    ]

    optional_pairs = [
        ("--domain-key", args.domain_key),
        ("--standard-family", args.standard_family),
        ("--standard-area", args.standard_area),
        ("--task-class", args.task_class),
        ("--task-type", args.task_type),
        ("--meta-focus", args.meta_focus),
        ("--category", args.category),
        ("--impact", args.impact),
        ("--confidence", args.confidence),
        ("--failure-mode", args.failure_mode),
        ("--pattern-key", args.pattern_key),
        ("--principle-key", args.principle_key),
        ("--principle", args.principle),
        ("--abstraction-level", args.abstraction_level),
        ("--entry-date", args.entry_date),
    ]
    for flag, value in optional_pairs:
        if value:
            record_args.extend([flag, value])
    if args.dry_run:
        record_args.append("--dry-run")
    if args.allow_canonical_write:
        record_args.append("--allow-canonical-write")

    should_record = args.status != "no_change" or args.record_no_change
    if should_record:
        rc = run_command(
            build_base_command(args.python_exe, scripts_dir / "record_insight.py", record_args),
            "Record Insight",
        )
        if rc != 0:
            return rc
    else:
        print("## Record Insight")
        print("Skipped recording because status is no_change and --record-no-change was not set.\n")

    if args.skip_review:
        return 0

    review_commands = [
        ("Evolution Review", build_base_command(args.python_exe, scripts_dir / "evolution_review.py", ["--skill-dir", str(skill_dir)])),
        (
            "Suggest Changes",
            build_base_command(
                args.python_exe,
                scripts_dir / "suggest_changes.py",
                [
                    "--skill-dir",
                    str(skill_dir),
                    "--threshold",
                    str(args.threshold),
                    "--require-target-diversity",
                    str(args.require_target_diversity),
                    "--require-context-axes",
                    str(args.require_context_axes),
                ],
            ),
        ),
        ("Propose Upgrade", build_base_command(args.python_exe, scripts_dir / "propose_upgrade.py", ["--skill-dir", str(skill_dir)])),
    ]

    for title, command in review_commands:
        rc = run_command(command, title)
        if rc != 0:
            return rc
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
