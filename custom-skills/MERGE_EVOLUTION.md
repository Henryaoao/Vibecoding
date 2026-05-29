# Evolution Inbox 合并指南

这份文档给维护者和 Codex agent 使用，用来合并多个协作者、多个操作系统、多个 custom skill 产生的 self-evolution inbox 记录。

合并目标是：去重、白标化、识别可复用规则，再由维护者决定哪些经验进入 skill 的 canonical evolution history。

## 基本场景

多个协作者使用同一套 shared custom skill library：

- Windows 用户：`han`
- macOS 用户：`alice`
- Linux 用户：`chen`

每台机器写自己的 inbox 文件。一个 contributor 文件中可以包含多个 skill 的记录：

```text
evolution-inbox/han.evolution-log.jsonl
evolution-inbox/alice.evolution-log.jsonl
evolution-inbox/chen.evolution-log.jsonl
```

每一行 JSONL 是一条 evolution record。

所有 custom skill 共享同一个 inbox contract。新增 self-evolving skill 前，先读 `CUSTOM_SKILL_STANDARD.md`。

协作者 evolution 记录必须只从 `evolution-inbox/` 进入合并流程。协作者普通运行不得直接写入 skill canonical 文件：

```text
references/evolution-log.jsonl
references/evolution-memory.md
```

canonical history 只由维护者在合并和发布时更新。

## 记录字段

维护者应把这些字段视为合并契约：

- `record_id`：全局唯一事件 id，用于精确去重。
- `date`：记录日期。
- `contributor`：协作者本机用户名。
- `skill`：来源 skill 名称。
- `skill_version`：记录产生时的 skill 版本。
- `source_task`：产生学习的任务类别或任务标识。
- `target_artifact`：可能需要调整的 skill 工件。
- `status`：本地记录状态。
- `principle_key`：可复用学习的语义分组 key。
- `principle`：可复用原则。
- `merge_status`：初始应为 `pending`。

如果 `principle_key` 为空，不要直接合并成正式规则。先按 `summary + target_artifact` 暂时分组，再由维护者判断是否能生成稳定 `principle_key`。

## 维护者合并流程

### 1. 收集 Inbox 文件

请协作者按 `EVOLUTION_SUBMISSION.md` 提交：

```text
contributor-info.json
evolution-inbox/<username>.evolution-log.jsonl
notes.md
```

最低要求是收集：

```text
evolution-inbox/<username>.evolution-log.jsonl
```

把收到的 inbox 文件放入：

```text
custom-skills/evolution-inbox/
```

除非两个协作者本机用户名相同，否则不要重命名文件。用户名冲突时加后缀保留来源：

```text
evolution-inbox/alex.windows.evolution-log.jsonl
evolution-inbox/alex.mac.evolution-log.jsonl
```

### 2. 运行预检

从 `custom-skills/` 根目录运行：

```bash
python tools/merge_evolution_inbox.py
```

可选 JSON 报告：

```bash
python tools/merge_evolution_inbox.py --out-json evolution-inbox/merge-report.json
```

预检工具不会修改 canonical skill 文件。它只报告：

- reviewed files
- loaded records
- malformed lines
- duplicate `record_id`
- semantic groups
- action conflicts
- deny pattern hits

如果维护者知道来源项目名、客户名、内部系统名或 ticket 名，应作为 deny pattern 传入：

```bash
python tools/merge_evolution_inbox.py --deny-pattern "Project Name" --deny-pattern "Internal System Name"
```

任何命中都必须白标化后才能进入 shared skill history。

### 3. 精确去重

如果两条记录有相同 `record_id`，保留第一次出现的记录，把后续记录视为传输重复。

不要把重复 `record_id` 写入 canonical logs。

### 4. 语义分组

精确去重后，按以下 key 分组：

```text
skill + principle_key + target_artifact
```

这能捕捉 Windows、macOS、Linux 协作者独立发现同一可复用规则的情况。

如果 `principle_key` 缺失，暂按以下方式分组：

```text
skill + normalized summary + target_artifact
```

只有当维护者能清楚表达可复用规则时，才补强 `principle_key`。

### 5. 判断每组 Merge Status

每个 semantic group 只能选择一个维护者决策：

- `no_change`：有效本地信号，但不需要共享 skill 变化。
- `candidate`：值得观察，但证据不足，不立即改 skill。
- `promoted`：更新 checklist、reference、script、workflow 或 governance rule。
- `released`：行为变化已纳入 skill，并同步 version/release 文件。
- `deferred`：信号有效，但被证据不足、归属不清或项目专属性阻塞。

当协作者意见冲突或证据不足时，优先使用 `candidate` 或 `deferred`。

### 6. 合并进 Canonical Skill History

每条记录的 `skill` 决定 canonical history 所在 skill 文件夹：

```text
<skill-name>/references/evolution-log.jsonl
<skill-name>/references/evolution-memory.md
```

只有在维护者 merge/release 工作中，才写这些 canonical 文件。

如果使用 `agent-self-evolution/scripts/record_insight.py` 或 `run_evolution_cycle.py`，必须在维护者做出合并决策后显式传入：

```text
--allow-canonical-write
```

canonical history 应写入维护者综合后的白标化记录，而不是原样追加 contributor inbox 记录。

合并时：

1. 保留 raw contributor records 在 `evolution-inbox/` 或归档目录中，作为审计证据。
2. 为每个被接受的 semantic group 写入一条维护者综合记录。
3. 综合记录应使用新的 maintainer `record_id` 或该 skill 既有的 release 记录格式。
4. 综合记录应描述通用原则、目标 artifact、合并决策和 release 结果。
5. 不要把本机用户名、个人名、机器名或协作者私有上下文写入 canonical history。

如果确实需要追溯 contributor 来源，把它保留在 maintainer 私有合并报告、归档 inbox、或本次 release 的内部审查记录里；共享 skill 的 canonical evolution 文件应保持项目无关、协作者无关和可复用。

### 7. 必要时更新 Skill 行为

如果某组记录被标记为 `promoted` 或 `released`，必须确认实际 skill 文件已经更新或本来就包含该规则，例如：

```text
<skill-name>/references/common-checklist.md
<skill-name>/references/route-or-domain-file.md
<skill-name>/scripts/post-task-evolution-wrapper.py
<skill-name>/SKILL.md
```

不要只改 evolution log 就声称规则已 released。

### 8. 更新版本和 Release 文件

如果合并改变了 skill 行为，更新：

```text
<skill-name>/references/version-state.json
<skill-name>/references/release-log.md
```

然后运行该 skill 的 release sync 检查。

当前可用示例：

```bash
python adaptive-audit/scripts/check_evolution_release_sync.py --skill-dir adaptive-audit
python qa-automation-engineering/scripts/check_evolution_release_sync.py --skill-dir qa-automation-engineering
```

如果某个 skill 没有 release-sync 脚本，维护者必须人工确认 version、release log、evolution log 一致。

### 9. 不默认删除 Inbox 文件

保留 inbox 文件作为原始 contributor evidence。

如果需要清理，把已审查文件移到维护者批准的归档目录：

```text
evolution-inbox/archive/YYYY-MM-DD/
```

中央库发布后，告诉协作者哪些 `record_id` 或文件范围已经合并。协作者重新安装最新版中央库后，可以清理或归档本机已合并记录。未合并记录继续留在本机 inbox，供已安装 skill 作为 runtime overlay 使用。

## 冲突处理

当多个 contributor 对同一 `principle_key` 提出不同 action：

- 优先采纳 source task、route、artifact、验证命令、failure ownership 更清楚的记录。
- 在维护者私有合并报告或 inbox archive 中保留 contributor 来源。
- 如果可复用规则不明显，保持 `candidate` 或 `deferred`。

当记录是项目专属而非可复用：

- 标记 `no_change` 或 `deferred`。
- 不更新共享 skill 规则。
- 把项目专属学习留在项目工作区或私有维护者备注中。

当 contributor 使用较旧 `skill_version`：

- 把记录的 target artifact 与当前版本比较。
- 如果规则当前版本已存在，标记为 `released` 或 `no_change`。
- 如果旧版本导致了误报，在合并报告中说明。

当记录包含项目标识：

- 不得原样合并。
- 替换成可复用分类标签。
- 私有原文只保存在源项目工作区或维护者私有备注。
- 共享 skill history 必须保持项目无关。

## 维护者输出报告

每次合并后，输出简短报告：

- inbox files reviewed
- records loaded
- malformed records skipped
- duplicate `record_id`s skipped
- semantic groups reviewed
- 各组决策：`no_change` / `candidate` / `promoted` / `released` / `deferred`
- canonical files changed
- version/release files changed
- validation command results
- residual risks or owner decisions needed
- included source `record_id`s or inbox file ranges, kept outside canonical history when they identify contributors

## 安全规则

- 不要整文件覆盖 canonical logs。
- 不要把 contributor 来源信息写入共享 canonical history；保留在 raw inbox、archive 或维护者私有合并报告中。
- 不要删除 raw inbox 里的 contributor 来源信息，除非已有明确归档和清理决策。
- 不要在实际 skill 文件未更新时声称规则已 released。
- 不要把一个协作者的一次性本地事件直接变成共享规则。
- 保持 raw inbox 和 canonical skill history 分离。
- 对所有 custom skill 使用同一合并流程。
- 不要在共享 evolution history 中保留项目名、客户名、仓库名、ticket 名、真实环境名或一次性模块名。
- 不要让 collaborator-local runs 直接写 canonical evolution logs。
- 不要把密钥、cookie、storageState、浏览器 profile、私有生产数据或敏感截图放进提交包。
