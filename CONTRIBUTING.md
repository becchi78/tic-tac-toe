<!--
技術スタックが決まったら「未定」を実値へ埋める（手順は CLAUDE.md ワークフロー §2）。
以後もスタック変更のたびに更新する。未確定の項目は「未定」と明記しておく。
-->

# CONTRIBUTING

このリポジトリで作業する **すべての担い手（人間 / Claude Code / Antigravity `agy`）** が従う
プロジェクト固有の規約。運用フロー（誰が何をするか）は `CLAUDE.md` と `AGENTS.md`、
タスク／報告の様式は `tasks/TEMPLATE.md` / `reports/TEMPLATE.report.md` を参照。

## 技術スタック

- 言語 / ランタイム: 未定
- パッケージマネージャ: 未定
- フレームワーク / 主要ライブラリ: 未定

## ビルド・テスト・lint コマンド

| 目的 | コマンド |
|---|---|
| 依存インストール | 未定 |
| ビルド | 未定 |
| テスト | 未定 |
| Lint / 整形 | 未定（Markdown は `npx markdownlint-cli2 "**/*.md" "#node_modules"`） |

受け入れ条件（`tasks/TEMPLATE.md`）にはここで定義したコマンドを使う。

## コーディング規約

- 既存コードのスタイル（命名・コメント量・イディオム）に合わせる。
- フォーマッタ / リンタの設定ファイルがあれば従い、手で整形しない。
- （プロジェクト固有ルールを追記）

## コミット / ブランチ / PR

- ブランチ: `feature/T-<id>-<slug>`。作成・切替は `antigravity-dispatcher`（Claude Code）が行う。
- コミットメッセージ: Conventional Commits + 末尾に `(T-<id>)`。例: `feat(auth): add login validation (T-007)`。
- `agy` はタスクブランチへ **commit のみ**。push は `scripts/agy-run.sh`、**PR 作成・マージは Claude Code**（人間承認後）。
- `git push`（agy 側）/ `git commit --amend` / `git rebase` / force push は禁止。

## Markdown

- 設定: `.markdownlint-cli2.jsonc`。`.md` を編集したら完了前に lint し、エラーを 0 にする。
