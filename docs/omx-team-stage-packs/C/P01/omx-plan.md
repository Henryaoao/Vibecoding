# C P01 OMX Plan

席位：C

阶段：P01 - 项目脚手架、运行底座与通用合同

分支：`codex/p01-c-app-community-finance-foundation`

## 什么时候可以开始

只能在 B 完成并 push `codex/p01-b-web-shell-baseline` 后开始。

开始前必须拿到：

- B 分支名。
- B commit SHA。
- B 对 A/C 的接入约定。

## 目标

在不实现完整业务模块的前提下，为 App shell 状态边界、热帖、新人和财经轻资讯准备 P01 可用的基础字段、mock 边界和合规展示约束。

## 执行步骤

1. `git fetch --prune`
2. 从 B 已 push 的基线创建分支：`codex/p01-c-app-community-finance-foundation`
3. 读取本目录 `read-list.md` 和 `allowed-scope.md`
4. 检查现有 `mobile` Expo / React Native 结构
5. 校准 App shell 认证、权限、离线/弱网、空状态、错误和重试边界
6. 校准热帖、新人、财经基础 mock 字段和合规展示边界
7. 确认 App 不包含管理写入
8. 运行验证
9. commit 并 push
10. 按 `completion-report-template.md` 回报

## 验证要求

- `npm --prefix mobile run typecheck`
- `npm --prefix mobile test -- --runInBand`

如果依赖未安装，先使用项目现有方式安装依赖；如仍无法运行，记录原因。

## Commit 要求

提交信息遵守 Lore Commit Protocol。

必须至少包含：

- `Confidence: high`
- `Scope-risk: moderate`
- `Tested: <实际运行的验证>`
- `Not-tested: <未运行项或 none>`

## Push 要求

必须 push 到远端：

`codex/p01-c-app-community-finance-foundation`

没有 push 不算完成。

## 必须停止并回报的情况

- B 没有给出可用基线。
- 需要新增后端接口、数据库字段或模块合同。
- 需要 App 管理写入。
- 财经内容或字段无法保持非投资建议边界。
