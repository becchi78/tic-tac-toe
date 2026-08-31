---
id: T-002
title: src/core/ にゲームロジック純関数と minimax CPU を実装する
status: done
branch: feature/T-002-game-core-logic
depends_on: [T-001]
design_refs:
  - docs/design.md
  - docs/requirement.md
conversation_id: cfc2eb50-1e2b-49ca-9e37-e7a88579971e
attempts: 0
assignee: antigravity
---

## 背景

`docs/design.md`「API / インターフェース仕様（core）」「CPU アルゴリズム」に対応。
React 非依存の純関数として盤面・勝敗判定・CPU 思考を実装し、Vitest で網羅テストする。
T-003 の UI / フックはこのモジュールだけに依存する。

## 実装対象

`app/src/core/` に以下を追加する（React / DOM を import しない）。

- `types.ts`: `Player` (`'X'|'O'`) / `Cell` (`Player|null`) / `Board` (`Cell[]`, 長さ 9) /
  `Difficulty` (`'easy'|'normal'|'hard'`) / `Mode` (`'pvp'|'cpu'`) /
  `GameStatus`（`docs/design.md` の判別可能ユニオン）/ `Score`。
- `game.ts`:
  - `createBoard(): Board` — 全 `null`。
  - `currentTurn(board): Player` — X と O の数から算出（同数なら `'X'`。X が先手）。
  - `applyMove(board, index, player): Board` — 新しい配列を返す。
    範囲外 / 既に埋まっている / 決着済みは `Error` を投げる。
  - `getWinner(board): { winner: Player; line: [number, number, number] } | null` — `WIN_LINES` を走査。
  - `isDraw(board): boolean` — 空きが無く勝者もいない。
  - `availableMoves(board): number[]` — 空きマスの index 昇順。
  - `getGameStatus(board): GameStatus`。
  - `WIN_LINES` 定数をエクスポート。
- `cpu.ts`:
  - `chooseMove(board, difficulty, cpuPlayer): number` — 空きが無ければ `Error`。
    - `easy`: `availableMoves` から一様ランダム。
    - `normal`: 70% で minimax 最善手、30% でランダム。
    - `hard`: minimax（評価値 勝ち `10 - depth` / 負け `depth - 10` / 引き分け `0`）。
  - 乱数はテスト可能にするため、省略可能な第 4 引数 `rng: () => number`（既定 `Math.random`）を受ける。
- テスト: `game.test.ts` / `cpu.test.ts`。

## 受け入れ条件

- [ ] `cd app && npm test -- src/core` が全て成功する。少なくとも次を含む:
  - `getWinner`: 8 ライン各勝ち / 勝者なし / 空盤
  - `isDraw` と `getGameStatus`: 引き分け盤 / 進行中 / 勝ち盤
  - `applyMove`: 正常 / 範囲外 / 重複マス / 決着後 で例外
  - `currentTurn`: 空盤=X / 1 手後=O / 2 手後=X
  - `chooseMove('hard')`: 「1 手で勝てる局面で勝ち手を選ぶ」「相手のリーチを 1 手で塞ぐ」
  - `chooseMove('hard')` の性質テスト: 全 9 通りの初手それぞれから、
    相手も hard で自己対戦させると必ず引き分けになる（CPU は負けない）
  - `chooseMove('easy'|'normal')`: 返り値が常に `availableMoves` に含まれる
- [ ] `cd app && npm run lint` がエラー 0
- [ ] `cd app && npm run build` が成功する（型エラーなし）
- [ ] Markdown を編集した場合は `npx markdownlint-cli2 "<対象>"` がエラー 0

## 変更禁止範囲

- `app/src/App.tsx` / `app/src/main.tsx` / `app/index.html`（T-003 で置き換え。ここでは触らない）
- `app/package.json` の依存追加（core はランタイム依存不要。テスト用の既存 devDeps で足りる）
- リポジトリルートの全ファイル、`.claude/**`, `.agents/**`, `scripts/**`, `docs/**`, `tasks/**`
- `app/vite.config.ts` / `tsconfig*.json` / ESLint・Prettier 設定

## 報告フォーマット

`reports/T-002-game-core-logic.report.md` を `reports/TEMPLATE.report.md` の様式で作成すること。

## レビュー指摘（再ディスパッチ時に Claude Code が追記）

- （なし）
