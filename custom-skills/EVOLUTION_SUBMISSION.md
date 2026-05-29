# Evolution 记录提交说明

这份文档给协作者和 Codex agent 使用，用来把本机 self-evolution inbox 记录打包交给维护者。

目标是：只提交可合并的 skill 进化记录，不提交密钥、私有项目资料、浏览器状态或未白标化的项目细节。

## 需要提交什么

推荐提交一个小文件夹或压缩包：

```text
evolution-submission/
  contributor-info.json
  evolution-inbox/
    <machine-username>.evolution-log.jsonl
  notes.md
```

可选文件，仅在协作者有意向维护者提议中央库补丁时使用：

```text
evolution-submission/
  changed-files/
  validation-output.txt
```

普通协作者本地进化只需要提交 inbox JSONL，不需要提交已安装 skill 文件夹。

## 必需文件

### 1. contributor-info.json

创建一个 JSON 文件：

```json
{
  "contributor": "machine-username",
  "display_name": "human name or team name",
  "platform": "windows|macos|linux",
  "codex_version": "optional",
  "custom_skills_version_or_commit": "optional",
  "submitted_at": "YYYY-MM-DD"
}
```

要求：

- `contributor` 必须和 inbox 文件名里的用户名一致。
- `platform` 用 `windows`、`macos` 或 `linux`。
- `custom_skills_version_or_commit` 可填安装时使用的中央库 commit。

### 2. evolution-inbox/<machine-username>.evolution-log.jsonl

提交协作者本机 inbox 文件。

skill 运行后的预期位置是：

```text
<codex-skills-dir>/evolution-inbox/<machine-username>.evolution-log.jsonl
```

如果同一台机器上有多个本机用户名，每个 contributor 保持一个独立文件。

### 3. notes.md

写一个简短说明：

```markdown
# Evolution Submission Notes

- Contributor:
- Platform:
- Skills used:
- Tasks covered:
- Records that should be prioritized:
- Records that are project-specific and should not become shared rules:
- Known validation gaps:
- Source custom-skills commit, if known:
```

## 可选文件

### changed-files/

只有在协作者明确要提交中央 skill 库补丁时使用。

普通 collaborator-local evolution 应保留在 `evolution-inbox/`。协作者不需要编辑已安装 skill 文件来让本机受益，因为已安装 skill 会读取本机 inbox 作为 runtime overlay。

如果确实提交 `changed-files/`，保留从 `custom-skills/` 开始的相对路径，例如：

```text
changed-files/
  qa-automation-engineering/references/common-checklist.md
  qa-automation-engineering/scripts/run_post_task_evolution.py
```

不要包含无关项目文件、密钥、浏览器 profile、敏感截图、storageState、token、cookie、下载的私有数据或客户资料。

### validation-output.txt

放入支持提交的命令和输出，例如：

```text
python tools/merge_evolution_inbox.py
python <skill>/scripts/check_evolution_release_sync.py --skill-dir <skill>
```

如果无法运行验证，说明原因。

## Codex 应如何准备提交包

当用户要求 Codex 准备 evolution submission 时，Codex 应：

1. 定位已安装的 custom skills 目录。
2. 定位 `evolution-inbox/*.evolution-log.jsonl`。
3. 使用操作系统用户名识别当前 contributor。
4. 默认只复制当前 contributor 的 JSONL 文件，除非用户要求提交所有本机 contributor。
5. 创建 `contributor-info.json`。
6. 创建 `notes.md`，简要说明记录范围和已知缺口。
7. 如果本地 skill 文件有修改，询问或按任务要求决定是否放入 `changed-files/`。
8. 排除密钥、私有生产数据、浏览器状态和项目敏感资料。
9. 如果能访问 `tools/merge_evolution_inbox.py`，运行本地预检。

## 提交前检查

提交给维护者前，检查：

- inbox JSONL 文件存在且非空。
- 每一行都是合法 JSON。
- 每条记录至少包含：

  ```text
  record_id
  contributor
  skill
  skill_version
  target_artifact
  merge_status
  ```

- `contributor-info.json` 的 `contributor` 和 inbox 文件名一致。
- `notes.md` 说明这次提交包含可复用 skill 学习、项目专属学习，还是两者都有。
- 跨项目共享记录已白标化。
- 没有密钥、token、cookie、storageState、私有生产数据或敏感截图。

## 白标化要求

提交到共享 skill 库前，以下字段中不得出现具体项目名、客户名、仓库名、ticket 名、真实环境名、内部系统名或一次性模块名：

```text
source_task
summary
action
failure_mode
pattern_key
principle_key
principle
standard_area
task_type
meta_focus
category
notes.md
```

替换为可复用分类，例如：

```text
admin-route-smoke-test
credential-gated-workflow
cross-project-skill-release
test-artifact-readiness-audit
```

如果一条记录无法白标化，标注为项目专属，不要合并进共享 skill 规则。

## 交给维护者后

维护者应把收到的 inbox 文件放入：

```text
custom-skills/evolution-inbox/
```

然后运行：

```bash
python tools/merge_evolution_inbox.py
```

维护者再按：

```text
MERGE_EVOLUTION.md
```

完成去重、分组、白标化、合并和发布。
