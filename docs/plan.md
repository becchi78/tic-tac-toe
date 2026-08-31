# 作業計画・状況ボード

「どの順で進め、今どこにいるか」（What to do / Status）。
Claude Code がタスクの状態遷移のたびに更新する。
詳細は各 `tasks/T-xxx-*.md`、実施結果は `reports/` にある。

## タスク一覧

| ID | 概要 | status | depends_on | ブランチ | 備考 |
|---|---|---|---|---|---|
| T-001 | `app/` に Vite + React + TS を scaffold（Vitest / ESLint / Prettier / base 設定） | done | - | feature/T-001-scaffold-vite-react | PR #1 squash merge（d9b6ea3） |
| T-002 | `src/core/` にゲームロジック純関数 + minimax CPU + Vitest 網羅テスト | in-progress | T-001 | feature/T-002-game-core-logic | ディスパッチ中 |
| T-003 | UI 実装（Board/Cell/StatusBar/ModeSelect/ScoreBoard/Controls）+ useGame + CPU 自動着手 | todo | T-002 | feature/T-003-game-ui | |
| T-004 | スタイリング（レスポンシブ / a11y 仕上げ）+ GitHub Pages デプロイ設定の確定 | todo | T-003 | feature/T-004-styling-deploy | |

status: todo / in-progress / review / merging / blocked / done

## 実施順序

1. T-001 → 2. T-002 → 3. T-003 → 4. T-004

## 現在の状況

- 進行中: T-002（`src/core/` のゲームロジック実装を `agy` にディスパッチ）
- ブロッカー: なし
- 次にやること: T-002 の実装完了 → レビュー → PR → マージ → T-003
