from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path


def load_entries(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    entries = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        entries.append(json.loads(line))
    return entries


def main() -> int:
    parser = argparse.ArgumentParser(description="Review the current self-evolution backlog.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--top", type=int, default=5)
    args = parser.parse_args()

    entries = load_entries(Path(args.skill_dir) / "references" / "evolution-log.jsonl")
    if not entries:
        print("No evolution entries recorded yet.")
        return 0

    by_status = Counter(entry.get("status", "unknown") for entry in entries)
    by_domain = Counter(entry.get("domain_key", "") or "unspecified" for entry in entries)
    by_standard_family = Counter(entry.get("standard_family", "") or "unspecified" for entry in entries)
    by_target_type = Counter(entry.get("target_type", "") or "unspecified" for entry in entries)
    by_task_class = Counter(entry.get("task_class", "") or "unspecified" for entry in entries)
    by_loop = Counter(entry.get("loop", "") or "unspecified" for entry in entries)
    by_meta_focus = Counter(entry.get("meta_focus", "") or "none" for entry in entries)
    by_category = Counter(entry.get("category", "") or "uncategorized" for entry in entries)
    principle_counts = Counter()
    principle_sources: dict[str, set[str]] = defaultdict(set)
    principle_targets: dict[str, set[str]] = defaultdict(set)
    principle_loops: dict[str, set[str]] = defaultdict(set)
    principle_domains: dict[str, set[str]] = defaultdict(set)

    for entry in entries:
        domain_prefix = entry.get("domain_key", "") or "unspecified"
        principle_key = entry.get("principle_key") or entry.get("pattern_key") or entry.get("summary", "")
        if not principle_key:
            continue
        composite_key = f"{domain_prefix}::{principle_key}"
        principle_counts[composite_key] += 1
        principle_sources[composite_key].add(entry.get("source_task", ""))
        principle_targets[composite_key].add(entry.get("target_type", ""))
        principle_loops[composite_key].add(entry.get("loop", ""))
        principle_domains[composite_key].add(domain_prefix)

    print("Status counts:")
    for key, value in by_status.most_common():
        print(f"- {key}: {value}")
    print()

    print("Domain counts:")
    for key, value in by_domain.most_common():
        print(f"- {key}: {value}")
    print()

    print("Standard family counts:")
    for key, value in by_standard_family.most_common():
        print(f"- {key}: {value}")
    print()

    print("Target type counts:")
    for key, value in by_target_type.most_common():
        print(f"- {key}: {value}")
    print()

    print("Task class counts:")
    for key, value in by_task_class.most_common():
        print(f"- {key}: {value}")
    print()

    print("Loop counts:")
    for key, value in by_loop.most_common():
        print(f"- {key}: {value}")
    print()

    print("Meta focus counts:")
    for key, value in by_meta_focus.most_common():
        print(f"- {key}: {value}")
    print()

    print("Category counts:")
    for key, value in by_category.most_common():
        print(f"- {key}: {value}")
    print()

    print(f"Top principles (top {args.top}):")
    for principle_key, count in principle_counts.most_common(args.top):
        print(f"- {principle_key}")
        print(f"  occurrences: {count}")
        print(f"  unique sources: {len([s for s in principle_sources[principle_key] if s])}")
        print(f"  target diversity: {len([t for t in principle_targets[principle_key] if t])}")
        print(f"  loop diversity: {len([l for l in principle_loops[principle_key] if l])}")
        print(f"  domain diversity: {len([d for d in principle_domains[principle_key] if d])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
