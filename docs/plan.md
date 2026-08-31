# 作業計画・状況ボード

「どの順で進め、今どこにいるか」（What to do / Status）。
Claude Code がタスクの状態遷移のたびに更新する。
詳細は各 `tasks/T-xxx-*.md`、実施結果は `reports/` にある。

## タスク一覧

| ID | 概要 | status | depends_on | ブランチ | 備考 |
|---|---|---|---|---|---|
| T-001 | `app/` に Vite + React + TS を scaffold（Vitest / ESLint / Prettier / base 設定） | done | - | feature/T-001-scaffold-vite-react | PR #1 squash merge（d9b6ea3） |
| T-002 | `src/core/` にゲームロジック純関数 + minimax CPU + Vitest 網羅テスト | done | T-001 | feature/T-002-game-core-logic | PR #2 squash merge（1b5c1e6） |
| T-003 | UI 実装（Board/Cell/StatusBar/ModeSelect/ScoreBoard/Controls）+ useGame + CPU 自動着手 | done | T-002 | feature/T-003-game-ui | PR #3 squash merge（920d584） |
| T-004 | スタイリング（レスポンシブ / a11y 仕上げ）+ GitHub Pages デプロイ設定の確定 | done | T-003 | feature/T-004-styling-deploy | PR #4 squash merge（aa0b9e6） |

status: todo / in-progress / review / merging / blocked / done

## 実施順序

1. T-001 → 2. T-002 → 3. T-003 → 4. T-004

## 現在の状況

- 進行中: なし（T-001〜T-004 すべて done、`main` にマージ済み）
- ブロッカー: なし
- 次にやること: GitHub Pages を Settings > Pages で「GitHub Actions」ソースに設定すれば
  `main` への push で自動デプロイされる。以降は機能追加・改善タスクを起票して回す。
- 全体検証（`main` / 2026-08-31 時点）: `cd app && npm ci && npm run lint && npm test && npm run build`
  すべて成功。テスト 58 件 pass、`vite preview` で `<title>マルバツゲーム</title>` と相対アセット配信を確認。
  リポジトリ全体の markdownlint エラー0。
- T-003 レビュー積み残し: Board の role 整合は T-004 で対応済み。
  CPU thinking フラグの再レンダー整理は未対応（機能影響なし・任意）。
