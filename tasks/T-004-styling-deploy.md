---
id: T-004
title: スタイリング仕上げと GitHub Pages デプロイ設定の確定
status: done
branch: feature/T-004-styling-deploy
depends_on: [T-003]
design_refs:
  - docs/design.md
  - docs/requirement.md
conversation_id: 2452f485-21a0-4486-b218-5d5708e2ddd6
attempts: 0
assignee: antigravity
---

## 背景

T-003 で機能は揃う。`docs/requirement.md` の非機能要件（レスポンシブ、アクセシビリティ、
静的ホスティング）を満たす見た目・配信設定に仕上げる。

## 実装対象

- スタイル（`app/src/styles/`）:
  - スマートフォン縦（〜360px）〜デスクトップで崩れないレイアウト。盤面は正方形を維持。
  - 手番 / 勝敗の視認性、勝ちラインの強調、フォーカスリング（キーボード操作が分かる）。
  - `prefers-color-scheme: dark` に対応（任意だが推奨）。
  - `prefers-reduced-motion` を尊重（CPU 着手アニメ等があれば無効化）。
- アクセシビリティ最終確認:
  - すべての操作がキーボードのみで可能。`StatusBar` の `aria-live` で結果が読み上げられる。
  - 各マスの `aria-label` が状態を表す。コントラスト比 4.5:1 以上。
  - `Board` の `role` とセルの `role` の整合を取る（T-003 レビュー指摘）。
    盤面を `role="grid"` にするならセルは `role="gridcell"`（ボタンは gridcell の中に入れる）。
    もしくは盤面の `role` を外してセルを素の `button` にする。既存テストを壊さない範囲で。
  - `useGame` の CPU thinking フラグ更新で余分な再レンダーが出ている点を軽く整理してよい
    （T-003 レビュー指摘。状態遷移は変えない。任意）。
- デプロイ:
  - `app/vite.config.ts` の `base` を確認（相対 `'./'` で GitHub Pages のサブパス配信が可能なこと）。
  - `app/README.md` は作らず、ルート `README.md` の「デプロイ（GitHub Pages）」節が実手順と
    一致しているか確認し、ズレがあればルート `README.md` を更新（この節のみ）。
  - `.github/workflows/deploy.yml` を追加（`app/` で build → `app/dist` を Pages に publish）。
    ワークフローは push トリガのみ、`permissions` は最小限。
- `app/index.html`: `<title>` と `lang="ja"`、favicon（インライン SVG 可）。

## 受け入れ条件

- [ ] `cd app && npm run build` が成功する
- [ ] `cd app && npm test` が全て成功する（既存テストを壊していない）
- [ ] `cd app && npm run lint` がエラー 0
- [ ] `npx markdownlint-cli2 "README.md"` がエラー 0
- [ ] 報告に、375px 幅と 1280px 幅での表示確認結果（崩れなし）とキーボード操作の確認手順を記載する
- [ ] `.github/workflows/deploy.yml` が `actions/deploy-pages` 系の構成で、`app/` を対象にしている

## 変更禁止範囲

- `app/src/core/**`
- `app/src/hooks/useGame.ts` のロジック（クラス名 / DOM 構造の調整は可、状態遷移は変えない）
- リポジトリルートの `README.md` 以外のファイル、`.claude/**`, `.agents/**`, `scripts/**`,
  `docs/**`, `tasks/**`, `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`
- `app/package.json` の依存追加（スタイルは素の CSS で行い、UI ライブラリを足さない）

## 報告フォーマット

`reports/T-004-styling-deploy.report.md` を `reports/TEMPLATE.report.md` の様式で作成すること。

## レビュー指摘（再ディスパッチ時に Claude Code が追記）

- （なし）
