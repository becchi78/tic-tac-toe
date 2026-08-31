# tic-tac-toe

ブラウザだけで遊べるマルバツ（3目並べ）ゲーム。インストール不要・アカウント不要。
2人プレイと CPU 対戦（強さ 3 段階）に対応した、React + TypeScript 製の静的 Web アプリ。

## 遊び方

- **2人プレイ**: 同じ画面で交互にマスを選び、先に 3 つ並べたほうが勝ち。
- **CPU 対戦**: 相手を CPU にして 1 人で対戦。先手 / 後手と強さを選べる。
  - `easy` … ランダムに打つ
  - `normal` … ときどき最善手（勝てることもある）
  - `hard` … 常に最善手（minimax 全探索。人間は勝てず、引き分けが精一杯）
- 勝敗・引き分けが決まると勝ちラインが強調表示される。
- スコア（X 勝 / O 勝 / 引き分け）は自動で累積。
- **もう一度** で盤面だけリセット、**スコアリセット** でスコアを 0 に戻す。
- マウスのほか、Tab / 矢印キー + Enter だけでも全操作できる。

## 特徴

- 依存の少ない React 18 + Vite 5 + TypeScript 構成。
- ゲームロジック（`src/core/`）は React 非依存の純関数で、Vitest により網羅テスト済み。
- CPU の `hard` は minimax の完全読みで、理論上負けない。
- 外部通信ゼロ。静的アセットのみで動くため GitHub Pages などにそのまま配信できる。
- スマートフォン縦画面〜デスクトップまでレスポンシブ、スクリーンリーダー対応。

## 技術スタック

| 種別 | 採用 |
|---|---|
| 言語 | TypeScript |
| UI | React 18 |
| ビルド | Vite 5 |
| テスト | Vitest + @testing-library/react |
| Lint / 整形 | ESLint + Prettier |

## 開発

アプリ本体は `app/` ディレクトリにある。

```sh
cd app
npm ci            # 依存インストール
npm run dev       # 開発サーバ（http://localhost:5173）
npm run build     # 本番ビルド → app/dist
npm run preview   # ビルド成果物をローカル確認
npm test          # Vitest（対象を絞るなら npm test -- src/core）
npm run lint      # ESLint + Prettier
```

## ディレクトリ構成

```text
tic-tac-toe/
├── app/                     # Web アプリ本体
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── core/            # 盤面・勝敗判定・CPU（純関数 + テスト）
│       ├── hooks/useGame.ts # 状態管理・CPU 自動着手
│       ├── components/      # Board / Cell / StatusBar / ModeSelect / ScoreBoard / Controls
│       └── styles/
├── docs/                    # requirement / design / plan
├── tasks/ · reports/        # タスクチケットと実装報告
└── CLAUDE.md · AGENTS.md    # 開発体制（下記）
```

## デプロイ（GitHub Pages）

`app/vite.config.ts` で `base: './'`（相対パス）が設定されているため、GitHub Pages のサブパス配信に対応しています。

`.github/workflows/deploy.yml` により、`main` ブランチへの push 時に `app/dist` が GitHub Pages へ自動デプロイされます。

手動ビルドを行う場合:

```sh
cd app && npm ci && npm run build
```

生成された `app/dist` を静的ホスティングに配信してください。

## 開発体制

このリポジトリは **High-Low Mix** のエージェント開発基盤テンプレートを使っている。
高コストな **Claude Code** が要件定義・設計・タスク分割・レビューを担うオーケストレーター、
低コストな **Antigravity CLI (`agy`)** が実装・テスト・自己レビューを担う実装者。
やり取りは `docs/` `tasks/` `reports/` のファイルで行い Git で履歴管理する。
運用ルールの詳細は `CLAUDE.md` / `AGENTS.md` を参照。
