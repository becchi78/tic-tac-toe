# CONTRIBUTING

このリポジトリで作業する **すべての担い手（人間 / Claude Code / Antigravity `agy`）** が従う
プロジェクト固有の規約。運用フロー（誰が何をするか）は `CLAUDE.md` と `AGENTS.md`、
タスク／報告の様式は `tasks/TEMPLATE.md` / `reports/TEMPLATE.report.md` を参照。

## 技術スタック

- 言語 / ランタイム: TypeScript / Node.js 20 以上
- パッケージマネージャ: npm
- フレームワーク / 主要ライブラリ: React 18 + Vite 5、テストは Vitest + @testing-library/react
- Lint / 整形: ESLint + Prettier
- アプリ本体の場所: `app/`（リポジトリルートはオーケストレーション用のまま）

## ビルド・テスト・lint コマンド

いずれも `app/` ディレクトリで実行する（例: `cd app && npm ci`）。

| 目的 | コマンド |
|---|---|
| 依存インストール | `cd app && npm ci` |
| 開発サーバ | `cd app && npm run dev` |
| ビルド | `cd app && npm run build` |
| テスト | `cd app && npm test`（対象を絞るなら `npm test -- src/core`） |
| Lint / 整形 | `cd app && npm run lint`（Markdown は別途 `npx markdownlint-cli2 "**/*.md" "#node_modules"`） |

受け入れ条件（`tasks/TEMPLATE.md`）にはここで定義したコマンドを使う。

## コーディング規約

- 既存コードのスタイル（命名・コメント量・イディオム）に合わせる。
- ESLint / Prettier の設定ファイルに従い、手で整形しない（`npm run lint` を通す）。
- `src/core/` は React / DOM に依存しない純関数のみ。副作用は `src/hooks/` に集約する。
- 型は `src/core/types.ts` に定義し、`any` を使わない。
- コンポーネントは props 受け取りの純粋表示を基本とし、状態は `useGame` フックに寄せる。

## コミット / ブランチ / PR

- ブランチ: `feature/T-<id>-<slug>`。作成・切替は `antigravity-dispatcher`（Claude Code）が行う。
- コミットメッセージ: Conventional Commits + 末尾に `(T-<id>)`。例: `feat(core): add winner detection (T-002)`。
- `agy` はタスクブランチへ **commit のみ**。push は `scripts/agy-run.sh`、**PR 作成・マージは Claude Code**（人間承認後）。
- `git push`（agy 側）/ `git commit --amend` / `git rebase` / force push は禁止。

## Markdown

- 設定: `.markdownlint-cli2.jsonc`。`.md` を編集したら完了前に lint し、エラーを 0 にする。
