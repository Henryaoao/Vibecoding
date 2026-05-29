# B P01 OMX Plan

席位：B

阶段：P01 - 项目脚手架、运行底座与通用合同

分支：`codex/p01-b-web-shell-baseline`

## 什么时候可以开始

只能在 D 完成并 push `codex/p01-d-platform-runtime-baseline` 后开始。

开始前必须拿到：

- D 分支名。
- D commit SHA。
- D 验证结果。

## 目标

建立 P01 Web shell 基线，让 A/C 可以从同一个 Web 挂载合同上并行接入各自基础边界。

## 执行步骤

1. `git fetch --prune`
2. 从 D 已 push 的基线创建分支：`codex/p01-b-web-shell-baseline`
3. 读取本目录 `read-list.md` 和 `allowed-scope.md`
4. 检查现有 `ProjectM-source-code/frontend` 结构
5. 建立或校准员工门户 shell、模块挂载点和状态组件
6. 保留 Admin Console 壳层边界，不做写入能力
7. 明确 A/C 可接入目录、类型和 mock 约定
8. 运行验证
9. commit 并 push
10. 按 `completion-report-template.md` 回报并明确 A/C 可以开始

## 验证要求

- `npm --prefix ProjectM-source-code/frontend run build`

## Commit 要求

提交信息遵守 Lore Commit Protocol。

必须至少包含：

- `Confidence: high`
- `Scope-risk: moderate`
- `Tested: <实际运行的验证>`
- `Not-tested: <未运行项或 none>`

## Push 要求

必须 push 到远端：

`codex/p01-b-web-shell-baseline`

没有 push 不算放行。

## 必须停止并回报的情况

- D 基线没有 push 或无法 checkout。
- 需要改变后端 API envelope、cookie 名称或权限合同。
- 需要实现完整业务模块。
- 需要写 Admin 管理能力。
