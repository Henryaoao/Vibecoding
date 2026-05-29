#!/usr/bin/env sh
set -eu

team_name="${OMX_TEAM_NAME:-}"
worker_name="${OMX_WORKER_NAME:-}"

if [ -z "$team_name" ] && [ -n "${OMX_TEAM_WORKER:-}" ]; then
  case "$OMX_TEAM_WORKER" in
    */*) team_name="${OMX_TEAM_WORKER%%/*}" ;;
  esac
fi

if [ -z "$worker_name" ] && [ -n "${OMX_TEAM_WORKER:-}" ]; then
  case "$OMX_TEAM_WORKER" in
    */*) worker_name="${OMX_TEAM_WORKER#*/}" ;;
  esac
fi

while [ "$#" -gt 0 ]; do
  case "$1" in
    --team-name)
      team_name="${2:-}"
      shift 2
      ;;
    --worker)
      worker_name="${2:-}"
      shift 2
      ;;
    --help|-h)
      cat <<'USAGE'
Usage: scripts/check-codex-omx-runtime.sh [--team-name NAME --worker WORKER]

Checks whether Codex CLI is available and whether OMX team runtime APIs are
usable from the current shell. When team name and worker are supplied, the
script performs a non-mutating mailbox-list probe against the live team API.
USAGE
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

codex_path="$(command -v codex 2>/dev/null || true)"
codex_version=""
if [ -n "$codex_path" ]; then
  codex_version="$(codex --version 2>/dev/null | head -n 1 || true)"
fi

omx_path="$(command -v omx 2>/dev/null || true)"
omx_version=""
if [ -n "$omx_path" ]; then
  omx_version="$(omx --version 2>/dev/null | head -n 1 || true)"
fi

team_api_ok=false
team_api_status="not_checked"
if [ -n "$omx_path" ]; then
  if [ -n "$team_name" ] && [ -n "$worker_name" ]; then
    if omx team api mailbox-list --input "{\"team_name\":\"$team_name\",\"worker\":\"$worker_name\"}" --json >/dev/null 2>&1; then
      team_api_ok=true
      team_api_status="ok"
    else
      team_api_status="failed"
    fi
  else
    team_api_status="missing_team_or_worker"
  fi
fi

codex_available=false
[ -n "$codex_path" ] && codex_available=true

omx_available=false
[ -n "$omx_path" ] && omx_available=true

team_api_checked=true
if [ "$team_api_status" = "not_checked" ] || [ "$team_api_status" = "missing_team_or_worker" ]; then
  team_api_checked=false
fi

tmux_path="$(command -v tmux 2>/dev/null || true)"
tmux_available=false
[ -n "$tmux_path" ] && tmux_available=true

tmux_in_session=false
[ -n "${TMUX:-}" ] && tmux_in_session=true

cat <<JSON
{
  "codex_cli": {
    "available": $codex_available,
    "path": "$codex_path",
    "version": "$codex_version"
  },
  "omx": {
    "available": $omx_available,
    "path": "$omx_path",
    "version": "$omx_version",
    "team_api": {
      "checked": $team_api_checked,
      "available": $team_api_ok,
      "status": "$team_api_status"
    }
  },
  "tmux": {
    "available": $tmux_available,
    "path": "$tmux_path",
    "in_session": $tmux_in_session
  }
}
JSON
