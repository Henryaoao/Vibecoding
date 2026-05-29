from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def load_entries(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        rows.append(json.loads(line))
    return rows


def bump(version: str, level: str) -> str:
    major, minor, patch = [int(part) for part in version.split(".")]
    if level == "major":
        return f"{major + 1}.0.0"
    if level == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"


def choose(entries: list[dict[str, str]]) -> tuple[str, list[str]]:
    reasons: list[str] = []
    target_types = Counter(entry.get("target_type", "") or "unspecified" for entry in entries)
    promoted = sum(1 for entry in entries if entry.get("status") == "promoted")
    domains = {entry.get("domain_key", "") for entry in entries if entry.get("domain_key")}
    standard_families = {entry.get("standard_family", "") for entry in entries if entry.get("standard_family")}
    meta_entries = [
        entry
        for entry in entries
        if entry.get("loop") in {"meta", "both"} or entry.get("target_type") == "governance"
    ]
    meta_focuses = {entry.get("meta_focus", "") for entry in meta_entries if entry.get("meta_focus")}

    if promoted >= 3:
        reasons.append("Several promoted generalized principles accumulated.")
        return "minor", reasons
    if len(target_types) >= 4 and entries:
        reasons.append("Learning now spans multiple artifact types.")
        return "minor", reasons
    if len(domains) >= 3 or len(standard_families) >= 3:
        reasons.append("Learning now spans multiple domain standards families.")
        return "minor", reasons
    if len(meta_entries) >= 2 and len(meta_focuses) >= 2:
        reasons.append("Meta-evolution pressure now spans multiple process weaknesses.")
        return "minor", reasons
    if entries:
        reasons.append("Maintenance or governance evolution is available.")
        return "patch", reasons
    reasons.append("No meaningful accumulated evolution pressure detected.")
    return "patch", reasons


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate an upgrade proposal for the self-evolution skill.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    state = load_json(skill_dir / "references" / "version-state.json")
    entries = load_entries(skill_dir / "references" / "evolution-log.jsonl")
    current = state.get("version", "1.0.0")
    level, reasons = choose(entries)
    proposed = bump(current, level)

    print(f"Current version: {current}")
    print(f"Recommended bump: {level}")
    print(f"Proposed version: {proposed}")
    print()
    print("Rationale:")
    for reason in reasons:
        print(f"- {reason}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
