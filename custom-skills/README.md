# 自定义 Codex Skills 共享库

这个文件夹是可共享的自定义 Codex skill 库，用来集中管理团队自定义 skill、安装说明、协作者本地进化记录，以及维护者合并进化记录的流程。

它的目标是：

- 让协作者可以在 Windows、macOS、Linux 上安装同一套 skill。
- 让自定义 skill 的自我进化可追踪、可去重、可合并。
- 让协作者本机的临时学习先进入 inbox，而不是直接改 skill 本体。
- 让维护者在审查后再把通用学习合并进 canonical skill 历史。
- 避免把具体项目名、客户名、机器路径、密钥或私有环境信息写入共享 skill。

## 当前包含的 Skill

- `qa-automation-engineering`：专业 QA 自动化与测试工程 skill，覆盖测试点分析、测试用例、Web/API/mobile 自动化、报告诊断、性能测试等。
- `adaptive-audit`：通用审计 skill，会先识别文档或工件类型，再套用对应审计标准，适用于 PRD、代码审查、测试工件、研究材料、流程文档、skill 发布包等。
- `agent-self-evolution`：共享的自我进化元 skill，供其他自进化 skill 使用，用来判断哪些经验可以沉淀为通用规则。

ProjectM 依赖的 portable mirror skills 已移到：

```text
../custom-skill-dev-package/skills/
```

完整清单见：

```text
../custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md
```

## 文件夹结构

```text
custom-skills/
  README.md
  INSTALL.md
  CUSTOM_SKILL_STANDARD.md
  EVOLUTION_SUBMISSION.md
  MERGE_EVOLUTION.md
  qa-automation-engineering/
  adaptive-audit/
  agent-self-evolution/
  evolution-inbox/
  tools/
```

- `qa-automation-engineering/`、`adaptive-audit/`、`agent-self-evolution/` 是本项目直接维护的可安装 skill 文件夹。
- `evolution-inbox/` 是维护者收集协作者进化记录的位置，不是 Codex skill。
- `tools/` 存放跨 skill 的辅助工具，目前包含 evolution inbox 预检工具。
- 根目录的 `.md` 文件是安装、提交、合并、创建新 skill 的治理说明。
- `custom-skill-dev-package/skills/` 存放从作者本机或外部 skill 库镜像来的 portable skills，不放在本目录。

## 先读哪份文档

按你的角色选择入口：

| 角色 | 先读 | 用途 |
| --- | --- | --- |
| 普通使用者 / 协作者 | `INSTALL.md` | 把这些 skill 安装到自己的 Codex skill 目录。 |
| ProjectM 协作者 | `../custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md` | 查看 `AGENTS.md` 依赖的非原生 skill 以及本地 fallback 规则。 |
| 需要提交本机进化记录的协作者 | `EVOLUTION_SUBMISSION.md` | 打包 `evolution-inbox/<用户名>.evolution-log.jsonl` 给维护者。 |
| 维护者 | `MERGE_EVOLUTION.md` | 收集、查重、白标化、合并不同协作者的进化记录。 |
| 新增自定义 skill 的作者 | `CUSTOM_SKILL_STANDARD.md` | 按统一结构创建新 skill，并接入共享 inbox 进化规则。 |
| Codex agent | 本文件，然后按任务读取对应文档 | 根据当前任务自动选择安装、提交、合并或创建流程。 |

## 安装摘要

Codex 通常只会自动发现安装在 Codex skill 目录里的 skill：

```text
$CODEX_HOME/skills
```

如果没有设置 `CODEX_HOME`，默认使用：

```text
~/.codex/skills
```

安装时只复制直接包含 `SKILL.md` 的子文件夹，例如：

```text
qa-automation-engineering/
adaptive-audit/
agent-self-evolution/
```

不要把下面这些根目录支持文件夹当作 skill 安装：

```text
evolution-inbox/
tools/
```

如果目标机器上已经有同名 skill，安装时应使用本库中的最新版替换目标 skill 文件夹。不要删除目标 skill 目录旁边已有的本机 `evolution-inbox/`，除非维护者已经确认里面的记录已合并或可以归档。

跨平台安装步骤和示例见：

```text
INSTALL.md
```

## 自我进化规则摘要

本库采用 inbox-first 的协作进化模型。

协作者日常使用 self-evolving skill 时：

1. skill 先读取已安装的 skill 文件和随包发布的 canonical evolution 历史。
2. skill 再读取本机未合并记录：

   ```text
   <skills-dir>/evolution-inbox/<machine-username>.evolution-log.jsonl
   ```

3. 如果本机 inbox 为空或不存在，则只使用已安装的中央版本。
4. 如果本次任务产生可复用经验，协作者记录只写入本机 inbox。
5. 协作者普通运行不得直接写入 skill 本体的：

   ```text
   references/evolution-log.jsonl
   references/evolution-memory.md
   ```

维护者合并时：

1. 收集各协作者的 inbox 文件。
2. 放入本库的：

   ```text
   custom-skills/evolution-inbox/
   ```

3. 运行预检：

   ```bash
   python tools/merge_evolution_inbox.py
   ```

4. 按 `MERGE_EVOLUTION.md` 做查重、语义分组、白标化和合并决策。
5. 只有通过维护者审查的通用经验，才合并进对应 skill 的 canonical evolution 文件。

## 协作者需要提交什么

通常只需要提交自己的本机 inbox 文件：

```text
evolution-inbox/<machine-username>.evolution-log.jsonl
```

推荐按 `EVOLUTION_SUBMISSION.md` 打包：

```text
evolution-submission/
  contributor-info.json
  evolution-inbox/
    <machine-username>.evolution-log.jsonl
  notes.md
```

不要提交密钥、cookie、浏览器 profile、storageState、真实生产数据、客户私有资料、截图中的敏感信息，或只对某个项目有效的内部细节。

## 创建新 Skill 的规则

新增自定义 skill 前，先读：

```text
CUSTOM_SKILL_STANDARD.md
```

最低要求：

- 新 skill 必须是 `custom-skills/` 下的直接子文件夹。
- 根目录必须有合法的 `SKILL.md`。
- 不得依赖作者本机绝对路径。
- 如果声称支持自我进化，必须接入共享 `evolution-inbox/` 规则。
- 跨项目共享的进化记录必须白标化，不能包含具体项目名、客户名、仓库名、ticket 名、真实环境名或一次性模块名。
- 新增或修改 skill 后，应运行 skill 校验和 inbox merge 预检。

## 不要做的事

- 不要把 `evolution-inbox/` 或 `tools/` 当作 Codex skill 安装。
- 不要让协作者本机直接修改 canonical evolution 文件来记录普通任务经验。
- 不要把项目专属经验直接沉淀成共享 skill 规则。
- 不要把未白标化的项目名、客户名、内部系统名、仓库名、ticket 名写入共享 evolution 记录。
- 不要在提交中包含密钥、token、cookie、storageState、私有下载文件或敏感截图。
- 不要在没有合并决策的情况下清空协作者本机 inbox。

## 维护者快速检查

在合并或发布前，至少运行：

```bash
python tools/merge_evolution_inbox.py
```

对有 release sync 脚本的 skill，还应运行对应检查，例如：

```bash
python adaptive-audit/scripts/check_evolution_release_sync.py --skill-dir adaptive-audit
python qa-automation-engineering/scripts/check_evolution_release_sync.py --skill-dir qa-automation-engineering
```

如果有 skill validator，也应对每个 skill 运行一次。

## 当前治理状态

- `adaptive-audit` 已接入共享 custom-skills 模型，普通 post-audit 进化默认只写 inbox。
- `qa-automation-engineering` 已接入共享 custom-skills 模型，普通 post-task 进化默认只写 inbox。
- `agent-self-evolution` 的 canonical 写入需要显式 `--allow-canonical-write`，用于维护者合并/发布场景。
- 本库使用根目录 `evolution-inbox/` 统一收集所有自定义 skill 的协作者进化记录。
