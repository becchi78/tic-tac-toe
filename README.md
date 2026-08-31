# claude-agy-orchestrator

高性能・高コストな **Claude Code** をオーケストレーター（要件定義・設計・指令・レビュー判断）に、
低コスト・高速な **Antigravity CLI (`agy`)** を実装者・レビュアーに据えた、
役割分担型（"High-Low Mix"）の AI エージェント開発基盤。

## 仕組み

```text
人間 ── Claude Code（オーケストレーター）
          │  scripts/agy-run.sh implement <task-id>
          ▼
        agy（実装・テスト・lint・自己レビュー・commit・push）
          │  タスクブランチ feature/T-xxx のコミット + JSON 結果
          ▼
        Claude Code がレビュー → PR 作成 → 人間承認 → マージ
```

| 主体 | 役割 |
|---|---|
| 人間 | 方針決定、マージ承認、エスカレーション対応 |
| Claude Code | 要件定義 / 基本設計 / 作業計画 / タスク分割 / 指示 / 報告レビュー / PR 作成・マージ |
| agy | 設計書を参照した実装 / テスト / Markdown lint / 自己レビュー / commit・push / 報告 |

やり取りはすべて **リポジトリ内のファイル**（`tasks/`・`reports/`・`docs/`）で行い、Git で履歴管理する。

## ファイル・ディレクトリ

| パス | 内容 |
|---|---|
| `CLAUDE.md` / `AGENTS.md` | Claude Code / `agy` それぞれの運用憲法 |
| `docs/requirement.md` / `design.md` / `plan.md`、`CONTRIBUTING.md` | プロジェクトドキュメント（下記） |
| `tasks/TEMPLATE.md` / `reports/TEMPLATE.*.md` | タスクチケット・報告の様式（実タスクはこれを複製して作る） |
| `tasks/T-<id>-<slug>.md` | Claude Code が発行するタスクチケット |
| `reports/T-<id>-<slug>.report.md` / `.review.md` | `agy` の実装・レビュー報告 |
| `scripts/agy-run.sh` | `agy` 呼び出しの唯一のエントリポイント |
| `.agents/` | `agy` のカスタマイズ（agent-mix.toml / skills / hooks / state）— 下記「内部構成」節に詳細 |
| `.claude/` | Claude Code の設定（subagents / skills / commands / settings）— 下記「内部構成」節に詳細 |

## プロジェクトドキュメント

このリポジトリで実際にプロダクトを開発するとき、Claude Code が維持する 4 つの文書。
初期はいずれも空の雛形で、要件すり合わせ以降に埋めていく。

| ドキュメント | 役割 | いつ書くか |
|---|---|---|
| `docs/requirement.md` | 要件定義書。**何を**実装すべきか（What） | 人間との要件すり合わせ時 |
| `docs/design.md` | 基本設計書。要件を**どう**実現するか（How） | 要件が固まった後 |
| `docs/plan.md` | 作業計画・状況ボード。**どの順で**進め、**今どこ**か（What to do / Status） | 設計が固まった後。以降タスクの状態遷移ごとに更新 |
| `CONTRIBUTING.md` | プロジェクト規約。技術スタック・ビルド/テスト/lint コマンド・コーディング/コミット規約 | `design.md` 確定後、**最初のタスク着手前**（受け入れ条件がここのコマンドを参照するため） |

## 内部構成（`.claude/` と `.agents/`）

この 2 ディレクトリがオーケストレーションの実体。`.claude/` は Claude Code が、
`.agents/` は `agy` が（リポジトリを開くと）自動でロードする。

### `.claude/` — Claude Code（オーケストレーター）側

#### `.claude/settings.json` — 権限

| 区分 | 主な内容 | 意図 |
|---|---|---|
| `allow` | `scripts/agy-run.sh` / `agy models` / `git diff\|log\|status\|switch\|branch\|add` / `npx markdownlint-cli2` / `npm run lint` / `Write\|Edit(tasks/**, docs/**)` | 定型の読み取り・タスク管理・agy 起動を無確認で |
| `ask` | `gh pr create` / `gh pr merge` / `git merge` / `git commit` / `git push` | 履歴・リモートに影響する操作は毎回確認 |
| `deny` | `agy -p` / `agy --print` | `agy` の直接実行を禁止（必ず `scripts/agy-run.sh` 経由） |

#### `.claude/agents/` — サブエージェント（`Task` で起動、親のコンテキストを汚さない）

`agy` とのやり取り（冗長な出力・差分精査）を別コンテキストに隔離するための 2 つだけ。

| ファイル | 目的 | tools |
|---|---|---|
| `antigravity-dispatcher.md` | タスクブランチ `feature/T-xxx` を作成 → `scripts/agy-run.sh` 実行 → リトライループ → 要約（20 行以内）だけを親へ返す | Bash, Read, Edit |
| `report-reviewer.md` | チケットの受け入れ条件・変更禁止範囲・`design_refs` に照らして、実コミットと報告を pass/fail 判定。指摘は `agy` へ渡せる粒度で | Bash, Read, Grep |

#### `.claude/skills/` — 手順書（主スレッド／サブエージェントが参照）

| ファイル | 内容 |
|---|---|
| `split-into-tasks/SKILL.md` | `docs/design.md` を `agy` に渡せる粒度のチケット群と `docs/plan.md` に分解する手順（粒度・依存・受け入れ条件の書き方） |
| `dispatch-to-antigravity/SKILL.md` | ディスパッチの前処理（ブランチ準備・`status` 更新）／後処理（`conversation_id` 記録・サマリ JSON の各フィールド `report_committed` `uncommitted_changes` `push` の判定と再ディスパッチ条件） |
| `review-antigravity-report/SKILL.md` | 受け入れ条件の抽出 → `git diff <default>...feature/T-xxx` での実差分確認 → 判定表の作り方 |

#### `.claude/commands/` — スラッシュコマンド（人間が打つ）

| コマンド | 動作 |
|---|---|
| `/orch-task <説明>` | `tasks/TEMPLATE.md` の様式でチケット草案を作成 |
| `/orch-dispatch <task-id> [--continue]` | `antigravity-dispatcher` を起動 |
| `/orch-review <task-id>` | `report-reviewer` を起動し、合格なら PR 作成／不合格なら再ディスパッチを推奨 |

### `.agents/` — Antigravity（`agy`）側のカスタマイズルート

`agy` が作業ディレクトリからリポジトリルートまで遡って自動適用する（`AGENTS.md` も同様）。

#### `.agents/agent-mix.toml` — モデル / タイムアウトの単一真実源

| キー | 既定 | 説明 |
|---|---|---|
| `[antigravity.implementer] model` / `[antigravity.reviewer] model` | `gemini-3.7-flash-high` | `agy models` の slug。末尾 `-high`/`-medium`/`-low` が reasoning レベル |
| `… print_timeout` | `20m` / `15m` | `agy -p` の待機上限（Go duration） |
| `[defaults] max_attempts` | `3` | 同一タスクの再ディスパッチ上限 |
| `[defaults] default_branch` | `main` | ブランチ分岐元・PR ベース |

環境変数 `AGENTMIX_IMPLEMENTER_MODEL` 等で一時的に上書き可。`scripts/agy-run.sh` だけがこれを読む。

#### `.agents/skills.json` + `.agents/skills/` — `agy` スキル

`skills.json` は `{ "entries": [{ "path": ".agents/skills" }] }`（配下を自動ロード）。

| スキル | いつ `agy` が使うか |
|---|---|
| `write-implementation-report/SKILL.md` | タスク完了時。`reports/T-xxx-*.report.md` を規定様式で書き、実装と報告の両方をコミットするまで |
| `self-review-before-report/SKILL.md` | 報告を書く前。受け入れ条件を 1 項目ずつ再実行・変更禁止範囲の差分確認・lint |

#### `.agents/hooks.json` + `.agents/hooks/` — ライフサイクルフック

`command` は `.agents/` からの相対パス。stdin に JSON、stdout に JSON を返す。

| フック | イベント | 動作 |
|---|---|---|
| `guard-paths.sh` | `PreToolUse`（`run_command` / `write_file` / `edit_file` / `create_file`） | 次を `deny`: リポジトリ外への書き込み、`rm -rf /`〜`$HOME`、**`git push`（全て）**、`git commit --amend` / `rebase`、`git switch` / `checkout -b` / `branch <名前>` / `worktree add`、`gh pr create\|merge` / `git merge`、デフォルトブランチへの直コミット |
| `lint-markdown.sh` | `PostToolUse`（書き込み系） | 書いた対象に `.md` があれば `npx markdownlint-cli2` を実行し、エラーがあれば警告を返す |
| `require-report.sh` | `Stop` | `feature/T-xxx` ブランチにいるのに `reports/T-xxx-*.report.md`（または `.review.md`）が無ければ警告 |

#### `.agents/state/conversations.json` — 会話 ID の台帳

`{ "<task-id>": { "implement": "<uuid>", "review": "<uuid>" } }`。`scripts/agy-run.sh` が
`agy` 実行のたびに更新。`--continue` 時の `--conversation` 指定に使う。Git 追跡（秘密は含めない）。

## 使い方

### 前提

- `agy` 1.1.22 以降がインストール・認証済み（サブスク枠。`GEMINI_API_KEY` 等は**設定しない**）。
- `node` / `npx`（Markdown lint 用）、`jq`、`git`。
- Claude Code をこのリポジトリのルートで起動する。

### セットアップ

```sh
npm install                 # markdownlint-cli2（任意。npx でも可）
git remote add origin <URL> # 任意。無くてもローカルで動く（マージは git merge --no-ff）
```

`agy` の疎通確認:

```sh
agy -p "Reply with exactly: OK" --output-format json </dev/null
```

### 開発フロー（Claude Code セッション内）

1. 人間が要件を伝える → Claude Code が `docs/requirement.md` / `docs/design.md` / `docs/plan.md` を作成。
2. `/orch-task <説明>` でタスクチケットを起こす。
3. `/orch-dispatch T-xxx` で `agy` に実装させる。
4. `/orch-review T-xxx` でレビュー。合格なら PR 作成、人間承認後にマージ。
5. 不合格なら `/orch-dispatch T-xxx --continue` で再依頼（会話継続）。

### モデルの切替

`.agents/agent-mix.toml` の `model` **だけ**を編集する。reasoning レベル（`high` / `medium` / `low`）は
モデル slug の末尾に内包されており、`agy` の `--effort` は使わない（slug と食い違うと `agy` がエラーにする）。

```toml
[antigravity.implementer]
model = "gemini-3.7-flash-high"   # `agy models` の slug に置き換える
```

手順:

1. `agy models` で新しいモデルの slug を確認する（`-high` / `-medium` / `-low` 付き）。
2. `.agents/agent-mix.toml` の `model` を書き換える。
3. スモークタスクを 1 件流し、実装 → コミット → 報告 → レビュー → マージが通ることを確認する。

一時的な上書きは環境変数（`AGENTMIX_IMPLEMENTER_MODEL` / `AGENTMIX_REVIEWER_MODEL` 等）。
ロール名・プロンプト・skill にモデル名を直書きしないこと。

## Markdown lint

`.md` を編集したら:

```sh
npx markdownlint-cli2 "**/*.md" "#node_modules"
```

設定は `.markdownlint-cli2.jsonc`。Claude Code・`agy` の双方に lint 実行が義務付けられている。
