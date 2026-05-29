# P01 How To Run

这些阶段包默认给四个人在真实 OMX 终端环境里执行。

## 运行方式

每个人进入项目目录：

```powershell
cd C:\Project-M
```

然后打开自己席位下的 `omx-team-command.txt`，把文件里的全部内容复制到 PowerShell / OMX CLI 终端里运行。

## 不要额外加 `$team`

`omx-team-command.txt` 里面已经包含真实 runtime 启动命令：

```powershell
omx team N:executor $task
```

不要在前面再加 `$team`。`$team` 是聊天提示里的 workflow 触发写法；如果粘到 Codex App 或普通聊天框，可能只会触发状态，不会启动真实 tmux team runtime。

## P01 执行顺序

1. D 先运行 `D\P01\omx-team-command.txt`。
2. D 完成 commit + push，并回报 branch + commit SHA。
3. B 从 D 推送基线开始，运行 `B\P01\omx-team-command.txt`。
4. B 完成 commit + push，并回报 branch + commit SHA。
5. A/C 从 B 推送基线开始，并行运行各自 `omx-team-command.txt`。
