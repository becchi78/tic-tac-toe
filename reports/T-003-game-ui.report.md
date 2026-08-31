---
task_id: T-003
role: implementer
result: success
attempt: 1
branch: feature/T-003-game-ui
commits:
  - ce3fc85 feat(ui): implement game UI components and useGame hook (T-003)
changed_files:
  - app/src/App.tsx
  - app/src/App.test.tsx
  - app/src/components/Board.tsx
  - app/src/components/Cell.tsx
  - app/src/components/Controls.tsx
  - app/src/components/ModeSelect.tsx
  - app/src/components/ScoreBoard.tsx
  - app/src/components/StatusBar.tsx
  - app/src/hooks/useGame.ts
  - app/src/hooks/useGame.test.ts
  - app/src/styles/App.css
---

# T-003 実装報告

## 実施内容

- `app/src/hooks/useGame.ts`:
  - 状態管理: `board`, `mode` (`'pvp' | 'cpu'`), `difficulty` (`'easy' | 'normal' | 'hard'`), `humanPlayer` (`'X' | 'O'`), `score` (`X`, `O`, `draw`)。
  - 操作関数: `play(index)`, `reset()`, `resetScore()`, `setMode()`, `setDifficulty()`, `setHumanPlayer()` を提供。設定変更時は盤面をリセット（スコア保持）。
  - スコア加算: 勝者または引き分け時に 1 局につき 1 回のみスコアを加算。
  - CPU 自動着手: `mode === 'cpu'` かつ CPU 手番かつ `playing` 時に `useEffect` + `setTimeout` (250ms) で `chooseMove` を呼び出して自動着手。アンマウント／盤面変化時にタイマーをクリア。CPU 先手時（後手選択時）も初手を自動着手。
- `app/src/components/`:
  - `Cell.tsx`: 1 マスボタン。`aria-label`（例:「1行1列 空き」「2行3列 X」）、勝ちマスの強調クラス (`winning`)、決着後／埋まりマス／CPU 思考中の `disabled` 対応。
  - `Board.tsx`: 3×3 グリッド表示。矢印キー（ArrowUp / Down / Left / Right）によるフォーカス移動ナビゲーション対応。
  - `StatusBar.tsx`: 手番・勝者・引き分けを表示（`aria-live="polite"`）。
  - `ModeSelect.tsx`: 2人プレイ／CPU対戦の切替、CPU 選択時の難易度（easy / normal / hard）および先手・後手選択。
  - `ScoreBoard.tsx`: X 勝 / O 勝 / 引き分けの累積表示。
  - `Controls.tsx`: 「もう一度」（`reset`）と「スコアリセット」（`resetScore`）ボタン。
- `app/src/App.tsx`:
  - 上記コンポーネントをレイアウトし、`useGame` を結合。
- `app/src/styles/App.css`:
  - グリッドレイアウト、マス目スタイル、勝ちライン強調スタイル、コントロール類の基本スタイル。
- テスト:
  - `app/src/hooks/useGame.test.ts`: フック単体の状態遷移、スコア加算、CPU 自動着手、初期化を検証。
  - `app/src/App.test.tsx`: 交互着手、重複着手防止、勝ちライン強調、引き分け、リセット・スコアリセット、CPU 自動着手、キーボード操作を総合的にテスト。

## テスト結果

```text
$ cd app && npm test

> tic-tac-toe-app@0.1.0 test
> vitest run


 RUN  v2.1.9 /work/tic-tac-toe/app

 ✓ src/core/game.test.ts (28)
 ✓ src/hooks/useGame.test.ts (9)
 ✓ src/App.test.tsx (8)
 ✓ src/core/cpu.test.ts (13) 359ms

 Test Files  4 passed (4)
      Tests  58 passed (58)
   Start at  14:48:07
   Duration  757ms (transform 157ms, setup 118ms, collect 315ms, tests 636ms, environment 660ms, prepare 137ms)

$ cd app && npm run build

> tic-tac-toe-app@0.1.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming (1) index.htmltransforming (30) node_modules/react-dom/index.js✓ 40 modules transformed.
rendering chunks (1)...computing gzip size (0)...computing gzip size (1)...computing gzip size (2)...computing gzip size (3)...dist/index.html                   0.39 kB │ gzip:  0.29 kB
dist/assets/index-OmHRU7wx.css    2.04 kB │ gzip:  0.80 kB
dist/assets/index-wIkg6vGH.js   149.06 kB │ gzip: 48.45 kB
✓ built in 339ms

$ cd app && npm run lint

> tic-tac-toe-app@0.1.0 lint
> eslint . && prettier --check .

Checking formatting...
All matched files use Prettier code style!

$ cd app && npm run preview -- --port 4173 (手動確認)
- 2人プレイ: 交互に着手でき、勝敗・引き分けおよびスコア更新・リセットが動作。
- CPU対戦: 人間着手後に CPU が自動応手し、先手/後手切替・難易度切替も正常に動作。
- HTTP GET で HTML / CSS / JS アセットの配信が正常に行われることを確認。

$ npx markdownlint-cli2 reports/T-003-game-ui.report.md
Finding: reports/T-003-game-ui.report.md !node_modules/**
Linting: 1 file
Summary: 0 issues in 0 files
```

## セルフレビュー

- **受け入れ条件**:
  - `cd app && npm test`: 全 58 テスト（core + useGame + UI）がパス（OK）。
  - `cd app && npm run build`: TypeScript コンパイルおよび Vite ビルドが正常終了（OK）。
  - `cd app && npm run lint`: ESLint / Prettier エラー 0 件（OK）。
  - `cd app && npm run preview`: プレビューサーバ起動・動作確認完了（OK）。
  - Markdown lint: `npx markdownlint-cli2 reports/T-003-game-ui.report.md` がエラー 0 件（OK）。
- **設計書との整合**:
  - `docs/design.md`「全体構成」「主要フロー」および `docs/requirement.md` FR-1〜FR-11 に準拠。
  - アクセシビリティ（`aria-label`, `aria-live="polite"`, 矢印キー移動）を実装。
- **変更禁止範囲**:
  - `app/src/core/**`、設定ファイル、タスクファイル等に変更禁止範囲内のファイルは含まれていません。

## 未解決事項 / 確認したいこと

- なし
