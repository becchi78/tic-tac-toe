#!/usr/bin/env bash
# Stop: タスクブランチ (feature/T-xxx-...) にいるのに報告ファイルが無ければ警告する。
set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(git -C "${HERE}" rev-parse --show-toplevel 2>/dev/null || echo /work/Agent-High-Low-Mix)"
cd "${REPO}"

BR="$(git branch --show-current 2>/dev/null || echo '')"
if [[ "${BR}" =~ ^feature/(T-[0-9]+) ]]; then
  TID="${BASH_REMATCH[1]}"
  if ! compgen -G "reports/${TID}-*.report.md" > /dev/null \
     && ! compgen -G "reports/${TID}-*.review.md" > /dev/null; then
    jq -n --arg r "報告ファイル reports/${TID}-*.report.md（またはレビューなら .review.md）が未作成です。reports/TEMPLATE.report.md の様式で作成してください。" '{reason:$r}'
    exit 0
  fi
fi
echo '{}'
