---
id: T-003
title: ゲーム UI と useGame フック（CPU 自動着手含む）を実装する
status: todo
branch: feature/T-003-game-ui
depends_on: [T-002]
design_refs:
  - docs/design.md
  - docs/requirement.md
conversation_id: null
attempts: 0
assignee: antigravity
---

## 背景

`docs/design.md`「全体構成」「主要フロー」に対応。T-002 の `src/core/` を使い、
`docs/requirement.md` の FR-1〜FR-11 を満たす画面を実装する。

## 実装対象

- `app/src/hooks/useGame.ts`:
  - 状態: `board` / `mode` (`'pvp'|'cpu'`) / `difficulty` / `humanPlayer` (`'X'|'O'`) / `score`。
  - API: `play(index)` / `reset()`（盤面のみ）/ `resetScore()` /
    `setMode(mode)` / `setDifficulty(d)` / `setHumanPlayer(p)`。
    モード・難易度・先手後手を変えたら盤面をリセット（スコア保持）。
  - 決着時に `score` を加算（勝者 or `draw`）。加算は 1 局につき 1 回だけ。
  - `mode === 'cpu'` かつ手番が CPU かつ `getGameStatus` が `playing` のとき、
    `useEffect` + `setTimeout`（150〜400ms）で `chooseMove` → `play`。
    アンマウント / 盤面変化時にタイマーをクリア。CPU が先手なら初手も自動で打つ。
- `app/src/components/`:
  - `Cell.tsx`: 1 マス。`<button>`。`aria-label`（例「1行1列 空き」「2行3列 X」）、
    勝ちラインのマスに強調 class、決着後 / 埋まっているマスは `disabled`。
  - `Board.tsx`: 3×3 グリッド。矢印キーでフォーカス移動、Enter / Space で着手。
  - `StatusBar.tsx`: 手番 / 勝者 / 引き分けを表示。`aria-live="polite"`。
  - `ModeSelect.tsx`: 2人プレイ / CPU 対戦の切替、CPU 時に難易度と先手後手の選択。
  - `ScoreBoard.tsx`: X 勝 / O 勝 / 引き分け。
  - `Controls.tsx`: 「もう一度」（`reset`）「スコアリセット」（`resetScore`）。
- `app/src/App.tsx`: 上記を配置（プレースホルダを置き換え）。`app/src/main.tsx` は必要なら微修正のみ。
- スタイル: `app/src/styles/`（CSS Modules か単一 CSS）。最小限で可（本格的な見た目は T-004）。
- テスト（`@testing-library/react`）:
  - 着手すると X→O→X の順にマークが入る / 埋まったマスは押しても変化しない。
  - 横一列そろえると勝者テキストが出て、勝ちラインのマスに強調 class が付く。
  - 盤面が埋まって勝者なしなら引き分けテキスト。
  - 「もう一度」で盤面が空になり、スコアは保持される。「スコアリセット」でスコアが 0。
  - CPU 対戦に切替 → 人間が 1 手打つと、少し待って盤面の O（または X）が 1 つ増える
    （`findByText` / `waitFor` とタイマーで検証。`vi.useFakeTimers` 可）。

## 受け入れ条件

- [ ] `cd app && npm test` が全て成功する（core + 上記 UI テスト）
- [ ] `cd app && npm run build` が成功する
- [ ] `cd app && npm run lint` がエラー 0
- [ ] `cd app && npm run preview` で起動し、2人プレイ / CPU 対戦 / リセットが手動で動く
      （報告に手順と結果を記述。スクリーンショットは任意）
- [ ] Markdown を編集した場合は `npx markdownlint-cli2 "<対象>"` がエラー 0

## 変更禁止範囲

- `app/src/core/**`（T-002 の成果。バグを見つけたら報告の「未解決事項」に書き、変更しない）
- `app/vite.config.ts` / `tsconfig*.json` / ESLint・Prettier 設定 / `app/package.json` の既存 scripts
- リポジトリルートの全ファイル、`.claude/**`, `.agents/**`, `scripts/**`, `docs/**`, `tasks/**`

## 報告フォーマット

`reports/T-003-game-ui.report.md` を `reports/TEMPLATE.report.md` の様式で作成すること。

## レビュー指摘（再ディスパッチ時に Claude Code が追記）

- （なし）
