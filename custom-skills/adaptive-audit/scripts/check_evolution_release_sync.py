from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


LOOSE_STATUSES = {"logged", "candidate", "promoted", "released"}
RELEASE_STATUS = "released"
STOPWORDS = {
    "added",
    "audit",
    "audits",
    "before",
    "from",
    "into",
    "local",
    "release",
    "state",
    "that",
    "this",
    "with",
}


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}")
    except json.JSONDecodeError as exc:
        raise ValueError(f"invalid JSON in {path}: {exc}") from exc


def read_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}")
    for line_no, line in enumerate(lines, start=1):
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise ValueError(f"invalid JSONL in {path}:{line_no}: {exc}") from exc
    return rows


def parse_release_log_current(path: Path) -> tuple[str | None, str | None]:
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}")
    version_match = re.search(r"(?m)^- Version:\s*(\S+)\s*$", text)
    date_match = re.search(r"(?m)^- Date:\s*(\d{4}-\d{2}-\d{2})\s*$", text)
    return (
        version_match.group(1) if version_match else None,
        date_match.group(1) if date_match else None,
    )


def terms(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9][a-z0-9_-]{2,}", text.lower())
    return {word for word in words if word not in STOPWORDS}


def is_matching_release_entry(entry: dict, release_terms: set[str]) -> bool:
    status = entry.get("status", "")
    if status not in LOOSE_STATUSES:
        return False
    text = " ".join(
        str(entry.get(key, ""))
        for key in (
            "source_task",
            "target_artifact",
            "summary",
            "action",
            "task_type",
            "meta_focus",
            "category",
            "principle_key",
            "principle",
        )
    )
    overlap = release_terms.intersection(terms(text))
    governance_signal = (
        "skill" in str(entry.get("task_type", "")).lower()
        or "skill" in str(entry.get("source_task", "")).lower()
        or entry.get("category") in {"governance", "audit-governance"}
        or "release" in str(entry.get("meta_focus", "")).lower()
        or "release" in str(entry.get("principle_key", "")).lower()
    )
    return governance_signal or len(overlap) >= 2


def is_exact_release_entry(entry: dict, release_id: str) -> bool:
    if entry.get("status", "") != RELEASE_STATUS:
        return False
    release_text = " ".join(
        str(entry.get(key, ""))
        for key in ("summary", "action", "task_type", "category", "meta_focus", "principle_key")
    ).lower()
    if "release" not in release_text and "released" not in release_text:
        return False
    return release_id in {
        str(entry.get("release_id", "")).strip(),
        str(entry.get("source_task", "")).strip(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify that the current adaptive-audit release has a matching evolution-log entry."
    )
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    refs = skill_dir / "references"
    errors: list[str] = []

    try:
        state = read_json(refs / "version-state.json")
        log_version, log_date = parse_release_log_current(refs / "release-log.md")
        entries = read_jsonl(refs / "evolution-log.jsonl")
    except ValueError as exc:
        print(f"[FAIL] {exc}", file=sys.stderr)
        return 1

    version = str(state.get("version", "")).strip()
    released_on = str(state.get("released_on", "")).strip()
    summary = str(state.get("summary", "")).strip()
    release_id = str(state.get("release_id", "")).strip()
    if not version:
        errors.append("version-state.json is missing version")
    if not released_on:
        errors.append("version-state.json is missing released_on")
    if not summary:
        errors.append("version-state.json is missing summary")
    if not release_id:
        errors.append("version-state.json is missing release_id")
    if log_version != version:
        errors.append(f"release-log current version {log_version!r} does not match version-state {version!r}")
    if log_date != released_on:
        errors.append(f"release-log current date {log_date!r} does not match version-state {released_on!r}")

    release_terms = terms(summary)
    same_date = [entry for entry in entries if entry.get("date") == released_on]
    loose_matches = [entry for entry in same_date if is_matching_release_entry(entry, release_terms)]
    matches = [entry for entry in same_date if release_id and is_exact_release_entry(entry, release_id)]
    if not matches:
        errors.append(
            "no exact evolution-log entry found for current release "
            f"{version} on {released_on} with release_id {release_id!r}"
        )

    if errors:
        for error in errors:
            print(f"[FAIL] {error}", file=sys.stderr)
        if same_date:
            print(f"Evolution entries on {released_on}:")
            for entry in same_date:
                print(f"- {entry.get('source_task', '')} [{entry.get('status', '')}]")
        if loose_matches and not matches:
            print("Loose release-like entries were ignored because release_id did not match:")
            for entry in loose_matches:
                print(f"- {entry.get('source_task', '')} [{entry.get('status', '')}]")
        return 1

    print(
        "[PASS] Adaptive-audit evolution release sync: "
        f"{version} on {released_on} -> {matches[-1].get('source_task', '')}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
