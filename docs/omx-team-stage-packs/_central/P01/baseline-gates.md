# P01 Baseline Gates

P01 需要两个串行基线。

## Gate 1：D 平台运行基线

先跑人员：D

分支：`codex/p01-d-platform-runtime-baseline`

基准：`origin/main`

完成内容：

- 确认 `ProjectM-source-code/backend` 的 Go REST API 入口、统一响应、认证会话和健康检查基线。
- 确认根目录 `docker-compose.yml` 与 `ProjectM-source-code/docker-compose.yml` 的默认端口保持一致。
- 确认 PostgreSQL 16 与 pgAdmin 默认端口：`5432` / `5050`。
- 确认 `.env.example` 只有占位值，不包含真实密钥。
- 确认 `projectm_session` 是 Web 登录会话 cookie 名称。
- 确认 `/api/v1/admin/*` 后续必须由后端 `super_user` 授权保护。

放行要求：

- 已 commit。
- 已 push 到远端。
- 回报 branch + commit SHA。
- 回报验证命令与结果。

没有 push 不算放行。

## Gate 2：B Web Shell 基线

先跑人员：B

分支：`codex/p01-b-web-shell-baseline`

基准：D 已推送的 `codex/p01-d-platform-runtime-baseline`

完成内容：

- 建立或校准 Web 员工门户 shell。
- 建立七个 MVP 模块的挂载点或占位约定。
- 建立通用 loading / empty / error / unauthorized / retry 状态组件边界。
- 建立 Admin Console 入口的前端壳层边界，但不做 Admin 写入。
- 给 A/C 明确可接入的目录、类型和 mock 边界。

放行要求：

- 已 commit。
- 已 push 到远端。
- 回报 branch + commit SHA。
- 回报从哪个 D commit 创建。
- 回报 A/C 应从哪个分支和 SHA 创建自己的分支。

没有 push 不算放行。

## Gate 3：A/C 并行

可并行人员：A、C

基准：B 已推送的 `codex/p01-b-web-shell-baseline`

A/C 不得从 `main` 直接开始。必须先 fetch B 的基线分支，再从该分支创建自己的席位分支。

## 阻塞处理

- 如果 D 发现当前工程结构和 P01 PRD 冲突且需要迁移目录，停止并回报，不要自行大迁移。
- 如果 B 发现 Web shell 需要改 API envelope 或认证合同，停止并回报给 D/合并负责人，不要静默重写后端合同。
- 如果 A/C 需要新增模块 API 或数据库字段，停止并回报；这属于 P02/P03 之后范围。
