---
name: review-antigravity-report
description: agy の実装報告と push 済みコミットを受け入れ条件に照らして構造化レビューする手順。report-reviewer サブエージェントから参照される詳細手順。
---

# Antigravity 報告のレビュー手順

## 1. 受け入れ条件の抽出

`tasks/T-xxx-*.md` の `## 受け入れ条件` の各チェック項目を列挙する。
テストコマンドが書かれているものは、可能な限り自分で再実行する。

## 2. 実差分の確認

`DEF` = `.agents/agent-mix.toml` の `default_branch`。

```sh
git log --oneline DEF..HEAD
git diff --name-only DEF...HEAD
git diff DEF...HEAD
```

- 変更ファイルが `## 変更禁止範囲` に触れていないか。
- 報告の `changed_files` と実際の差分が一致するか（乖離は要注意）。

## 3. 判定表の作成

| 受け入れ条件 | 判定 | 根拠 |
|---|---|---|
| … | pass/fail | 1 行で |

## 4. 出力

- 総合判定 pass / fail。
- fail は「ファイル・箇所・期待する直し方」を `agy` にそのまま渡せる粒度で書く。
- 推奨: 「PR 作成へ」/「再ディスパッチ」。
