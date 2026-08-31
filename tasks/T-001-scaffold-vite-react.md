---
id: T-001
title: app/ に Vite + React + TypeScript プロジェクトを scaffold する
status: review
branch: feature/T-001-scaffold-vite-react
depends_on: []
design_refs:
  - docs/design.md
  - docs/requirement.md
  - CONTRIBUTING.md
conversation_id: 2cc9cbd2-5ef9-4607-a341-2abffaead987
attempts: 0
assignee: antigravity
---

## 背景

`docs/requirement.md` のマルバツゲームを載せる土台がまだ無い。
`docs/design.md`「全体構成」のディレクトリ構成に沿って `app/` に
Vite + React + TypeScript の最小プロジェクトを用意する。以降の T-002〜T-004 はこの上に乗る。

## 実装対象

- `app/` に Vite (React + TypeScript テンプレート相当) を構成する。ルートの `package.json` は触らない。
- `app/package.json` の `scripts`: `dev` / `build` / `preview` / `test` / `lint`。
  - `test` は Vitest（`vitest run`）。`lint` は ESLint 実行 + `prettier --check`（またはまとめて）。
- 依存: `react` `react-dom` / dev: `vite` `@vitejs/plugin-react` `typescript` `vitest`
  `@testing-library/react` `@testing-library/jest-dom` `jsdom` `eslint` `prettier`
  および必要な ESLint プラグイン（`@typescript-eslint/*`, `eslint-plugin-react-hooks` 等）。
- `app/vite.config.ts`: `@vitejs/plugin-react` を有効化。`base: './'`（相対パス。GitHub Pages 対応）。
  Vitest 設定（`environment: 'jsdom'`, `globals: true`, `setupFiles: 'src/setupTests.ts'`）を同ファイルか
  `vitest.config.ts` に置く。
- `app/src/setupTests.ts`: `import '@testing-library/jest-dom'`。
- `app/tsconfig.json`（+ 必要なら `tsconfig.node.json`）: `strict: true`。
- `app/index.html` + `app/src/main.tsx` + `app/src/App.tsx`: プレースホルダ（見出し「マルバツゲーム」程度）。
- `app/src/App.test.tsx`: 見出しが描画されることを確認するサンプルテスト 1 件。
- `app/.eslintrc.*`（または flat config）、`app/.prettierrc*`、`app/.gitignore`（`dist`, `node_modules`, `coverage`）。
- ルートの `.gitignore` に `app/node_modules` / `app/dist` / `app/coverage` が含まれるよう追記してよい
  （ルート `.gitignore` のみ、他のルート設定は変更しない）。

## 受け入れ条件

各項目は**そのまま実行できるコマンドと期待結果**で書く（レビュー時に再実行される）。

- [ ] `cd app && npm install` が成功する（`package-lock.json` が生成・コミットされる）
- [ ] `cd app && npm run build` が成功し `app/dist/index.html` が生成される
- [ ] `cd app && npm run lint` がエラー 0 で終了する
- [ ] `cd app && npm test` が成功する（サンプルテスト 1 件が pass）
- [ ] Markdown を編集した場合は `npx markdownlint-cli2 "<対象>"` がエラー 0

## 変更禁止範囲

- リポジトリルートの `package.json` / `package-lock.json` / `.markdownlint-cli2.jsonc`
- `.claude/**`, `.agents/**`, `scripts/**`
- `docs/**`, `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `tasks/**`, `reports/TEMPLATE.*`
- ゲームロジック / UI の実装（T-002・T-003 の担当。ここではプレースホルダのみ）

## 報告フォーマット

`reports/T-001-scaffold-vite-react.report.md` を `reports/TEMPLATE.report.md` の様式で作成すること。

## レビュー指摘（再ディスパッチ時に Claude Code が追記）

- （なし）
