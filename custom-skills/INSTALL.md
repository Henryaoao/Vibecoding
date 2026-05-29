# 自定义 Skills 安装说明

这份文档给协作者和 Codex agent 使用，用来把 `custom-skills/` 里的 ProjectM 核心自定义 skill 安装到本机 Codex skill 目录。

当前可安装的 skill 包括：

- `qa-automation-engineering`
- `adaptive-audit`
- `agent-self-evolution`
- ProjectM portable skill mirror 不在本目录，已移动到 `../custom-skill-dev-package/skills/`。

根目录里的 `README.md`、`CUSTOM_SKILL_STANDARD.md`、`EVOLUTION_SUBMISSION.md`、`MERGE_EVOLUTION.md`、`evolution-inbox/`、`tools/` 是说明或治理资源，不是 Codex skill。

## Codex 能不能直接读取项目文件夹里的 Skill

通常不能自动触发。

Codex 通常从配置的 Codex home skill 目录自动发现 skill：

```text
$CODEX_HOME/skills
```

如果没有设置 `CODEX_HOME`，使用当前用户默认目录：

```text
~/.codex/skills
```

只放在项目文件夹里的 skill，可以在用户或 agent 明确给出路径时被读取，但不会像已安装 skill 一样稳定自动触发。因此协作者要长期使用这些 skill，应复制或链接到 Codex skill 目录。

## 安装原则

只安装直接包含 `SKILL.md` 的子文件夹。

安装：

```text
qa-automation-engineering/
adaptive-audit/
agent-self-evolution/
```

不要安装：

```text
evolution-inbox/
tools/
```

如果目标目录已有同名 skill，用本库中的最新版替换目标 skill 文件夹。这样可以让协作者跟随中央版本同步。

不要删除目标 skill 目录旁边的本机 inbox：

```text
<target-skill-dir>/evolution-inbox/
```

这个 inbox 不是 skill 文件夹。它保存协作者本机尚未合并的进化记录，只有在维护者确认对应记录已经合并或可以归档后，才应清理。

## 跨平台安装步骤

1. 解析目标 skill 目录。

   优先使用：

   ```text
   $CODEX_HOME/skills
   ```

   如果没有设置 `CODEX_HOME`，使用：

   ```text
   macOS/Linux: ~/.codex/skills
   Windows: %USERPROFILE%\.codex\skills
   ```

2. 如果目标 skill 目录不存在，先创建它。

3. 如果本机 evolution inbox 不存在，创建：

   ```text
   <target-skill-dir>/evolution-inbox/
   ```

4. 从这个 `custom-skills/` 文件夹中找到直接包含 `SKILL.md` 的核心自定义 skill 子目录。

5. 对每个 skill：

   - 如果目标目录已有同名 skill，只删除这个同名 skill 文件夹。
   - 复制本库中的完整 skill 文件夹到目标目录。
   - 输出 `installed` 或 `replaced`。

6. 验证这些文件存在：

   ```text
   <target-skill-dir>/qa-automation-engineering/SKILL.md
   <target-skill-dir>/adaptive-audit/SKILL.md
   <target-skill-dir>/agent-self-evolution/SKILL.md
   <target-skill-dir>/evolution-inbox/
   ```

7. 重启 Codex，或开启新的 Codex session，让 skill discovery 重新加载。

## macOS/Linux 示例

```bash
CUSTOM_SKILLS_DIR="/path/to/custom-skills"
CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"

mkdir -p "$CODEX_SKILLS_DIR"
mkdir -p "$CODEX_SKILLS_DIR/evolution-inbox"

for skill in "$CUSTOM_SKILLS_DIR"/*; do
  [ -d "$skill" ] || continue
  [ -f "$skill/SKILL.md" ] || continue
  name="$(basename "$skill")"
  dest="$CODEX_SKILLS_DIR/$name"
  if [ -e "$dest" ]; then
    rm -rf "$dest"
    echo "[replace] $name at $dest"
  else
    echo "[install] $name -> $dest"
  fi
  cp -R "$skill" "$dest"
done
```

## Windows PowerShell 示例

```powershell
$CustomSkillsDir = "C:\Path\To\custom-skills"
$CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$CodexSkillsDir = Join-Path $CodexHome "skills"

New-Item -ItemType Directory -Force -Path $CodexSkillsDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $CodexSkillsDir "evolution-inbox") | Out-Null

Get-ChildItem -LiteralPath $CustomSkillsDir -Directory | ForEach-Object {
    $skillFile = Join-Path $_.FullName "SKILL.md"
    if (-not (Test-Path -LiteralPath $skillFile)) {
        return
    }

    $dest = Join-Path $CodexSkillsDir $_.Name
    if (Test-Path -LiteralPath $dest) {
        Remove-Item -LiteralPath $dest -Recurse -Force
        Write-Host "[replace] $($_.Name) at $dest"
    } else {
        Write-Host "[install] $($_.Name) -> $dest"
    }
    Copy-Item -LiteralPath $_.FullName -Destination $dest -Recurse
}
```

## 安装后验证

安装后，开启新的 Codex session，然后确认能看到或使用这些 skill。

可以尝试：

```text
Use $qa-automation-engineering to ...
Use $adaptive-audit to ...
Use $agent-self-evolution to ...
```

如果 Codex 找不到 skill，检查：

- skill 文件夹是否直接位于目标 `skills` 目录下。
- skill 文件夹根目录是否包含 `SKILL.md`。
- `SKILL.md` frontmatter 是否包含 `name` 和 `description`。
- 是否已经重启 Codex 或开启新的 session。
- 是否把 `evolution-inbox/`、`tools/` 误当作 skill 安装。

## 自我进化依赖

声称自我进化的 custom skill 应把 `agent-self-evolution` 作为 sibling skill：

```text
<skills-dir>/<self-evolving-skill>
<skills-dir>/agent-self-evolution
```

安装时应把 `agent-self-evolution` 和其他 self-evolving skill 放在同一层。如果只安装业务 skill，不安装 `agent-self-evolution`，post-task evolution 可能无法完整运行。

## 本机 Evolution Inbox

self-evolving skill 运行时，应先读取已安装 skill 文件和随包发布的 canonical evolution 历史，然后读取本机未合并 inbox：

```text
<skills-dir>/evolution-inbox/<machine-username>.evolution-log.jsonl
```

如果本机 inbox 文件为空或不存在，skill 只使用已安装的中央版本。

self-evolving skill 的 post-task wrapper 应把新的协作者进化记录追加到同一个 inbox 文件。`contributor` 默认使用本机操作系统用户名。

协作者普通运行不得直接写入 skill 本体的 canonical 文件：

```text
references/evolution-log.jsonl
references/evolution-memory.md
```

这些 canonical 文件只由维护者在中央合并和发布时更新。

## 同步中央版本后如何处理 Inbox

维护者合并并发布某些 inbox 记录后，协作者应重新安装最新中央 skill 库。因为安装会替换同名 skill 文件夹，本机 skill 会同步到中央版本。

然后，协作者只清理或归档维护者确认已经合并的本机 inbox 记录。未合并记录继续保留在：

```text
<skills-dir>/evolution-inbox/
```

这样安装后的 skill 仍能把未合并记录作为本机 runtime overlay 使用。

## 给 Codex Agent 的安装任务口径

当用户让 Codex 安装本库 skill 时，Codex 应：

1. 定位 `custom-skills/` 源目录。
2. 定位目标 Codex skill 目录。
3. 创建目标 skill 目录和 sibling `evolution-inbox/`。
4. 找出所有直接包含 `SKILL.md` 的子文件夹。
5. 用本库版本替换目标目录中的同名 skill。
6. 不删除目标目录里的 `evolution-inbox/`。
7. 验证三个 `SKILL.md` 和 inbox 目录存在。
8. 提醒用户开启新 session 让 Codex 重新加载 skill。

## 后续提交与合并

协作者如果需要把本机进化记录交给维护者，按：

```text
EVOLUTION_SUBMISSION.md
```

维护者合并记录时，按：

```text
MERGE_EVOLUTION.md
```
