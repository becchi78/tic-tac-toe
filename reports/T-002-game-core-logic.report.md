---
task_id: T-002
role: implementer
result: success
attempt: 1
branch: feature/T-002-game-core-logic
commits:
  - e7a7d0d feat(core): implement game logic and minimax CPU (T-002)
changed_files:
  - app/src/core/types.ts
  - app/src/core/game.ts
  - app/src/core/cpu.ts
  - app/src/core/game.test.ts
  - app/src/core/cpu.test.ts
  - reports/T-002-game-core-logic.report.md
---

# T-002 実装報告

## 実施内容

- `app/src/core/types.ts` を作成し、`Player`, `Cell`, `Board`, `Difficulty`, `Mode`, `GameStatus`, `Score` を定義
- `app/src/core/game.ts` に以下の純関数および定数を実装:
  - `WIN_LINES`: 8 つの勝利ラインインデックス配列定数
  - `createBoard`: 9 マス全 `null` の盤面生成
  - `currentTurn`: X と O の個数から現在の手番（先手 X）を算出
  - `getWinner`: `WIN_LINES` を走査して勝者とラインを判定
  - `isDraw`: 空きマスがなく勝者もいない場合に引き分けと判定
  - `availableMoves`: 空きマスのインデックス配列を昇順で返却
  - `getGameStatus`: 盤面状態（`playing` / `win` / `draw`）を統合して返却
  - `applyMove`: 不正手（範囲外 / 重複 / 決着後）に例外を投げ、新しい盤面配列を返却
- `app/src/core/cpu.ts` に以下の CPU 思考ロジックを実装:
  - `chooseMove`: 難易度（`easy` / `normal` / `hard`）に応じた着手選択
  - `easy`: 空きマスから一様ランダムに着手
  - `normal`: 70% の確率で minimax 最善手、30% でランダムに着手
  - `hard`: minimax（深さに応じたスコアリングで最短勝ち・最遅負けを選好）による最善手
  - テスト容易性のための `rng` 引数（既定値 `Math.random`）をサポート
- `app/src/core/game.test.ts` / `app/src/core/cpu.test.ts` に Vitest 単体テストおよび性質テストを実装（計 41 テスト）

## テスト結果

### 1. `cd app && npm test -- src/core`

```text
$ cd app && npm test -- src/core

> tic-tac-toe-app@0.1.0 test
> vitest run src/core


 RUN  v2.1.9 /work/tic-tac-toe/app

 ✓ src/core/game.test.ts (28)
 ✓ src/core/cpu.test.ts (13)

 Test Files  2 passed (2)
      Tests  41 passed (41)
   Start at  14:39:08
   Duration  674ms (transform 60ms, setup 80ms, collect 58ms, tests 322ms, environment 287ms, prepare 59ms)
```

### 2. `cd app && npm run lint`

```text
$ cd app && npm run lint

> tic-tac-toe-app@0.1.0 lint
> eslint . && prettier --check .

Checking formatting...
.gitignore.prettierignore.prettierrceslint.config.jsindex.htmlpackage.jsonsrc/App.test.tsxsrc/App.tsxsrc/core/cpu.test.tssrc/core/cpu.tssrc/core/game.test.tssrc/core/game.tssrc/core/types.tssrc/main.tsxsrc/setupTests.tssrc/vite-env.d.tstsconfig.jsonvite.config.tsAll matched files use Prettier code style!
```

### 3. `cd app && npm run build`

```text
$ cd app && npm run build

> tic-tac-toe-app@0.1.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming (1) index.htmltransforming (20) node_modules/react-dom/index.js✓ 30 modules transformed.
rendering chunks (1)...computing gzip size (0)...computing gzip size (1)...computing gzip size (2)...dist/index.html                  0.32 kB │ gzip:  0.26 kB
dist/assets/index-DF5nRiiW.js  142.73 kB │ gzip: 45.86 kB
✓ built in 315ms
```

### 4. `npx markdownlint-cli2 reports/T-002-game-core-logic.report.md`

```text
$ npx markdownlint-cli2 reports/T-002-game-core-logic.report.md
markdownlint-cli2 v0.23.2 (markdownlint v0.41.1)
Finding: reports/T-002-game-core-logic.report.md !node_modules/**
Linting: 1 file
Summary: 0 issues in 0 files
```

## セルフレビュー

- 受け入れ条件の確認:
  - [x] `getWinner`: 8 ライン各勝ち / 勝者なし / 空盤のテストをパス: OK
  - [x] `isDraw` と `getGameStatus`: 引き分け盤 / 進行中 / 勝ち盤のテストをパス: OK
  - [x] `applyMove`: 正常 / 範囲外 / 重複マス / 決着後の例外テストをパス: OK
  - [x] `currentTurn`: 空盤=X / 1 手後=O / 2 手後=X のテストをパス: OK
  - [x] `chooseMove('hard')`: 「1 手で勝てる局面で勝ち手を選ぶ」「相手のリーチを 1 手で塞ぐ」テストをパス: OK
  - [x] `chooseMove('hard')` の性質テスト: 全 9 通りの初手それぞれから自己対戦させ必ず引き分けになることを検証: OK
  - [x] `chooseMove('easy'|'normal')`: 返り値が常に `availableMoves` に含まれることを検証: OK
  - [x] `cd app && npm run lint` がエラー 0: OK
  - [x] `cd app && npm run build` が型エラーなく成功: OK
  - [x] `npx markdownlint-cli2 reports/T-002-game-core-logic.report.md` がエラー 0: OK
- `docs/design.md` / `docs/requirement.md` / `CONTRIBUTING.md` との整合:
  - `src/core/` は React / DOM に一切依存しない純関数として実装
  - データ型、API シグネチャ、minimax の評価値（勝ち `10 - depth` / 負け `depth - 10` / 引き分け `0`）が設計書と完全一致
- 変更禁止範囲の確認:
  - `git diff --name-only main...HEAD` を確認し、変更禁止範囲（`app/src/App.tsx`, `app/src/main.tsx`, `app/index.html`, `app/package.json`, ルートファイル, `.claude/**`, `.agents/**`, `scripts/**`, `docs/**`, `tasks/**`, `app/vite.config.ts`, `tsconfig*.json`, ESLint・Prettier 設定）への変更がないことを確認

## 未解決事項 / 確認したいこと

- なし
