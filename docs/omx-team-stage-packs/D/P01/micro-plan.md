# D P01 Micro-plan

席位：D
阶段：P01 - 项目脚手架、运行底座与通用合同

## 目标

只在 D 允许范围内确认平台运行基线已经可供 B 引用：Go 后端骨架、API envelope、`projectm_session` 会话边界、Docker Compose、本地 PostgreSQL / pgAdmin、环境变量占位值和健康检查。

## 微步骤

1. 读取 `allowed-scope.md`、`read-list.md`、`omx-plan.md` 与当前运行入口，避免触碰 Web/App shell 或完整业务模块 API。
2. 校验后端现有路由、API envelope、错误结构、`projectm_session` cookie 读取/签发边界和健康检查。
3. 确认 Docker Compose 默认端口维持 `3000` / `8080` / `5432` / `5050`，本地数据库使用 PostgreSQL 16，pgAdmin 仅在 `local-db` profile 下启动。
4. 确认环境变量样例仅保留占位值，不提交真实 `.env`、Teams / Entra 凭据或生产密钥。
5. 为 `/api/v1/admin/*` 记录后续后端授权合同：所有 Admin 命名空间必须由后端校验 `super_user`，不得只依赖前端隐藏入口。
6. 运行 D 要求的验证：
   - `docker compose -f ProjectM-source-code/docker-compose.yml --env-file .env.example config --services`
   - `docker compose -f ProjectM-source-code/docker-compose.yml --env-file .env.example --profile local-db config --services`
   - `cd ProjectM-source-code/backend && go test ./...`
7. 提交变更，提交信息遵守 Lore Commit Protocol。
8. 按 `completion-report-template.md` 向 leader 回报，并明确 B 可以从 D 分支与 commit 开始。

## 明确边界

- 不做完整业务模块 API。
- 不做 Admin 写入业务。
- 不改 Web shell 或 App shell。
- 不改变默认端口。
- 不引入 `user`、`super_user` 之外的第三种角色。
- 不实现浏览历史、recent views 或访问轨迹。
- 不提交真实 `.env`、Teams / Entra 凭据或生产密钥。
