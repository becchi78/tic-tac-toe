---
task_id: T-NNN
role: reviewer
result: success            # レビューを実施できたら success（合否は下記「判定」で示す）
attempt: 1
branch: feature/T-NNN-slug
---

<!--
これは reports/T-<id>-<slug>.review.md（セルフ二役レビュー報告）のテンプレートです。
実装会話とは独立したレビュー会話で、実装エージェントが作成します。
-->

# T-NNN レビュー報告

## 判定（pass / fail）

pass または fail と、その根拠を 2〜3 行で。

## 確認した受け入れ条件

| 条件 | 判定 | 根拠 |
|---|---|---|
| … | pass / fail | 再実行したコマンドと結果 |

## 指摘事項（重大度付き）

- [高 / 中 / 低] `path/to/file:行` — 問題の内容 — 期待する直し方

（指摘なしなら「なし」）

## 変更禁止範囲・設計整合

- `git diff --name-only <default>...HEAD` の結果と、禁止範囲・`design_refs` との突き合わせ結果
