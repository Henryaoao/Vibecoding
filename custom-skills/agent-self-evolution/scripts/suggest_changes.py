from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path


def normalize(text: str) -> str:
    return " ".join(text.strip().lower().split())


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


def main() -> int:
    parser = argparse.ArgumentParser(description="Suggest generalized evolution changes from accumulated insights.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--threshold", type=int, default=2)
    parser.add_argument("--require-target-diversity", type=int, default=1)
    parser.add_argument("--require-context-axes", type=int, default=1)
    args = parser.parse_args()

    entries = load_entries(Path(args.skill_dir) / "references" / "evolution-log.jsonl")
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for entry in entries:
        if entry.get("status") not in {"candidate", "logged", "promoted"}:
            continue
        domain_key = normalize(entry.get("domain_key", "") or "unspecified")
        principle_key = normalize(entry.get("principle_key") or entry.get("pattern_key") or entry.get("summary", ""))
        key = f"{domain_key}::{principle_key}" if principle_key else ""
        if key:
            grouped[key].append(entry)

    found = 0
    for key, rows in sorted(grouped.items(), key=lambda item: len(item[1]), reverse=True):
        sources = sorted({row.get("source_task", "") for row in rows if row.get("source_task")})
        domains = sorted({row.get("domain_key", "") for row in rows if row.get("domain_key")})
        target_types = sorted({row.get("target_type", "") for row in rows if row.get("target_type")})
        task_types = sorted({row.get("task_type", "") for row in rows if row.get("task_type")})
        categories = sorted({row.get("category", "") for row in rows if row.get("category")})
        loops = sorted({row.get("loop", "") for row in rows if row.get("loop")})
        context_axes = sum(
            1
            for values in (sources, domains, target_types, task_types, categories, loops)
            if len(values) >= 2
        )
        if len(sources) < args.threshold:
            continue
        if len(target_types) < args.require_target_diversity:
            continue
        if context_axes < args.require_context_axes:
            continue
        found += 1
        print(f"Principle: {rows[0].get('principle') or rows[0].get('summary') or key}")
        print(f"Principle key: {rows[0].get('principle_key') or key}")
        print(f"Domain key: {rows[0].get('domain_key') or 'unspecified'}")
        print(f"Occurrences: {len(rows)}")
        print(f"Context axes >= 2 distinct values: {context_axes}")
        if domains:
            print("Domains:")
            for domain in domains:
                print(f"- {domain}")
        print("Target types:")
        for target_type in target_types:
            print(f"- {target_type}")
        if task_types:
            print("Task types:")
            for task_type in task_types:
                print(f"- {task_type}")
        if categories:
            print("Categories:")
            for category in categories:
                print(f"- {category}")
        if loops:
            print("Loops:")
            for loop in loops:
                print(f"- {loop}")
        print("Sources:")
        for source in sources:
            print(f"- {source}")
        print()

    if found == 0:
        print("No generalized change suggestions met the threshold.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
