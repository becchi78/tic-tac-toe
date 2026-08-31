---
name: write-implementation-report
description: >-
  Use this skill after implementing or reviewing a task ticket, when writing
  reports/T-xxx-*.report.md or reports/T-xxx-*.review.md. It defines the required
  front-matter, sections, and the final markdownlint check.
---

# 実装／レビュー報告の書き方

出力先は `reports/<チケットのベース名>.report.md`（実装役）または `.review.md`（レビュー役）。

## 手順

1. front-matter を書く:

   ```yaml
   ---
   task_id: T-001
   role: implementer          # implementer | reviewer
   result: success            # success | partial | failed
   attempt: 1
   branch: feature/T-001-xxxx
   commits:
     - <短縮ハッシュ> <コミットメッセージ>
   changed_files:
     - path/to/file
   ---
   ```

2. 本文セクションを埋める:
   - `## 実施内容` — 何をどう変更したか（要点のみ）
   - `## テスト結果` — 実行したコマンドと生出力を ` ```text ` ブロックで貼る
     （`npx markdownlint-cli2` の結果も含める）
   - `## セルフレビュー` — 受け入れ条件を 1 項目ずつ OK / NG と根拠、設計書との整合
   - `## 未解決事項 / 確認したいこと` — 無ければ「なし」

3. レビュー役の場合は `## 判定（pass / fail）` と `## 指摘事項（重大度付き）` を追加する。

4. `result` の選び方: 全受け入れ条件クリアなら `success` / 一部未達なら `partial` / 着手不能・重大失敗なら `failed`。
   `partial` `failed` は理由を明記する。

5. `npx markdownlint-cli2 "<書いた報告ファイル>"` を実行し、エラー 0 を確認する。
6. **報告ファイルもタスクブランチにコミットする**（実装コミットと同じか、続けて 1 コミット）。
   最終的に `git status` がクリーンであること。
