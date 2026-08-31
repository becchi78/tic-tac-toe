---
name: dispatch-to-antigravity
description: タスクチケットを Antigravity (agy) へ渡して実装させる際の前処理・後処理の手順。antigravity-dispatcher サブエージェントから参照される詳細手順。
---

# Antigravity へのディスパッチ手順

`scripts/agy-run.sh` が実務を担う。ここではその前後で行うことを定義する。

## 前処理

1. `tasks/T-xxx-*.md` の `status` が `blocked` でないことを確認。
2. **ブランチを用意する（この工程は Claude Code 側の責務。`agy` は行わない）**:
   `.agents/agent-mix.toml` の `default_branch` から `feature/T-xxx-<slug>` を
   `git switch -c feature/T-xxx-<slug> <default_branch>` で作成・チェックアウト
   （既存なら `git switch feature/T-xxx-<slug>`）。
3. `tasks/T-xxx-*.md` の front-matter `branch:` を更新、`status: in-progress`。

## 実行

```sh
scripts/agy-run.sh implement T-xxx            # 初回
scripts/agy-run.sh implement T-xxx --continue # 再ディスパッチ（会話継続）
```

`agy-run.sh` は stdout に次の形の JSON サマリを返す:

```json
{ "role": "...", "task": "T-xxx", "agy_exit": 0, "agy_status": "SUCCESS",
  "conversation_id": "...", "report_file": "...", "report_exists": true,
  "report_committed": true, "branch": "feature/T-xxx-...", "new_commits": "...",
  "uncommitted_changes": "", "push": "pushed | skipped-no-origin | push-failed: ...",
  "result": "...", "stderr": "" }
```

`push` は `agy-run.sh` が origin の有無を見て自動実行した結果。`push-failed:` なら親に伝える。

## 後処理

1. `conversation_id` を `tasks/T-xxx-*.md` の `conversation_id:` に記入
   （`.agents/state/conversations.json` はラッパーが更新済み）。
2. `agy_exit != 0` または `agy_status != SUCCESS` → `stderr` と `result` を要約して親に返し、
   タイムアウト系は 1 度だけ `--continue` で再試行、レート制限系は人間へ、それ以外は `blocked`。
3. 次のいずれかなら 1 度だけ `--continue` で「実装と報告の両方をコミットし作業ツリーをクリーンにせよ」と再指示:
   - `new_commits` が空
   - `report_exists` false または `report_committed` false
   - `uncommitted_changes` が空でない
4. 揃ったら `status: review`。揃わなければ `attempts` を +1（`>= max_attempts` で `blocked`）。
