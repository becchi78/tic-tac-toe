---
description: 説明からタスクチケット tasks/T-<次番号>-<slug>.md の草案を作成する
argument-hint: <タスクの簡単な説明>
---

# /orch-task

次の説明から新しいタスクチケットを作成してください: $ARGUMENTS

手順:

1. `tasks/` の既存 `T-NNN-*.md` を見て次の連番を決める（無ければ `001`）。
2. `tasks/TEMPLATE.md` の様式で `tasks/T-<番号>-<slug>.md` を作成する。
3. `design_refs` には関連する `docs/design.md` 等を入れる。
4. **受け入れ条件は具体的なテストコマンドで書く**。曖昧なら人間に質問する（推奨案を添えて）。
5. `status: todo`、`assignee: antigravity`。
6. `npx markdownlint-cli2 "tasks/T-<番号>-*.md"` でエラー 0 を確認する。
7. `docs/plan.md` があればタスク一覧に追記する。

作成後、チケットの要点（受け入れ条件・変更禁止範囲）を要約して提示してください。
