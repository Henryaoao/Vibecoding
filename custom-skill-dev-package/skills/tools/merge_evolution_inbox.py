#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path
from typing import Any


SCAN_FIELDS = [
    "source_task",
    "summary",
    "action",
    "failure_mode",
    "pattern_key",
    "principle_key",
    "principle",
    "standard_area",
    "task_type",
    "meta_focus",
    "category",
]


def load_jsonl(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    malformed: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError as exc:
            malformed.append({"file": str(path), "line": line_no, "error": str(exc)})
            continue
        if not isinstance(payload, dict):
            malformed.append({"file": str(path), "line": line_no, "error": "line is not a JSON object"})
            continue
        payload["_source_file"] = str(path)
        payload["_source_line"] = line_no
        records.append(payload)
    return records, malformed


def semantic_key(record: dict[str, Any]) -> str:
    principle_key = str(record.get("principle_key") or "").strip()
    if not principle_key:
        principle_key = "summary:" + str(record.get("summary") or "").strip().lower()
    return "|".join(
        [
            str(record.get("skill") or "").strip(),
            principle_key,
            str(record.get("target_artifact") or "").strip(),
        ]
    )


def find_deny_hits(records: list[dict[str, Any]], deny_patterns: list[str]) -> list[dict[str, Any]]:
    patterns = [pattern.strip() for pattern in deny_patterns if pattern.strip()]
    hits: list[dict[str, Any]] = []
    if not patterns:
        return hits
    lowered = [(pattern, pattern.lower()) for pattern in patterns]
    for record in records:
        for field in SCAN_FIELDS:
            value = str(record.get(field) or "")
            value_lower = value.lower()
            for original, pattern_lower in lowered:
                if pattern_lower in value_lower:
                    hits.append(
                        {
                            "file": record.get("_source_file"),
                            "line": record.get("_source_line"),
                            "record_id": record.get("record_id"),
                            "skill": record.get("skill"),
                            "field": field,
                            "pattern": original,
                        }
                    )
    return hits


def build_report(inbox_dir: Path, deny_patterns: list[str] | None = None) -> dict[str, Any]:
    files = sorted(inbox_dir.glob("*.evolution-log.jsonl"))
    all_records: list[dict[str, Any]] = []
    malformed: list[dict[str, Any]] = []
    for path in files:
        records, bad = load_jsonl(path)
        all_records.extend(records)
        malformed.extend(bad)

    seen: dict[str, dict[str, Any]] = {}
    duplicates: list[dict[str, Any]] = []
    unique: list[dict[str, Any]] = []
    for record in all_records:
        record_id = str(record.get("record_id") or "").strip()
        if record_id and record_id in seen:
            duplicates.append(
                {
                    "record_id": record_id,
                    "first_file": seen[record_id].get("_source_file"),
                    "duplicate_file": record.get("_source_file"),
                    "duplicate_line": record.get("_source_line"),
                }
            )
            continue
        if record_id:
            seen[record_id] = record
        unique.append(record)

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in unique:
        grouped[semantic_key(record)].append(record)

    groups = []
    for key, records in sorted(grouped.items()):
        contributors = sorted({str(r.get("contributor") or "") for r in records if r.get("contributor")})
        statuses = sorted({str(r.get("status") or "") for r in records if r.get("status")})
        actions = sorted({str(r.get("action") or "") for r in records if r.get("action")})
        groups.append(
            {
                "key": key,
                "count": len(records),
                "contributors": contributors,
                "statuses": statuses,
                "actions": actions,
                "records": records,
            }
        )

    return {
        "inbox_dir": str(inbox_dir),
        "files": [str(path) for path in files],
        "records_loaded": len(all_records),
        "records_unique": len(unique),
        "duplicates": duplicates,
        "malformed": malformed,
        "deny_hits": find_deny_hits(unique, deny_patterns or []),
        "groups": groups,
    }


def print_markdown(report: dict[str, Any]) -> None:
    print("# Evolution Inbox Preflight Report")
    print()
    print(f"- inbox_dir: `{report['inbox_dir']}`")
    print(f"- files_reviewed: {len(report['files'])}")
    print(f"- records_loaded: {report['records_loaded']}")
    print(f"- records_unique: {report['records_unique']}")
    print(f"- duplicates: {len(report['duplicates'])}")
    print(f"- malformed: {len(report['malformed'])}")
    print(f"- deny_hits: {len(report['deny_hits'])}")
    print(f"- semantic_groups: {len(report['groups'])}")
    print()

    if report["malformed"]:
        print("## Malformed Lines")
        for item in report["malformed"]:
            print(f"- `{item['file']}` line {item['line']}: {item['error']}")
        print()

    if report["duplicates"]:
        print("## Duplicate Record IDs")
        for item in report["duplicates"]:
            print(
                f"- `{item['record_id']}` duplicate at `{item['duplicate_file']}` line {item['duplicate_line']} "
                f"(first seen in `{item['first_file']}`)"
            )
        print()

    if report["deny_hits"]:
        print("## Possible Project Residue")
        for item in report["deny_hits"]:
            print(
                f"- `{item['file']}` line {item['line']}: field `{item['field']}` "
                f"matches deny pattern `{item['pattern']}`"
            )
        print()

    print("## Semantic Groups")
    for group in report["groups"]:
        print(f"- `{group['key']}`")
        print(f"  - count: {group['count']}")
        print(f"  - contributors: {', '.join(group['contributors']) or 'unknown'}")
        print(f"  - statuses: {', '.join(group['statuses']) or 'unknown'}")
        if len(group["actions"]) > 1:
            print("  - action_conflict: yes")
        else:
            print("  - action_conflict: no")
    print()
    print("Next step: use MERGE_EVOLUTION.md to decide no_change, candidate, promoted, released, or deferred for each group.")


def main() -> int:
    parser = argparse.ArgumentParser(description="Preflight collaborator evolution inbox records.")
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--out-json")
    parser.add_argument(
        "--deny-pattern",
        action="append",
        default=[],
        help="Project/customer/system/repository/ticket term that must not appear in shared evolution records.",
    )
    args = parser.parse_args()

    root = Path(args.root)
    inbox_dir = root / "evolution-inbox"
    if not inbox_dir.exists():
        raise SystemExit(f"inbox directory not found: {inbox_dir}")

    report = build_report(inbox_dir, args.deny_pattern)
    print_markdown(report)
    if args.out_json:
        Path(args.out_json).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
