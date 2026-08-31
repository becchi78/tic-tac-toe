#!/usr/bin/env bash
#
# agy-run.sh — High-Low Mix の唯一の Antigravity 呼び出しエントリポイント
#
#   agy-run.sh implement <task-id> [--continue]   # 実装ロールで agy を起動
#   agy-run.sh review    <task-id> [--continue]   # レビュー(セルフ二役)ロールで起動
#
# 役割:
#   - .agents/agent-mix.toml からモデル（reasoning レベル込み）/ print_timeout を解決（環境変数で上書き可）
#   - `agy models` で解決済みモデルの存在を検証
#   - 定型フラグ（--output-format json / --add-dir <repo> / --dangerously-skip-permissions /
#     </dev/null / cwd=<repo>）を固定
#   - タスクチケットと design_refs からプロンプトを組み立て
#   - conversation_id を .agents/state/conversations.json に永続化
#   - agy 完了後、origin があればタスクブランチを push（push は agy ではなく本スクリプトの責務）
#   - 機械可読サマリを stdout(JSON)、進捗を stderr に出力
#
# ブランチは呼び出し側(antigravity-dispatcher)が用意する。本スクリプトは
# HEAD が feature/<task-id>-* でなければ実行を拒否する。
set -euo pipefail

# ---- 0. 位置決め -------------------------------------------------------------
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${REPO_ROOT}" ]]; then
  echo "agy-run: git リポジトリ内で実行してください" >&2
  exit 2
fi
cd "${REPO_ROOT}"

CONFIG="${REPO_ROOT}/.agents/agent-mix.toml"
STATE="${REPO_ROOT}/.agents/state/conversations.json"
mkdir -p "$(dirname "${STATE}")"
[[ -f "${STATE}" ]] || echo '{}' > "${STATE}"

die() { echo "agy-run: $*" >&2; exit 1; }

# ---- 1. 引数 ---------------------------------------------------------------
SUBCMD="${1:-}"; TASK_ID="${2:-}"; CONTINUE=0
shift $(( $# > 2 ? 2 : $# )) || true
for a in "$@"; do
  case "$a" in
    --continue) CONTINUE=1 ;;
    *) die "未知の引数: $a" ;;
  esac
done

case "${SUBCMD}" in
  implement) ROLE=implementer; ROLE_JA="実装エージェント"; REPORT_EXT="report" ;;
  review)    ROLE=reviewer;    ROLE_JA="レビューエージェント"; REPORT_EXT="review" ;;
  *) die "usage: agy-run.sh {implement|review} <task-id> [--continue]" ;;
esac
[[ -n "${TASK_ID}" ]] || die "task-id を指定してください"

# ---- 2. 従量課金ガード ----------------------------------------------------
for v in GEMINI_API_KEY GOOGLE_API_KEY GOOGLE_GENAI_API_KEY; do
  if [[ -n "${!v:-}" ]]; then
    echo "agy-run: 警告: ${v} が設定されています。従量課金 API 経路に切り替わる恐れがあります。" >&2
  fi
done

# ---- 3. 設定解決（env > TOML） ------------------------------------------
# 簡易 TOML リーダ: 指定セクションのキーの値（クォート除去）を返す
toml_get() { # $1=section $2=key
  awk -v sec="$1" -v key="$2" '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*\[/ {
      s = $0; gsub(/[][[:space:]]/, "", s); cur = s; next
    }
    {
      line = $0; sub(/#.*/, "", line)
      n = index(line, "=")
      if (n == 0) next
      k = substr(line, 1, n-1); gsub(/[[:space:]]/, "", k)
      v = substr(line, n+1);   gsub(/^[[:space:]]+|[[:space:]]+$/, "", v)
      gsub(/^"|"$/, "", v)
      if (cur == sec && k == key) { print v; exit }
    }
  ' "${CONFIG}"
}

ENV_PREFIX="AGENTMIX_$(echo "${ROLE}" | tr '[:lower:]' '[:upper:]')"
resolve() { # $1=env-suffix $2=toml-key
  local envvar="${ENV_PREFIX}_$1" val
  val="${!envvar:-}"
  [[ -n "${val}" ]] || val="$(toml_get "antigravity.${ROLE}" "$2")"
  echo "${val}"
}

[[ -f "${CONFIG}" ]] || die "設定が見つかりません: ${CONFIG}"
# reasoning レベルはモデル slug の末尾（-high / -medium / -low）に内包される。
# --effort は付けない（slug と食い違うと agy がエラーにする）。
MODEL="$(resolve MODEL model)"
TIMEOUT="$(resolve PRINT_TIMEOUT print_timeout)"
DEFAULT_BRANCH="$(toml_get defaults default_branch)"; DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"

[[ -n "${MODEL}"   ]] || die "model 未解決（env ${ENV_PREFIX}_MODEL か ${CONFIG} を確認）"
[[ -n "${TIMEOUT}" ]] || die "print_timeout 未解決"

# ---- 4. モデル存在検証 --------------------------------------------------
MODELS_LIST="$(timeout 30 agy models </dev/null 2>/dev/null || true)"
if [[ -z "${MODELS_LIST}" ]]; then
  echo "agy-run: 警告: 'agy models' が応答しませんでした。存在検証をスキップします。" >&2
else
  VALID_SLUGS="$(printf '%s\n' "${MODELS_LIST}" | awk -F'\t' '{print $1}')"
  case $'\n'"${VALID_SLUGS}"$'\n' in
    *$'\n'"${MODEL}"$'\n'*) : ;;
    *) echo "agy-run: モデル '${MODEL}' は agy models に存在しません。利用可能なモデル:" >&2
       printf '%s\n' "${MODELS_LIST}" >&2
       exit 1 ;;
  esac
fi

# ---- 5. タスクチケット / design_refs ---------------------------------
TASK_FILE="$(ls "tasks/${TASK_ID}"*.md 2>/dev/null | head -n1 || true)"
[[ -n "${TASK_FILE}" ]] || die "タスクチケットが見つかりません: tasks/${TASK_ID}*.md"
REPORT_FILE="reports/$(basename "${TASK_FILE}" .md).${REPORT_EXT}.md"

DESIGN_REFS="$(awk '
  /^design_refs:/ { grab=1; next }
  grab && /^[[:space:]]*-[[:space:]]*/ { sub(/^[[:space:]]*-[[:space:]]*/, ""); print; next }
  grab && /^[^[:space:]-]/ { grab=0 }
' "${TASK_FILE}")"

# ---- 5b. ブランチガード（ブランチ作成は呼び出し側の責務） ------------
CUR_BRANCH="$(git branch --show-current 2>/dev/null || echo '')"
case "${CUR_BRANCH}" in
  feature/${TASK_ID}-*|feature/${TASK_ID}) : ;;
  *) die "現在のブランチ '${CUR_BRANCH:-（detached）}' はタスク ${TASK_ID} 用ではありません。
       antigravity-dispatcher が feature/${TASK_ID}-<slug> を作成・チェックアウトしてから実行してください。" ;;
esac

# ---- 6. conversation_id -----------------------------------------------
CONV_ID="$(jq -r --arg t "${TASK_ID}" --arg r "${SUBCMD}" '.[$t][$r] // empty' "${STATE}")"
CONV_ARGS=()
if [[ "${CONTINUE}" -eq 1 ]]; then
  [[ -n "${CONV_ID}" ]] || die "--continue 指定ですが ${TASK_ID}/${SUBCMD} の会話 ID が state にありません"
  CONV_ARGS=(--conversation "${CONV_ID}")
fi

# ---- 7. プロンプト組み立て -------------------------------------------
PROMPT_FILE="$(mktemp)"
RAW_FILE="$(mktemp)"
trap 'rm -f "${PROMPT_FILE}" "${RAW_FILE}" "${RAW_FILE}.err" "${RAW_FILE}.push"' EXIT
{
  echo "あなたは${ROLE_JA}です。AGENTS.md のルールに従ってください。"
  echo
  echo "# タスク"
  cat "${TASK_FILE}"
  echo
  echo "# 参照すべき設計書"
  if [[ -n "${DESIGN_REFS}" ]]; then echo "${DESIGN_REFS}"; else echo "(チケットに design_refs の記載なし)"; fi
  echo
  echo "# 完了条件"
  if [[ "${ROLE}" == "implementer" ]]; then
    cat <<EOF
- 受け入れ条件のテストコマンドがすべて成功すること
- Markdown を作成・編集した場合は \`npx markdownlint-cli2\` がエラー 0 であること
- ${REPORT_FILE} を reports/TEMPLATE.report.md の様式で作成すること
- 変更禁止範囲を変更しないこと
- 実装ファイルと ${REPORT_FILE} の**両方**を現在のタスクブランチ（${CUR_BRANCH}）にコミットし、
  作業ツリーをクリーンにすること（メッセージに ${TASK_ID} を含める）。push は不要（ラッパーが行う）
- ブランチ操作（switch / checkout -b / branch）・push・PR 作成・マージ・デフォルトブランチへの直コミットはしないこと
EOF
  else
    cat <<EOF
- 実装会話とは独立の視点で、受け入れ条件・変更禁止範囲・設計書との整合をレビューすること
- ${REPORT_FILE} を reports/TEMPLATE.review.md の様式で出力すること
- コード変更・コミット・ブランチ操作はしないこと
EOF
  fi
} > "${PROMPT_FILE}"

# ---- 8. agy 実行 -----------------------------------------------------
echo "agy-run: role=${ROLE} model=${MODEL} timeout=${TIMEOUT} task=${TASK_ID} continue=${CONTINUE}" >&2
set +e
agy -p "$(cat "${PROMPT_FILE}")" \
  --model "${MODEL}" \
  --output-format json \
  --add-dir "${REPO_ROOT}" \
  --dangerously-skip-permissions \
  --print-timeout "${TIMEOUT}" \
  "${CONV_ARGS[@]}" \
  </dev/null >"${RAW_FILE}" 2>"${RAW_FILE}.err"
AGY_EXIT=$?
set -e

RAW="$(cat "${RAW_FILE}")"
ERR="$(cat "${RAW_FILE}.err" 2>/dev/null || true)"

# ---- 9. 結果パース -------------------------------------------------
# agy 1.1.22 の JSON: {conversation_id, status, response, duration_seconds, num_turns, usage}
NEW_CONV=""; RESULT_TEXT=""; AGY_STATUS=""
if echo "${RAW}" | jq -e . >/dev/null 2>&1; then
  NEW_CONV="$(echo "${RAW}" | jq -r '(.conversation_id // .conversationId // .session_id // empty)')"
  RESULT_TEXT="$(echo "${RAW}" | jq -r '(.response // .result // .text // .output // .message // empty)')"
  AGY_STATUS="$(echo "${RAW}" | jq -r '(.status // empty)')"
else
  RESULT_TEXT="${RAW}"
fi
[[ -n "${NEW_CONV}" ]] || NEW_CONV="${CONV_ID}"

# conversation_id を保存
if [[ -n "${NEW_CONV}" ]]; then
  tmp="$(mktemp)"
  jq --arg t "${TASK_ID}" --arg r "${SUBCMD}" --arg c "${NEW_CONV}" \
     '.[$t] = ((.[$t] // {}) + {($r): $c})' "${STATE}" > "${tmp}" && mv "${tmp}" "${STATE}"
fi

# ---- 10. サマリ出力 ----------------------------------------------
NEW_COMMITS="$(git log --oneline "${DEFAULT_BRANCH}..HEAD" 2>/dev/null | head -n 20 || true)"
REPORT_EXISTS=false; [[ -f "${REPORT_FILE}" ]] && REPORT_EXISTS=true
# 空なら全変更コミット済み。ラッパー自身が書き換える state ファイルは除外。
DIRTY="$(git status --porcelain 2>/dev/null | grep -v ' \.agents/state/conversations\.json$' || true)"
REPORT_COMMITTED=false
COMMITTED_FILES="$(git log "${DEFAULT_BRANCH}..HEAD" --name-only --pretty=format: 2>/dev/null || true)"
case $'\n'"${COMMITTED_FILES}"$'\n' in
  *$'\n'"${REPORT_FILE}"$'\n'*) REPORT_COMMITTED=true ;;
esac

# ---- 11. push（origin があれば。agy ではなくラッパーの責務） ----------
PUSH_STATUS="skipped-no-origin"
if [[ -n "${NEW_COMMITS}" ]] && git remote get-url origin >/dev/null 2>&1; then
  if git push -u origin "${CUR_BRANCH}" >/dev/null 2>"${RAW_FILE}.push"; then
    PUSH_STATUS="pushed"
  else
    PUSH_STATUS="push-failed: $(cat "${RAW_FILE}.push" 2>/dev/null | tr '\n' ' ')"
  fi
  rm -f "${RAW_FILE}.push"
elif [[ -z "${NEW_COMMITS}" ]]; then
  PUSH_STATUS="skipped-no-commits"
fi

jq -n \
  --arg role "${ROLE}" \
  --arg task "${TASK_ID}" \
  --argjson exit "${AGY_EXIT}" \
  --arg status "${AGY_STATUS}" \
  --arg model "${MODEL}" \
  --arg conv "${NEW_CONV}" \
  --arg report "${REPORT_FILE}" \
  --argjson report_exists "${REPORT_EXISTS}" \
  --argjson report_committed "${REPORT_COMMITTED}" \
  --arg branch "${CUR_BRANCH}" \
  --arg commits "${NEW_COMMITS}" \
  --arg dirty "${DIRTY}" \
  --arg push "${PUSH_STATUS}" \
  --arg result "${RESULT_TEXT}" \
  --arg stderr "${ERR}" \
  '{role:$role, task:$task, agy_exit:$exit, agy_status:$status, model:$model, conversation_id:$conv,
    report_file:$report, report_exists:$report_exists, report_committed:$report_committed,
    branch:$branch, new_commits:$commits, uncommitted_changes:$dirty, push:$push,
    result:$result, stderr:$stderr}'

exit "${AGY_EXIT}"
