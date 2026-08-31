---
task_id: T-NNN
role: implementer          # implementer | reviewer
result: success            # success | partial | failed
attempt: 1
branch: feature/T-NNN-slug
commits:
  - abc1234 コミットメッセージ (T-NNN)
changed_files:
  - path/to/file
---

<!--
これは reports/T-<id>-<slug>.report.md（実装報告）のテンプレートです。
実装エージェントがタスク完了時にこれを基に作成します。
レビュー報告は reports/TEMPLATE.review.md を使ってください。
-->

# T-NNN 実装報告

## 実施内容

何をどう変更したか。要点のみ。

## テスト結果

受け入れ条件のコマンドと生出力を貼る（`npx markdownlint-cli2` の結果も含める）。

```text
$ npm test -- <対象>
...

$ npm run lint
...
```

## セルフレビュー

- 受け入れ条件を 1 項目ずつ OK / NG と根拠
- `docs/design.md` など `design_refs` との整合
- 変更禁止範囲に触れていないこと（`git diff --name-only <default>...HEAD`）

## 未解決事項 / 確認したいこと

- なし
