# D P01 Allowed Scope

席位：D - Go 后端骨架、API envelope、配置、Docker Compose、PostgreSQL、pgAdmin、健康检查

## 可以修改

从 `origin/main` 开始。

优先限制在以下范围：

- `docker-compose.yml`
- `.env.example`
- `docker.env.example`
- `ProjectM-source-code/README.md`
- `ProjectM-source-code/docker-compose.yml`
- `ProjectM-source-code/backend/`
- `database/init/`
- `database/migrations/`
- 运行底座需要的轻量说明文档

## 允许内容

- 后端健康检查或基础路由校准。
- API envelope / error shape 的基础实现或校准。
- 认证会话 cookie `projectm_session` 的基础读取/签发边界。
- Docker Compose 默认端口校准。
- PostgreSQL 16 / pgAdmin 基线校准。
- 环境变量样例占位值校准。

## 禁止修改

- 不做完整模块后端 API。
- 不做 Admin 写入业务。
- 不改 Web shell。
- 不改 App shell。
- 不提交真实 `.env` 或真实 Teams / Entra 凭据。
- 不改变默认端口。
- 不引入第三种角色。
- 不实现浏览历史、最近浏览、访问轨迹。

## 冲突处理

如果需要迁移现有工程结构或改变 accepted 技术栈，停止并回报，不要自行大迁移。
