# 基本設計書

`docs/requirement.md` の要件を「どう」実現するか。タスクチケットの `design_refs` はこのファイルを指す。

## 全体構成

純粋ロジック層（`core`）と表示層（React `components` + フック）を分離する。
`core` は DOM / React に依存しない純関数の集合で、Vitest で網羅的にテストする。

```text
app/
├── index.html
├── vite.config.ts          # base 相対パス、Vitest 設定
├── src/
│   ├── main.tsx            # エントリ。<App /> をマウント
│   ├── App.tsx             # 画面レイアウト、useGame を束ねる
│   ├── core/
│   │   ├── types.ts        # Cell / Board / Player / Difficulty / GameStatus
│   │   ├── game.ts         # createBoard / applyMove / getWinner / isDraw / getGameStatus
│   │   ├── cpu.ts          # chooseMove(board, difficulty, cpuPlayer) — minimax
│   │   └── *.test.ts       # core の単体テスト
│   ├── hooks/
│   │   └── useGame.ts      # 盤面・手番・モード・スコアの状態管理、CPU 自動着手
│   ├── components/
│   │   ├── Board.tsx / Cell.tsx
│   │   ├── StatusBar.tsx
│   │   ├── ModeSelect.tsx      # 2P / CPU、難易度、先手後手
│   │   ├── ScoreBoard.tsx
│   │   └── Controls.tsx        # 「もう一度」「スコアリセット」
│   └── styles/                 # CSS Modules もしくは 1 枚の CSS
└── src/setupTests.ts       # @testing-library/jest-dom
```

## データモデル / スキーマ

```ts
type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];            // 長さ 9。index 0..8 が左上→右下
type Difficulty = 'easy' | 'normal' | 'hard';
type Mode = 'pvp' | 'cpu';

type GameStatus =
  | { kind: 'playing'; turn: Player }
  | { kind: 'win'; winner: Player; line: [number, number, number] }
  | { kind: 'draw' };

interface Score { X: number; O: number; draw: number; }
```

`useGame` が保持する状態: `board`, `mode`, `difficulty`, `humanPlayer`（CPU 戦時）, `score`。
手番は `board` 上の X / O の数から導出（X が先手・常に X から）。

## API / インターフェース仕様（core）

| 名前 | 入力 | 出力 | 説明 |
|---|---|---|---|
| `createBoard()` | なし | `Board` | 全 `null` の 9 マス |
| `currentTurn(board)` | `Board` | `Player` | X と O の数から手番を算出（同数なら X） |
| `applyMove(board, index, player)` | `Board, number, Player` | `Board`（新規） | 不正手（範囲外 / 埋まっている / 決着後）は例外 |
| `getWinner(board)` | `Board` | `{ winner, line } \| null` | 8 ラインを走査 |
| `isDraw(board)` | `Board` | `boolean` | 空き無し かつ 勝者なし |
| `getGameStatus(board)` | `Board` | `GameStatus` | 上記を統合 |
| `availableMoves(board)` | `Board` | `number[]` | 空きマスの index |
| `chooseMove(board, difficulty, cpuPlayer)` | `Board, Difficulty, Player` | `number` | CPU の着手先。空きが無ければ例外 |

React コンポーネントは props で状態とハンドラを受け取る純粋表示。副作用は `useGame` に集約。

## CPU アルゴリズム

- `WIN_LINES`: `[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]`。
- `easy`: `availableMoves` から一様ランダム。
- `normal`: 70% の確率で最善手（minimax）、30% でランダム。「時々勝てる」体験。
- `hard`: minimax（深さによる加点で早い勝ち / 遅い負けを選好）。3×3 は全探索可能。
  性質: CPU が hard のとき、相手の着手が何であっても CPU は敗北しない（引き分け以上）。
- minimax はメモ化不要（状態数が小さい）。評価値: 勝ち `+10 - depth` / 負け `-10 + depth` / 引き分け `0`。

## 主要フロー

1. 着手（人間）: `Cell` クリック → `useGame.play(index)` → `applyMove` → 状態更新。
2. 決着判定: 毎着手後に `getGameStatus`。`win` / `draw` なら `score` を加算し盤面をロック。
3. CPU 応手: `mode === 'cpu'` かつ手番が CPU かつ `playing` のとき、`useEffect` で
   150〜400ms の遅延後に `chooseMove` → `play`。
4. モード / 難易度 / 先手後手の変更: 盤面を `createBoard()` にリセット（スコアは保持）。
   CPU が先手なら即座に CPU が着手。
5. 「もう一度」: 盤面のみリセット。「スコアリセット」: `score` を 0 に。

## エラー処理方針

- `core` の不正入力は `Error` を投げる（UI 側は空きマスのみ操作可能にして到達させない）。
- 想定外状態は `App` レベルの ErrorBoundary で握り、リロード導線を出す（任意 / 低優先）。

## テスト方針

- `core`（必須・網羅）:
  - `getWinner`: 8 ライン各勝ち、勝者なし、両者リーチ。
  - `isDraw` / `getGameStatus`: 引き分け盤面、進行中、勝ち盤面。
  - `applyMove`: 正常・範囲外・重複・決着後の例外。
  - `currentTurn`: 空盤 / 奇数手 / 偶数手。
  - `chooseMove`（hard）: 「勝てる手があれば取る」「負ける手を避ける」、
    全空きマス初手から自己対戦させ CPU が負けない性質テスト。
  - `easy` / `normal` は `availableMoves` 内を返すこと（乱数はシード注入 or 統計的に確認）。
- `components` / `hooks`（主要動線）:
  - 着手で記号が交互に入る / 埋まったマスは押せない。
  - 勝ち表示・勝ちラインの強調 class。
  - 引き分け表示。
  - 「もう一度」で盤面クリア・スコア保持、「スコアリセット」で 0。
  - CPU モードで人間着手後に CPU マークが増える。
- lint: `npm run lint`（ESLint + Prettier）。

## タスク分解の方針

- 1 タスク = 1 ブランチ = 数コミット。T-001 scaffold → T-002 core → T-003 UI/hooks → T-004 仕上げ。
- 依存関係は `docs/plan.md` で管理する。各タスクの「変更禁止範囲」で担当ファイルを分離する。
