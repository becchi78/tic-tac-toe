#!/usr/bin/env bash
# PostToolUse: 書き込み対象に .md が含まれていたら markdownlint-cli2 を走らせ、
# エラーがあれば理由を返す（best-effort）。
set -u

INPUT="$(cat)"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(git -C "${HERE}" rev-parse --show-toplevel 2>/dev/null || echo /work/Agent-High-Low-Mix)"

mapfile -t FILES < <(printf '%s' "${INPUT}" | jq -r '.toolCall.args | .. | strings' 2>/dev/null \
  | grep -E '\.md$' | sort -u || true)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo '{}'
  exit 0
fi

cd "${REPO}"
OUT="$(npx --yes markdownlint-cli2 "${FILES[@]}" 2>&1 || true)"
if printf '%s' "${OUT}" | grep -qE ' (error|MD[0-9]{3})'; then
  jq -n --arg r "markdownlint エラーがあります。修正してから完了してください:
${OUT}" '{reason:$r}'
else
  echo '{}'
fi
