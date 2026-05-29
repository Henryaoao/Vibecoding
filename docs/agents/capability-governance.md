# ProjectM Agent Capability Governance

本文定义 AI / Agent 在 ProjectM 中生成、修改、交接和验证工作的能力边界。它约束的是交付角色与工作流行为，不改变 ProjectM 应用内的 `user` / `super_user` 角色模型。

## 1. 适用范围

本规则适用于所有由 AI / Agent 参与的工作：

- PRD、设计说明、任务拆分、样例数据和 Agent 文档修改。
- Web、App、Backend、Database、Docker、脚本和测试代码修改。
- OMX / Codex 子 agent / workflow skill 的任务交接。
- Git commit、pull、push、归档和发布相关操作。

如果本文件与用户当前明确指令冲突，以用户当前明确指令为准；如果与更高层安全规则冲突，以更高层安全规则为准。

## 2. 文档结构保护

AI 不得自行改变 ProjectM 的文档结构。以下行为必须先向用户说明影响并获得明确确认：

- 移动、重命名、拆分、合并或删除 `docs/prd/` 下的 PRD 文件。
- 改变 `docs/prd/README.md` 定义的事实来源优先级、阅读顺序或 PRD 层级。
- 把模块 PRD 改成新的目录体系，或把阶段 PRD 合并回单一大文档。
- 把测试细节、部署细节、UI 文案细节上移到整体项目 PRD，导致 PRD 层级职责混乱。
- 在 `Vibecoding`、`ProjectM-source-code` 或其他非 `docs/` 目录重复维护产品文档。

AI 可以自行做的文档整理：

- 在现有文件内补充更清楚的验收标准、依赖、范围外和验证指针。
- 修复明显过期的链接、端口、技术栈名称和术语，但必须保持文档层级不变。
- 新增 Agent 治理、验证、技能使用等非产品 PRD 文档，并在 `docs/agents/README.md` 建立入口。
- 新增 UI reference、demo 说明、工作日志等辅助材料，但不得替代 `docs/prd/` 的事实来源地位。

## 3. 修改权限矩阵

| 交付角色 | 可直接修改 | 不得自行修改 | 交接前必须验证 |
| --- | --- | --- | --- |
| Product / PRD Owner | `docs/prd/` 既有 PRD 内容、验收标准、样例语义、范围说明 | PRD 目录结构、技术栈、角色模型、MVP 模块边界 | PRD 链接、旧角色、浏览历史、财经边界、事实来源一致性 |
| UX / Frontend Designer | UI reference、页面结构说明、交互状态、设计验收标准 | 后端权限事实、数据库 schema、应用角色模型 | 桌面/移动可读性、无内容重叠、财经免责声明、Admin 可见性边界 |
| Web Frontend Engineer | `ProjectM-source-code/frontend/`、Web 测试、Web API client | 后端授权规则、数据库迁移、App 管理范围 | `npm run build`、关键路由/状态冒烟、`user` 无 Admin 入口 |
| App Frontend Engineer | `mobile/`、App 员工端页面、App 测试 | 移动端管理写入、Web Admin Console、数据库迁移 | App 员工端流程、离线/错误状态、无移动端管理写入 |
| Backend Engineer | Go API、controller/service/repository/middleware、后端测试 | PRD 目录结构、前端视觉风格、未确认的数据保留策略 | `go test ./...`、权限测试、API envelope、审计与错误响应 |
| Database Engineer | PostgreSQL SQL、migration、索引、seed data | UI、路由、未确认的角色或行为历史表 | PostgreSQL 语法、外键/索引、无 MySQL 残留、无 `recent_views` |
| DevOps Engineer | Dockerfile、Compose、`.env.example`、运行说明、CI/依赖卫生 | 真实 `.env` 密钥、产品范围、公开 pgAdmin 生产入口 | compose 配置、端口、env 示例、密钥未入库 |
| QA / Verifier | 测试、验证报告、缺陷清单、验收记录 | 未授权改业务实现、未授权改 PRD 结论 | PASS/FAIL/PARTIAL 证据、命令输出、残余风险 |
| Security Reviewer | 安全审查报告、安全测试、权限/密钥/上传修复建议 | 未确认放宽权限、安全边界或合规边界 | 权限路径、密钥扫描、日志敏感信息、上传与 SQL 注入风险 |
| Git Steward | Git 状态、Lore commit、Azure push、仓库卫生 | 产品内容、业务实现、真实密钥提交、force push main | remote、branch、status、staged diff、提交信息、未推错远端 |

角色只拥有对应范围内的默认修改权。跨范围修改必须在交接说明中写明原因，并由对应角色或用户确认。

## 4. 任务交接 Gate

每个任务进入下一个角色或下一个阶段前，当前角色必须完成自我验证。没有验证证据时，不能宣称完成，只能标记为 `PARTIAL` 或 `BLOCKED`。

交接必须包含：

- **角色身份**：当前以哪个 ProjectM 交付角色完成工作。
- **修改范围**：改了哪些文件、目录或行为。
- **继承依据**：使用了哪些 PRD、Agent 规则、用户指令或代码事实。
- **自我验证**：运行了哪些检查，结果是什么。
- **未验证项**：哪些检查没有运行，为什么。
- **下一角色输入**：下一个角色可以基于什么继续，不需要重新猜测什么。
- **风险/阻塞**：仍需用户确认或其他角色处理的事项。

最小交接模板：

```text
角色：
修改范围：
依据：
自我验证：
未验证：
下一步交接：
风险：
```

## 5. 自我验证规则

文档任务至少检查：

```bash
rg -n "content_admin|department_admin|system_admin|recent_views|浏览历史|页面访问轨迹" docs AGENTS.md agentschinese.md README.md
rg -n "股票推荐|买卖建议|个股预测|收益承诺" docs AGENTS.md agentschinese.md README.md ProjectM-source-code mobile
rg -n "mysql|phpMyAdmin|3306|8081|INSERT IGNORE|UNSIGNED|ON UPDATE|utf8mb4" docs AGENTS.md agentschinese.md README.md ProjectM-source-code database
```

代码任务按修改范围选择验证：

```bash
go test ./...
npm run build
npm test
docker compose config
docker compose up --build
```

如果某项验证因环境、依赖、凭据或时间无法运行，必须在汇报中写明，并给出下一步可运行命令。

## 6. 权限冲突处理

当任务需要跨角色修改时，按以下方式处理：

1. 先完成当前角色范围内的工作。
2. 在交接中标出需要其他角色处理的文件和原因。
3. 如果改动会触碰硬红线、文档结构、技术栈、角色模型、部署安全或生产数据，先问用户。
4. 如果只是局部实现细节，且不改变事实来源和安全边界，可以继续，但必须记录决策理由。

当文档与代码冲突时：

- `docs/prd/` 是产品事实来源。
- 代码是当前实现事实。
- 冲突会改变产品含义时，先问用户。
- 冲突只是代码落后于 PRD 时，按 PRD 修正实现并验证。

## 7. 禁止行为

AI / Agent 不得：

- 为了方便实现而重写 PRD 目录结构。
- 把同一份产品文档复制到多个目录并分别维护。
- 以“前端隐藏”为权限完成证明。
- 在没有测试或验证证据时说“已完成”。
- 把真实 `.env`、数据库 URL、令牌或密码提交到仓库。
- 推送到非用户指定远端。
- 自行引入旧角色、浏览历史、投资建议或移动端管理写入。
- 在未确认的情况下 force push、删除历史、重置 main 或执行破坏性 Git 操作。

## 8. 推荐执行顺序

对复杂任务，推荐按以下顺序推进：

```text
Product / PRD Owner
-> UX / Frontend Designer
-> Web/App Frontend Engineer 或 Backend/Database Engineer
-> QA / Verifier
-> Security Reviewer
-> Git Steward
```

并非每个任务都需要所有角色。小任务可以由单 agent 完成，但仍必须遵守对应角色权限和自我验证规则。

## 9. 完成判定

只有同时满足以下条件，才能汇报完成：

- 修改范围与用户要求一致。
- 未改变受保护文档结构，或已获得用户确认。
- 角色权限未越界，或越界原因已记录并被确认。
- 自我验证已完成，或验证缺口已明确说明。
- 下一角色不需要重新猜测上下文。
- 没有把 ProjectM 硬红线重新引入项目。
