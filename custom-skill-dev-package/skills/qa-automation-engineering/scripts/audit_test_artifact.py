#!/usr/bin/env python3
"""Structural audit for QA test artifacts.

This script is intentionally conservative: it catches missing fields and weak
oracles, then leaves final judgment to the agent using the skill.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path
from typing import Any


FIELD_SYNONYMS = {
    "case_id": ["case_id", "id", "case id", "用例编号", "编号"],
    "source_trace": ["source_trace", "requirement", "requirement id", "trace", "traceability", "需求", "需求编号"],
    "title": ["title", "case title", "scenario", "name", "用例标题", "场景", "标题"],
    "priority": ["priority", "risk", "severity", "level", "优先级", "风险", "级别"],
    "preconditions": ["precondition", "preconditions", "setup", "given", "前置条件", "预置条件"],
    "test_data": ["test data", "data", "fixture", "dataset", "测试数据", "数据"],
    "steps": ["steps", "actions", "action", "when", "procedure", "操作步骤", "步骤"],
    "expected_result": ["expected", "expected result", "oracle", "then", "assertion", "预期结果", "预期"],
    "oracle_type": ["oracle type", "oracle_type", "assertion type", "evidence type", "验证类型", "断言类型", "预期类型"],
    "cleanup": ["cleanup", "teardown", "reset", "清理", "恢复"],
    "automation_status": ["automation", "automated", "automation status", "自动化", "自动化状态"],
    "environment": ["environment", "browser", "device", "env", "测试环境", "环境"],
}

WEAK_ORACLE_PATTERNS = [
    r"^(pass|passed|success|successful|ok|normal|works|correct)$",
    r"^(no error|no exception|as expected)$",
    r"^(通过|成功|正常|无异常|无报错|显示正常|操作成功)$",
]

GENERIC_STEP_PATTERNS = [
    r"^(test|verify|check|execute|run)$",
    r"^(测试|验证|检查|执行)$",
]


def normalize_header(value: Any) -> str:
    value = str(value or "").replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", value.strip().lower())


def cell_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip())


def map_headers(headers: list[str]) -> dict[str, str]:
    normalized = {normalize_header(h): h for h in headers}
    result: dict[str, str] = {}
    for field, names in FIELD_SYNONYMS.items():
        for name in names:
            key = normalize_header(name)
            if key in normalized:
                result[field] = normalized[key]
                break
    return result


def read_delimited(path: Path, dialect: str) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f, delimiter="\t" if dialect == "tsv" else ",")
        return [{k or "": cell_text(v) for k, v in row.items()} for row in reader]


def read_xlsx(path: Path) -> list[dict[str, str]]:
    try:
        import openpyxl  # type: ignore
    except Exception as exc:  # pragma: no cover - depends on runtime
        raise RuntimeError("openpyxl is required for .xlsx input") from exc

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    rows: list[dict[str, str]] = []
    for ws in wb.worksheets:
        iterator = ws.iter_rows(values_only=True)
        try:
            headers = [cell_text(v) for v in next(iterator)]
        except StopIteration:
            continue
        if not any(headers):
            continue
        for values in iterator:
            row = {headers[i] if i < len(headers) and headers[i] else f"col_{i+1}": cell_text(v) for i, v in enumerate(values)}
            if any(row.values()):
                row["_sheet"] = ws.title
                rows.append(row)
    return rows


def read_text_artifact(path: Path) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8-sig", errors="replace")
    rows: list[dict[str, str]] = []

    # Markdown tables.
    table_lines = [line for line in text.splitlines() if "|" in line]
    for i in range(len(table_lines) - 1):
        headers = [cell_text(x) for x in table_lines[i].strip("|").split("|")]
        sep = table_lines[i + 1]
        if headers and re.search(r"\|\s*:?-{3,}:?\s*(\||$)", sep):
            for line in table_lines[i + 2 :]:
                if "|" not in line:
                    break
                values = [cell_text(x) for x in line.strip("|").split("|")]
                if len(values) >= 2:
                    rows.append({headers[j] if j < len(headers) else f"col_{j+1}": values[j] for j in range(len(values))})
            if rows:
                return rows

    # Fallback: audit the whole document as one artifact.
    return [{"document": text}]


def load_rows(path: Path) -> list[dict[str, str]]:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        return read_delimited(path, "csv")
    if suffix == ".tsv":
        return read_delimited(path, "tsv")
    if suffix == ".xlsx":
        return read_xlsx(path)
    if suffix in {".md", ".txt"}:
        return read_text_artifact(path)
    raise ValueError(f"Unsupported file type: {suffix}")


def is_weak(value: str, patterns: list[str]) -> bool:
    v = value.strip().lower()
    if not v:
        return True
    return any(re.match(pattern, v, flags=re.IGNORECASE) for pattern in patterns)


def audit_rows(rows: list[dict[str, str]], max_rows: int | None = None) -> dict[str, Any]:
    sample = rows[: max_rows or len(rows)]
    all_headers = sorted({h for row in sample for h in row.keys() if not h.startswith("_")})
    header_map = map_headers(all_headers)
    issues: list[dict[str, Any]] = []

    required = ["case_id", "source_trace", "title", "preconditions", "test_data", "steps", "expected_result", "oracle_type"]
    recommended = ["priority", "cleanup", "automation_status", "environment"]

    for field in required:
        if field not in header_map and not (len(sample) == 1 and "document" in sample[0]):
            issues.append({"severity": "high", "scope": "artifact", "field": field, "message": f"Missing required field: {field}"})
    for field in recommended:
        if field not in header_map and not (len(sample) == 1 and "document" in sample[0]):
            issues.append({"severity": "medium", "scope": "artifact", "field": field, "message": f"Missing recommended field: {field}"})

    for idx, row in enumerate(sample, start=1):
        row_id = row.get(header_map.get("case_id", ""), "") or row.get("_sheet", "") or idx
        if "document" in row:
            doc = row["document"]
            for token in ["expected", "预期", "步骤", "trace", "需求", "precondition", "前置"]:
                if token.lower() not in doc.lower():
                    issues.append({"severity": "medium", "row": row_id, "message": f"Document does not visibly include {token!r}"})
            continue

        for field in required:
            header = header_map.get(field)
            if header and not row.get(header, "").strip():
                issues.append({"severity": "high", "row": row_id, "field": field, "message": f"Empty required field: {field}"})

        expected = row.get(header_map.get("expected_result", ""), "")
        if expected and is_weak(expected, WEAK_ORACLE_PATTERNS):
            issues.append({"severity": "high", "row": row_id, "field": "expected_result", "message": "Expected result is too generic to be a deterministic oracle"})

        steps = row.get(header_map.get("steps", ""), "")
        if steps and (is_weak(steps, GENERIC_STEP_PATTERNS) or len(steps) < 12):
            issues.append({"severity": "medium", "row": row_id, "field": "steps", "message": "Steps appear too short or generic for independent execution"})

        trace = row.get(header_map.get("source_trace", ""), "")
        if trace and not re.search(r"[A-Za-z]{2,}-?\d+|\d{2,}|PRD|REQ|AC|EV|BUG|需求", trace, flags=re.IGNORECASE):
            issues.append({"severity": "medium", "row": row_id, "field": "source_trace", "message": "Traceability value does not look like a stable source ID"})

    high = sum(1 for i in issues if i["severity"] == "high")
    medium = sum(1 for i in issues if i["severity"] == "medium")
    verdict = "fail" if high else "pass_with_warnings" if medium else "pass"
    return {
        "verdict": verdict,
        "review_scope": "structural_preflight_only",
        "manual_review_required": True,
        "rows_loaded": len(rows),
        "rows_audited": len(sample),
        "headers_detected": all_headers,
        "field_map": header_map,
        "issue_counts": {"high": high, "medium": medium, "total": len(issues)},
        "notes": [
            "Findings are verified only for visible artifact structure and text heuristics.",
            "Final execution-readiness or behavioral verdict still requires manual route-specific review.",
        ],
        "issues": issues,
    }


def print_text(result: dict[str, Any]) -> None:
    print(f"Verdict: {result['verdict']}")
    print(f"Scope: {result['review_scope']}")
    print(f"Rows audited: {result['rows_audited']} / {result['rows_loaded']}")
    print(f"Issues: {result['issue_counts']}")
    print("Field map:")
    for field, header in result["field_map"].items():
        print(f"  {field}: {header}")
    if result.get("notes"):
        print("Notes:")
        for note in result["notes"]:
            print(f"  - {note}")
    if result["issues"]:
        print("Findings:")
        for issue in result["issues"][:200]:
            row = f" row={issue['row']}" if "row" in issue else ""
            field = f" field={issue['field']}" if "field" in issue else ""
            print(f"  [{issue['severity']}]{row}{field} {issue['message']}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit QA test artifacts for structural execution readiness.")
    parser.add_argument("path", type=Path, help="Path to .md, .txt, .csv, .tsv, or .xlsx test artifact")
    parser.add_argument("--format", choices=["text", "json"], default="text")
    parser.add_argument("--max-rows", type=int, default=None)
    args = parser.parse_args()

    try:
        rows = load_rows(args.path)
        result = audit_rows(rows, args.max_rows)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_text(result)
    return 1 if result["verdict"] == "fail" else 0


if __name__ == "__main__":
    raise SystemExit(main())
