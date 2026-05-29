# 自定义 Skill 库标准

这份标准适用于以后加入本库的每一个自定义 Codex skill。

这个仓库是一个可移植 skill 库，不是单个 skill 的发布包。每个 custom skill 都应能在 Windows、macOS、Linux 上安装使用。任何声称支持自我进化、post-task learning、adaptive improvement 或 release governance 的 skill，都必须产生可合并的 contributor-scoped evolution 记录。

## 必需文件夹结构

每个 custom skill 必须是 `custom-skills/` 下的直接子文件夹：

```text
custom-skills/
  <skill-name>/
    SKILL.md
    references/
    scripts/
    agents/
```

只有 `SKILL.md` 是 Codex skill discovery 的硬性要求。`references/`、`scripts/`、`agents/` 按 skill 复杂度使用。

根目录保留以下文件夹和文件：

```text
custom-skills/
  agent-self-evolution/
  evolution-inbox/
  tools/
  README.md
  INSTALL.md
  EVOLUTION_SUBMISSION.md
  MERGE_EVOLUTION.md
  CUSTOM_SKILL_STANDARD.md
```

不要创建与这些保留项同名的 skill。

## 可移植性规则

custom skill 不得依赖原作者机器上的绝对路径。

不要硬编码：

```text
C:\Users\<name>
/Users/<name>
/home/<name>
~/.codex/skills/<skill>
```

优先使用相对路径。共享依赖使用 sibling lookup：

```text
../agent-self-evolution/
../evolution-inbox/
```

脚本中需要识别 contributor 时，使用跨平台机制，例如 Python：

```python
getpass.getuser()
```

## SKILL.md 要求

每个 `SKILL.md` 至少应包含：

- frontmatter `name`
- frontmatter `description`
- skill 的触发场景
- 执行流程
- 需要读取的 references
- 输出要求
- 如果有自我进化，必须写明 post-task 或 post-audit closeout

如果 skill 会读取 runtime inbox overlay，`SKILL.md` 必须明确：

```text
../evolution-inbox/<machine-username>.evolution-log.jsonl
```

并说明只读取当前 skill 相关、`merge_status` 为 `pending` 或缺失的记录。

## 自我进化要求

如果一个 skill 声称支持自我进化、post-task learning、adaptive improvement 或 release governance，必须满足：

1. `SKILL.md` 包含强制 post-task 或 post-audit evolution 步骤。
2. skill 自身发布已合并的中央进化历史：

   ```text
   <skill-name>/references/evolution-log.jsonl
   <skill-name>/references/evolution-memory.md
   <skill-name>/references/version-state.json
   <skill-name>/references/release-log.md
   ```

3. 执行前读取本机未合并 inbox 记录作为 runtime overlay。如果本机 inbox 为空，只使用已安装 skill 文件和随包发布的中央进化历史。
4. 需要共享进化标准时，使用 sibling `agent-self-evolution`。
5. 协作者记录只写入 root inbox：

   ```text
   ../evolution-inbox/<machine-username>.evolution-log.jsonl
   ```

6. 协作者普通运行不得直接写入：

   ```text
   <skill-name>/references/evolution-log.jsonl
   <skill-name>/references/evolution-memory.md
   ```

   这些 canonical 文件只由维护者在中央合并和发布时更新。

7. `contributor` 默认使用本机操作系统用户名。
8. 写入 inbox 或 canonical history 前，必须白标化跨项目记录。
9. 最终输出应说明：

   ```text
   Post-task evolution: completed / no_change / blocked
   Collaborator inbox: <path>
   ```

   如果 blocked，说明具体阻塞原因。

## Runtime Inbox Evolution 模型

self-evolution 采用 inbox-first，并且必须可集中合并。

协作者使用已安装 self-evolving skill 时，本机 skill 文件夹本身不需要为了记录本地学习而变更。skill 应把本机 inbox 记录作为 runtime overlay：

1. 读取已安装 skill 的普通文件和中央进化历史：

   ```text
   <installed-skills-dir>/<skill-name>/references/evolution-log.jsonl
   <installed-skills-dir>/<skill-name>/references/evolution-memory.md
   ```

2. 再读取本机 contributor 的 pending 记录：

   ```text
   <installed-skills-dir>/evolution-inbox/<machine-username>.evolution-log.jsonl
   ```

3. 只应用当前 skill 相关记录。runtime inbox guidance 是 additive 和 provisional：可以增强协作者本机后续运行，但不能覆盖显式 skill 规则、安全规则或证据要求。

维护者把选中的 inbox 记录合并并发布到中央 `custom-skills/` 后，协作者应安装最新版中央库。安装会替换同名 skill 文件夹。确认同步后，协作者可以清理或归档已合并的本机 inbox 记录；未合并记录继续保留。

不要把 contributor-specific 学习作为永久本地 skill 文件修改保存。把本地 delta 保留在 `evolution-inbox/`，直到它被合并、拒绝、归档或同步后清理。

## Evolution Inbox 记录契约

每条 inbox JSONL 记录建议包含：

```json
{
  "record_id": "uuid",
  "date": "YYYY-MM-DD",
  "contributor": "machine-username",
  "skill": "skill-name",
  "skill_version": "x.y.z",
  "source_task": "task identifier",
  "target_artifact": "skill-name/references/file.md",
  "target_type": "checklist|script|workflow|prompt|template|governance|skill|agent",
  "summary": "what was learned",
  "action": "recommended action",
  "status": "no_change|logged|candidate|promoted|released|deferred",
  "domain_key": "route-or-domain",
  "standard_family": "standards family",
  "standard_area": "area",
  "task_class": "trivial|standard|substantial|critical",
  "task_type": "task type",
  "loop": "target|meta|both",
  "principle_key": "stable-semantic-key",
  "principle": "generalized reusable rule",
  "abstraction_level": "symptom|failure_mode|principle|rule",
  "merge_status": "pending"
}
```

`record_id` 用于精确去重。`principle_key` 用于跨协作者语义分组。

如果 `principle_key` 暂时无法可靠生成，可以留空，但维护者合并时必须更谨慎：只能按 `summary + target_artifact` 暂时分组，不得直接提升为正式规则。

## 白标化规则

跨项目共享 skill 的 evolution 记录不能包含：

- 具体项目名
- 客户名
- 仓库名
- ticket 名
- 真实环境名
- 内部系统名
- 一次性模块名
- 作者本机路径
- 密钥、token、cookie、storageState

应替换成可复用分类，例如：

```text
credential-gated-admin-workflow
cross-platform-installation
skill-release-governance
test-artifact-readiness
```

项目专属经验可以留在原项目工作区、私有维护者备注或项目专属 skill 中，不应进入共享 cross-project skill 的 inbox 或 canonical history。

## 新增 Custom Skill 流程

新增 skill 时：

1. 在 `custom-skills/` 下创建直接子文件夹。
2. 确保 `SKILL.md` frontmatter 有 `name` 和 `description`。
3. 把依赖放在 skill 文件夹内，或使用 sibling 共享文件夹。
4. 如果 self-evolving，添加或复用能写 root inbox 的 wrapper。
5. 在 `SKILL.md` 中说明 runtime inbox overlay 读取规则。
6. 如果有 central evolution history，维护 `version-state.json` 和 `release-log.md`。
7. 运行可用的 skill validator。
8. 运行：

   ```bash
   python tools/merge_evolution_inbox.py
   ```

9. 如果安装行为变化，更新 `INSTALL.md`。
10. 如果合并治理变化，更新 `MERGE_EVOLUTION.md`。
11. 更新根 `README.md` 的当前 skill 列表。

## 验证建议

新增或修改 skill 后，优先验证：

- `SKILL.md` frontmatter 可被识别。
- Python 脚本能通过 AST parse。
- JSON / JSONL 文件格式有效。
- post-task 或 post-audit wrapper 默认写 inbox，不写 canonical。
- canonical 写入路径需要显式维护者门禁，例如 `--allow-canonical-write`。
- `tools/merge_evolution_inbox.py` 能正常运行。
- release/version/evolution 文件同步。
- 没有项目名、客户名、作者路径或敏感数据残留。

## 合并治理

所有 custom skill 共享同一个 root inbox：

```text
custom-skills/evolution-inbox/
```

维护者应使用 `MERGE_EVOLUTION.md` 做跨 skill 合并。只有维护者可以把选中的 inbox 学习综合成白标化 canonical 记录：

```text
<skill-name>/references/evolution-log.jsonl
<skill-name>/references/evolution-memory.md
```

canonical evolution history 不应原样追加 contributor inbox 记录，也不应包含本机用户名、个人名、机器名或协作者私有上下文。raw contributor 证据保留在 `evolution-inbox/`、归档目录或维护者私有合并报告中。

不要为每个 skill 私自创建独立 inbox，除非未来维护者先更新本标准和 `MERGE_EVOLUTION.md`。

协作者提交本机记录时，使用：

```text
EVOLUTION_SUBMISSION.md
```
