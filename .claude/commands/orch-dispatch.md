---
description: タスクを Antigravity に実装依頼する（antigravity-dispatcher サブエージェントを起動）
argument-hint: <task-id> [--continue]
---

# /orch-dispatch

`antigravity-dispatcher` サブエージェントを起動し、タスク `$1` の実装を Antigravity に依頼してください。

- `--continue` が指定された場合は再ディスパッチ（会話継続）として扱い、
  直近の `report-reviewer` の指摘をサブエージェントに渡してください。
- サブエージェントからの要約のみを受け取り、生ログは表示しないでください。
- 結果に応じて `tasks/$1-*.md` の `status` と `docs/plan.md` を更新してください。
- 次アクション（レビューへ / 再ディスパッチ / blocked）を推奨として提示してください。
