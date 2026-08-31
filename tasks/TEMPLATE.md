---
id: T-NNN
title: タスクの一文サマリ
status: todo            # todo | in-progress | review | merging | blocked | done
branch: feature/T-NNN-slug  # antigravity-dispatcher が作成する。実装エージェントは作らない
depends_on: []          # 例: [T-000]
design_refs:            # 実装エージェントが着手前に必読するプロジェクト設計
  - docs/design.md
conversation_id: null   # 初回ディスパッチ後にラッパー / ディスパッチャが記入
attempts: 0             # リトライ回数
assignee: antigravity   # 常に antigravity（Claude Code は実装しない）
---

<!--
このファイルは tasks/T-<id>-<slug>.md を書くときのテンプレートです。
`/orch-task` コマンド、または `split-into-tasks` スキルの手順でこれを基に生成します。
実タスクではこのコメントごと本文を書き換えてください。
-->

## 背景

なぜこのタスクが必要か。`docs/requirement.md` / `docs/design.md` のどこに対応するか。

## 実装対象

- 変更・追加するファイルやモジュールの想定
- 期待する振る舞い

## 受け入れ条件

各項目は**そのまま実行できるコマンドと期待結果**で書く（レビュー時に再実行される）。

- [ ] `npm test -- <対象>` がすべて成功する
- [ ] `npm run lint` が通る
- [ ] Markdown を編集した場合は `npx markdownlint-cli2 "<対象>"` がエラー 0

## 変更禁止範囲

- このタスクで触ってはいけないファイル / 公開シグネチャ

## 報告フォーマット

`reports/T-NNN-slug.report.md` を `reports/TEMPLATE.report.md` の様式で作成すること。

## レビュー指摘（再ディスパッチ時に Claude Code が追記）

- （なし）
