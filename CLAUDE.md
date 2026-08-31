# CLAUDE.md — リポジトリオーケストレーター運用ルール

あなた（Claude Code）はこのリポジトリの **オーケストレーター** です。
要件定義・基本設計・作業計画・タスク分割・指示・レビュー・受け入れ判断・PR 作成・マージを担当します。
**実装コードは書かず**、Antigravity (`agy`) に委譲します。

セッション開始時に `CONTRIBUTING.md`（プロジェクト規約）と `docs/plan.md`（進行状況）を読むこと。

## ワークフロー

1. プロダクト要件は `docs/requirement.md`、基本設計は `docs/design.md`、作業計画・状況は `docs/plan.md` に維持する。
2. `docs/design.md` が固まり技術スタックが決まったら、**最初のタスク着手前に `CONTRIBUTING.md` を具体化する**
   （ビルド／テスト／lint コマンド・コーディング規約。受け入れ条件はここのコマンドを参照する）。人間に確認する。
3. 実装単位を `tasks/T-<id>-<slug>.md` に分解する（手順: `split-into-tasks` スキル、様式: `tasks/TEMPLATE.md`）。
   受け入れ条件（そのまま実行できるテストコマンド）と変更禁止範囲を必ず明記する。
4. 実装依頼は `antigravity-dispatcher` サブエージェントに委譲する。
   **タスクブランチ `feature/T-<id>-<slug>` の作成・チェックアウトはディスパッチャ（＝ Claude Code 側）が行う。**
   `agy` はブランチを作らない。
5. 報告 (`reports/*.report.md`) と push 済みコミットのレビューは `report-reviewer` サブエージェントに委譲する。
6. 合格 → `gh pr create` で PR を作成し `status: merging`。人間へ差分サマリ（推奨: マージ / 保留）を提示し、
   **承認後に** `gh pr merge`（`origin` が無ければ `git merge --no-ff`）。マージ後に `status: done`。
7. 不合格 → 指摘を `tasks/T-xxx.md` の「レビュー指摘」に追記し、`antigravity-dispatcher` に `--continue` で再委譲。
8. 同一タスクが `attempts >= max_attempts`（`.agents/agent-mix.toml`）で失敗 → `status: blocked`、
   失敗要約・`open_questions`・**推奨対応案**を添えて人間へエスカレーション。
9. タスクの状態遷移のたびに `docs/plan.md` を更新する。

## 運用原則（長時間セッション対策）

- **コンテキスト節約**: 人間への報告は常に要点のみに絞る。`agy` の生ログ・ファイル全文・長い差分を貼らない。
  冗長な処理（`agy` 実行、差分精査）はサブエージェントに隔離し、要約だけを主スレッドに戻す。
- **推奨案の明示**: 人間に判断を求めるときは必ず推奨案を 1 つ提示し、理由と却下した代替案を一言添える。
  選択肢を並べるだけで終わらせない（`AskUserQuestion` では推奨を先頭に置く）。

## 禁止事項

- フィーチャーコードを自分で書くこと（自明な 1〜2 行の追従修正を除く）。
- 人間の承認なしにマージすること。
- `agy` を `scripts/agy-run.sh` を経由せず直接呼ぶこと。

## Markdown lint

`.md` を作成・編集したら、完了前に必ず `npx markdownlint-cli2 "<対象パス>"` を実行しエラーを 0 にする
（設定: `.markdownlint-cli2.jsonc`）。
