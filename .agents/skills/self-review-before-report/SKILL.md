---
name: self-review-before-report
description: >-
  Use this skill right before writing the report, to self-verify a task
  implementation against its acceptance criteria, forbidden-change scope, and
  referenced design docs.
---

# 報告前セルフレビュー

チケットの受け入れ条件を満たしたと判断したら、報告を書く前にこの手順で自己確認する。

## チェック項目

1. **受け入れ条件** — チケットの `## 受け入れ条件` を 1 項目ずつ実際にコマンド実行して確認する。
   チェックボックスを埋める根拠（コマンドと結果）を控えておく。
2. **変更禁止範囲** — `git diff --name-only <default-branch>...HEAD` を取り、
   チケットの `## 変更禁止範囲` に挙がったファイルが含まれていないことを確認する。
3. **設計書との整合** — `design_refs` の設計書を再読し、実装が仕様と矛盾しないか確認する。
4. **Markdown lint** — `.md` を触った場合は `npx markdownlint-cli2 "<対象>"` がエラー 0 か確認する。
5. **コミット** — 実装ファイルと報告の両方がタスクブランチにコミットされ、`git status` がクリーンで、
   `git log --oneline <default>..HEAD` に自分のコミットがあることを確認する（push はしない。ラッパーが行う）。

## いずれか NG のとき

- 直せるものは直してから再度この手順を回す。
- 直せない（変更禁止範囲に抵触する等）ものは、報告の `## 未解決事項` に具体的に書く。
