# D P01 OMX Plan

席位：D

阶段：P01 - 项目脚手架、运行底座与通用合同

分支：`codex/p01-d-platform-runtime-baseline`

## 什么时候可以开始

D 是 P01 第一个必须单独跑的前置基线。可以立即从 `origin/main` 开始。

## 目标

建立或校准 P01 的平台运行基线，给 B 提供可引用、可验证、已推送的后端和运行合同基础。

## 执行步骤

1. `git fetch --prune`
2. 从 `origin/main` 创建分支：`codex/p01-d-platform-runtime-baseline`
3. 读取本目录 `read-list.md` 和 `allowed-scope.md`
4. 检查当前根目录与 `ProjectM-source-code/` 的运行入口
5. 校准 Go 后端骨架、API envelope、认证会话、健康检查和错误结构
6. 校准 Docker Compose、PostgreSQL 16、pgAdmin、默认端口和环境变量样例
7. 确认 `.env.example` 只有占位值
8. 运行验证
9. commit 并 push
10. 按 `completion-report-template.md` 回报，并明确 B 可以开始

## 验证要求

- `docker compose config --services`
- `docker compose --profile local-db config --services`
- `cd ProjectM-source-code/backend && go test ./...`

如果 `DATABASE_URL` 或真实凭据缺失导致运行服务不可启动，只做 config/test 范围验证并记录原因；不得把真实凭据写入仓库。

## Commit 要求

提交信息遵守 Lore Commit Protocol。

必须至少包含：

- `Confidence: high`
- `Scope-risk: moderate`
- `Tested: <实际运行的验证>`
- `Not-tested: <未运行项或 none>`

## Push 要求

必须 push 到远端：

`codex/p01-d-platform-runtime-baseline`

没有 push 不算放行，B 不能开始。

## 必须停止并回报的情况

- 需要迁移现有工程结构。
- 需要改变 Web/App/Go/PostgreSQL 技术栈。
- 需要改变默认端口。
- 需要引入真实密钥或真实生产配置。
- 需要做完整业务模块 API。
