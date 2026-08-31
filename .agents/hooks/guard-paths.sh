#!/usr/bin/env bash
# PreToolUse ガード: リポジトリ外書き込み・破壊的コマンド・履歴改変・push・PR/マージ・
# ブランチ操作・デフォルトブランチ直コミットを deny する。
# 入力: stdin JSON (.toolCall.name, .toolCall.args, ...)  出力: stdout JSON
set -u

INPUT="$(cat)"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(git -C "${HERE}" rev-parse --show-toplevel 2>/dev/null || echo /work/Agent-High-Low-Mix)"

deny()  { jq -n --arg r "$1" '{decision:"deny",  reason:$r}'; exit 0; }
allow() { printf '{"decision":"allow"}\n'; exit 0; }

TOOL="$(printf '%s' "${INPUT}" | jq -r '.toolCall.name // empty')"

case "${TOOL}" in
  run_command)
    CMD="$(printf '%s' "${INPUT}" | jq -r '(.toolCall.args.CommandLine // .toolCall.args.command // .toolCall.args.cmd // "")')"
    printf '%s' "${CMD}" | grep -Eq 'rm[[:space:]]+-[a-z]*r[a-z]*f?[[:space:]]+(/|~|\$HOME)([[:space:]]|$)' \
      && deny "破壊的な削除コマンドを検出: ${CMD}"
    printf '%s' "${CMD}" | grep -Eq 'git[[:space:]]+push([[:space:]]|$)' \
      && deny "push は agy の担当外。origin への反映は agy-run.sh が行う（AGENTS.md）: ${CMD}"
    printf '%s' "${CMD}" | grep -Eq 'git[[:space:]]+commit[[:space:]].*--amend|git[[:space:]]+rebase([[:space:]]|$)' \
      && deny "履歴改変（amend/rebase）は禁止: ${CMD}"
    printf '%s' "${CMD}" | grep -Eq 'gh[[:space:]]+pr[[:space:]]+(create|merge)|git[[:space:]]+merge([[:space:]]|$)' \
      && deny "PR 作成・マージは Claude Code の担当: ${CMD}"
    printf '%s' "${CMD}" | grep -Eq 'git[[:space:]]+switch([[:space:]]|$)|git[[:space:]]+checkout[[:space:]]+-[bB]|git[[:space:]]+branch[[:space:]]+(-[dDmMcC]|[^-])|git[[:space:]]+worktree[[:space:]]+add' \
      && deny "ブランチ操作は Claude Code の担当。用意されたタスクブランチで作業してください: ${CMD}"
    if printf '%s' "${CMD}" | grep -Eq 'git[[:space:]]+commit([[:space:]]|$)'; then
      BR="$(git -C "${REPO}" branch --show-current 2>/dev/null || echo '')"
      DEF="$(awk -F'"' '/default_branch/{print $2}' "${REPO}/.agents/agent-mix.toml" 2>/dev/null || echo main)"
      [[ -n "${BR}" && "${BR}" == "${DEF}" ]] && deny "デフォルトブランチ（${DEF}）への直コミットは禁止。タスクブランチで作業してください。"
    fi
    allow
    ;;
  write_file|edit_file|create_file)
    while IFS= read -r p; do
      [[ -z "${p}" ]] && continue
      case "${p}" in
        "${REPO}"|"${REPO}"/*) : ;;
        /*) deny "リポジトリ外への書き込みを検出: ${p}" ;;
      esac
    done < <(printf '%s' "${INPUT}" | jq -r '.toolCall.args | .. | strings' 2>/dev/null | grep -E '^/' || true)
    allow
    ;;
  *)
    allow
    ;;
esac
