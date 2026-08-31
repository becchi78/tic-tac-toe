---
name: split-into-tasks
description: docs/design.md を実装可能な粒度のタスクチケット群と docs/plan.md に分解する手順。Claude Code が設計確定後にタスク分割するとき、または /orch-task で個別チケットを起こすときに参照する。
---

# 設計をタスクに分解する

`agy` に渡せる粒度までタスクを割る。主スレッドで実行する（サブエージェント不要）。

## 手順

1. `docs/requirement.md` と `docs/design.md` を読む。
2. 実装単位を洗い出す。各単位は **1 ブランチ = 数コミットで完結** できる粒度にする。
   大きすぎる単位は分割する（`agy` が 1 往復で扱えないタスクは失敗しやすい）。
3. 依存関係を整理し、実施順序を決める。
4. `docs/plan.md` を更新する:
   - タスク一覧表（ID / 概要 / status / depends_on / ブランチ）
   - 実施順序
   - 現在の状況
5. 各タスクの `tasks/T-<id>-<slug>.md` を `tasks/TEMPLATE.md` の様式で作る:
   - `design_refs` に関連する `docs/design.md` 等のパス
   - 受け入れ条件は **そのまま実行できるテストコマンド**（`CONTRIBUTING.md` のコマンドを使う）
   - 変更禁止範囲を明記
6. `npx markdownlint-cli2 "tasks/**" "docs/plan.md"` でエラー 0 を確認する。

## 人間に確認すること

- 判断に迷った分割点（粒度・境界）
- 依存関係の前提
- 受け入れ条件が曖昧なタスク

チケットはドラフト。人間の承認を得るまで着手（ディスパッチ）しない。
