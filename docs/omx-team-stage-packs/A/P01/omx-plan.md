# A P01 OMX Plan

席位：A

阶段：P01 - 项目脚手架、运行底座与通用合同

分支：`codex/p01-a-info-publishing-foundation`

## 什么时候可以开始

只能在 B 完成并 push `codex/p01-b-web-shell-baseline` 后开始。

开始前必须拿到：

- B 分支名。
- B commit SHA。
- B 给 A/C 的挂载点、目录约定、类型约定和验证结果。

## 目标

在不实现完整业务模块的前提下，为今日公司简报和公司公告墙准备 P01 可用的基础数据形态、mock 边界和 Web shell 接入占位。

## 执行步骤

1. `git fetch --prune`
2. 从 B 已 push 的基线创建分支：`codex/p01-a-info-publishing-foundation`
3. 读取本目录 `read-list.md` 和 `allowed-scope.md`
4. 检查 B 放行的 Web shell 挂载约定
5. 添加或校准简报/公告基础类型和 mock 边界
6. 如 B 提供挂载点，只接入轻量占位，不做完整列表/详情/管理页
7. 检查没有触碰后端、数据库、App 和 Admin 写入
8. 运行验证
9. commit 并 push
10. 按 `completion-report-template.md` 回报

## 验证要求

- `npm --prefix ProjectM-source-code/frontend run build`
- 如果只改文档或类型且 build 不可用，说明原因并运行可用的静态检查。

## Commit 要求

提交信息遵守 Lore Commit Protocol。

必须至少包含：

- `Confidence: high`
- `Scope-risk: narrow`
- `Tested: <实际运行的验证>`
- `Not-tested: <未运行项或 none>`

## Push 要求

必须 push 到远端：

`codex/p01-a-info-publishing-foundation`

没有 push 不算完成。

## 必须停止并回报的情况

- B 没有给出可用基线或挂载约定。
- 需要新增后端接口、数据库字段或模块合同。
- 需要实现完整页面或 Admin 写入。
- 发现简报/公告需求与 PRD 冲突。
