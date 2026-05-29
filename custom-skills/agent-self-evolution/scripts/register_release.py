from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path


def update_current(text: str, version: str, released_on: str, summary: str) -> str:
    marker = "## Current Version"
    releases_marker = "## Releases"
    start = text.index(marker)
    end = text.index(releases_marker)
    block = (
        "## Current Version\n\n"
        f"- Version: {version}\n"
        f"- Date: {released_on}\n"
        f"- Summary: {summary}\n\n"
    )
    return text[:start] + block + text[end:]


def main() -> int:
    parser = argparse.ArgumentParser(description="Register an accepted release for the self-evolution skill.")
    parser.add_argument("--skill-dir", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--version", required=True)
    parser.add_argument("--summary", required=True)
    parser.add_argument("--release-date", default=date.today().isoformat())
    parser.add_argument("--notes", action="append", default=[])
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    skill_dir = Path(args.skill_dir)
    state_path = skill_dir / "references" / "version-state.json"
    log_path = skill_dir / "references" / "release-log.md"
    state = {"version": args.version, "released_on": args.release_date, "summary": args.summary}
    block = (
        f"\n### {args.version} - {args.release_date}\n\n"
        f"- {args.summary}\n"
        + ("\n".join(f"- {note}" for note in args.notes) + "\n" if args.notes else "")
    )

    if args.dry_run:
        print(json.dumps(state, ensure_ascii=False, indent=2))
        print()
        print(block.strip())
        return 0

    current = log_path.read_text(encoding="utf-8")
    log_path.write_text(update_current(current, args.version, args.release_date, args.summary) + block, encoding="utf-8")
    state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Registered release {args.version}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
