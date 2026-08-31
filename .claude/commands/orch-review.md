---
description: agy の実装報告とコミットをレビューする（report-reviewer サブエージェントを起動）
argument-hint: <task-id>
---

# /orch-review

`report-reviewer` サブエージェントを起動し、タスク `$1` の実装をレビューしてください。

サブエージェントの判定を受けて:

- **pass** → `gh pr create` で PR を作成（`origin` が無ければブランチのまま）、`tasks/$1-*.md` を
  `status: merging` に更新し、人間へ差分サマリと推奨（マージ / 保留）を提示する。
- **fail** → 指摘を `tasks/$1-*.md` の「## レビュー指摘」に追記し、`status: in-progress` のまま、
  `/orch-dispatch $1 --continue` を推奨として提示する。

`docs/plan.md` を更新してください。生ログは表示しないでください。
