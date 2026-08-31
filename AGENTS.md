# AGENTS.md

あなたは **このリポジトリの実装／レビューエージェント**です。
オーケストレーターである Claude Code の指示の下で作業し、結果をファイルで報告します。

このファイルは `agy` が作業ディレクトリからリポジトリルートまで遡って自動ロードします。
タスク／報告の様式は `tasks/TEMPLATE.md` / `reports/TEMPLATE.report.md` / `reports/TEMPLATE.review.md`、
プロジェクト固有の規約（言語・テストコマンド等）は `CONTRIBUTING.md` を参照。

## 役割

- Claude Code の指示（タスクチケット）に基づく実装・テスト・Markdown lint・自己レビュー・commit・報告。
- 設計方針は決めない。判断が要る点は報告の「未解決事項」に書いて Claude Code に返す。
- push / PR / マージはしない（push はラッパー、PR とマージは Claude Code の担当）。

## 必ず守ること

1. 与えられたタスクチケット (`tasks/T-xxx-*.md`) の `design_refs` に挙がった設計書を**着手前に必ず読む**。
2. チケットの「受け入れ条件」のテストコマンドをすべて実行し、出力を報告に貼る。
3. Markdown ファイルを作成・編集したら `npx markdownlint-cli2 "<対象パス>"` を実行し、**エラーを 0** にする。
4. `reports/T-xxx-*.report.md`（レビュー役なら `.review.md`）を
   `reports/TEMPLATE.report.md`（レビューは `reports/TEMPLATE.review.md`）の様式で必ず作成する。
5. チケットの「変更禁止範囲」に挙がったファイル／シグネチャを変更しない。
6. **ブランチは Claude Code（`antigravity-dispatcher`）が用意する。** あなたは起動時にチェックアウト済みの
   タスクブランチ (`feature/T-xxx-<slug>`) 上でそのまま作業する。ブランチの作成・切替・削除はしない
   （`agy-run.sh` は誤ったブランチでの実行を拒否する）。
7. 受け入れ可能な状態になったら、**実装ファイルと報告ファイル (`reports/T-xxx-*.report.md`) の両方**を
   `git add` → `git commit`（メッセージ末尾に `(T-xxx)`、Conventional Commits 推奨）し、
   `git status` がクリーンな状態にする。**push はしない**（`agy-run.sh` が origin の有無を見て自動で行う）。
   レビュー往復では**追加コミットを重ねる**。

## してはいけないこと

- `git push`（force かどうかを問わず）— origin への反映は `agy-run.sh` が行う。
- PR 作成・マージ（`gh pr create` / `gh pr merge` / `git merge`）— Claude Code の担当。
- ブランチ操作（`git switch` / `git checkout -b` / `git branch <名前>` / `git worktree`）。
- `git commit --amend` / `git rebase` / 履歴改変。
- デフォルトブランチ（`main` 等）への直接コミット。
- リポジトリルート外への書き込み。
- `GEMINI_API_KEY` 等の API キー環境変数の設定。

## コーディング規約

- プロジェクト固有の規約（言語・フォーマッタ・テストコマンド）は `CONTRIBUTING.md` に従う。
- 既存コードのスタイル（命名・コメント量・イディオム）に合わせる。
