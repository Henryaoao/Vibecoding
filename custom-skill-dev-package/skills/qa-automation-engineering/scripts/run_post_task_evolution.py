from __future__ import annotations

import argparse
import getpass
import json
import os
import subprocess
import sys
import uuid
from datetime import date
from pathlib import Path


ROUTE_TO_FAMILY = {
    "testable-point-analysis": "test-quality",
    "testcase-artifact": "test-quality",
    "automation-framework": "automation-quality",
    "web-ui": "automation-quality",
    "api": "automation-quality",
    "mobile": "automation-quality",
    "flaky-repair": "automation-quality",
    "performance-load": "performance-quality",
    "frontend-tdd": "frontend-test-quality",
    "report-diagnosis": "execution-analysis-quality",
    "artifact-audit": "test-quality",
    "mixed": "cross-route-quality",
}

ROUTE_TO_TARGET = {
    "testable-point-analysis": "references/test-design-and-artifact-quality.md",
    "testcase-artifact": "references/test-design-and-artifact-quality.md",
    "automation-framework": "references/automation-framework-and-web.md",
    "web-ui": "references/automation-framework-and-web.md",
    "api": "references/api-and-integration-testing.md",
    "mobile": "references/mobile-testing.md",
    "flaky-repair": "references/automation-framework-and-web.md",
    "performance-load": "references/performance-engineering.md",
    "frontend-tdd": "references/frontend-tdd.md",
    "report-diagnosis": "references/reporting-and-diagnosis.md",
    "artifact-audit": "references/test-design-and-artifact-quality.md",
    "mixed": "references/route-registry.md",
}


def resolve_target(skill_dir: Path, route_key: str, target_scope: str) -> str:
    if target_scope == "common":
        return "qa-automation-engineering/references/common-checklist.md"
    route_path = skill_dir / ROUTE_TO_TARGET[route_key]
    if target_scope == "route":
        return f"qa-automation-engineering/{route_path.relative_to(skill_dir).as_posix()}"
    return (
        "qa-automation-engineering/references/common-checklist.md"
        + " + "
        + f"qa-automation-engineering/{route_path.relative_to(skill_dir).as_posix()}"
    )


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


def resolve_evolution_skill_dir(skill_dir: Path, override: str | None) -> Path:
    if override:
        return Path(override)
    return skill_dir.parent / "agent-self-evolution"


def build_inbox_payload(args: argparse.Namespace, target_artifact: str) -> dict[str, str]:
    return {
        "record_id": str(uuid.uuid4()),
        "date": args.entry_date or date.today().isoformat(),
        "contributor": args.contributor,
        "skill": "qa-automation-engineering",
        "skill_version": read_skill_version(Path(args.skill_dir)),
        "source_task": args.source_task,
        "target_artifact": target_artifact,
        "target_type": "checklist",
        "summary": args.summary,
        "action": args.action,
        "status": args.status,
        "domain_key": args.route_key,
        "standard_family": ROUTE_TO_FAMILY[args.route_key],
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


def read_skill_version(skill_dir: Path) -> str:
    version_file = skill_dir / "references" / "version-state.json"
    if not version_file.exists():
        return ""
    try:
        data = json.loads(version_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return ""
    return str(data.get("version", ""))


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the standard post-task evolution closeout for qa-automation-engineering.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--evolution-skill-dir")
    parser.add_argument("--python-exe", default=sys.executable)
    parser.add_argument("--source-task", required=True)
    parser.add_argument(
        "--route-key",
        choices=sorted(ROUTE_TO_FAMILY.keys()),
        required=True,
    )
    parser.add_argument("--target-scope", choices=["common", "route", "both"], required=True)
    parser.add_argument("--summary", required=True)
    parser.add_argument("--action", required=True)
    parser.add_argument(
        "--status",
        choices=["no_change", "logged", "candidate", "promoted", "released", "deferred"],
        default="logged",
    )
    parser.add_argument("--task-class", choices=["trivial", "standard", "substantial", "critical"], default="standard")
    parser.add_argument("--task-type", default="qa-task")
    parser.add_argument("--standard-area")
    parser.add_argument("--loop", choices=["target", "meta", "both"], default="both")
    parser.add_argument("--meta-focus")
    parser.add_argument("--category")
    parser.add_argument("--impact")
    parser.add_argument("--confidence")
    parser.add_argument("--failure-mode")
    parser.add_argument("--pattern-key")
    parser.add_argument("--principle-key")
    parser.add_argument("--principle")
    parser.add_argument("--abstraction-level", choices=["symptom", "failure_mode", "principle", "rule"], default="principle")
    parser.add_argument("--contributor", default=getpass.getuser())
    parser.add_argument("--entry-date")
    parser.add_argument("--record-no-change", action="store_true")
    parser.add_argument("--skip-review", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    target_artifact = resolve_target(skill_dir, args.route_key, args.target_scope)

    should_record = args.status != "no_change" or args.record_no_change
    if should_record:
        inbox_payload = build_inbox_payload(args, target_artifact)
        inbox_path = skill_dir.parent / "evolution-inbox" / f"{args.contributor}.evolution-log.jsonl"
        if args.dry_run:
            print(json.dumps(inbox_payload, ensure_ascii=False))
            print(f"Dry run: would append collaborator inbox record to {inbox_path}")
        else:
            append_jsonl(inbox_path, inbox_payload)
            print(f"Recorded collaborator inbox insight in {inbox_path}")
    else:
        print("Skipped recording because status is no_change and --record-no-change was not set.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
