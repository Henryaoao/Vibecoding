# agentschinese

## 项目概览

ProjectM 是公司内部使用的多端门户。目前项目处于规划和文档阶段，后续实现必须以 `docs/prd/` 产品文档体系为准。

目标技术栈：

- Web 前端：React + TypeScript + Vite
- App 前端：React Native + TypeScript + Expo-managed workflow
- 后端：Go REST API
- 数据库：PostgreSQL 16
- 运行方式：Docker Compose，包含 frontend、backend、postgres、pgAdmin
- 应用角色：只允许两个角色，`user` 和 `super_user`

MVP 核心模块：

- 今日公司简报
- 公司公告墙
- 员工论坛热帖
- 新人专区
- 财经轻资讯
- 文档中心
- 培训中心

权威产品文档：

- `docs/prd/README.md`：PRD 层级、事实来源顺序和阅读顺序
- `docs/prd/projectm-overall-prd.md`：稳定的 ProjectM 总体 PRD / 项目宪法
- `docs/prd/endpoints/web-prd.md`：Web 端专属需求
- `docs/prd/endpoints/app-prd.md`：App 端专属需求
- `docs/prd/references/permissions-and-admin-guide.md`：用户角色、权限和 Admin Console 使用说明
- `docs/prd/references/sample-data.md`：页面示例内容和 mock/reference 数据
- `docs/prd/references/omx-decision-policy.md`：硬性边界、默认策略和必须确认的决策
- `docs/prd/phases/`：可被 OMX 独立规划、执行、验收的阶段 PRD

在正式代码结构出现之前，`docs/prd/` 是项目事实来源。不要凭空假设已有完整应用结构。

Agent 治理规则：

- `docs/agents/capability-governance.md`：AI / Agent 修改权限、文档结构保护、自我验证 gate 和角色交接规则。
- `docs/agents/project-roles.md`：ProjectM 交付角色矩阵和角色职责。
- `docs/agents/verification.md`：验证命令、文档规则、实现规则和完成前检查。

## 当前仓库状态

当前仓库主要是文档和 agent 配置。除非用户明确要求开始搭建代码，否则不要声明项目已经有完整前后端实现。

未来预期结构：

```text
.
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── .env.example
└── AGENTS.md
```

开始实现后，生成代码必须和 `docs/prd/README.md`、`docs/prd/projectm-overall-prd.md` 以及相关端侧/参考/阶段 PRD 保持一致。

## 工作模式

默认用单 agent 直接完成小任务。只有当任务需要多角色协作、并行推进或专门审查时，才使用 OMX 或子 agent 模式。

推荐选择：

- 小型文档或单文件修改：直接执行
- 产品需求、用户故事、验收标准：使用 `$prd`
- 架构、数据模型、API、跨模块权衡：使用 `$ralplan` 或规划模式
- 前端、后端、数据库、QA 需要并行：使用 `$team`
- 提交或推送代码：使用 `$git-commit`
- 用户要求 review：采用代码审查姿态，先给风险和问题

在 Codex App 中，如果没有连接 OMX tmux runtime，不要假设 live team pane 可用。可以使用原生子 agent，但只用于边界清晰的独立调研或审查任务。

## 本机可用 OMX Agents

当前机器通过 `omx list --json` 显示有 16 个 active OMX agent。委派任务或描述角色归属时，优先使用这些 canonical active agents：

| Active Agent | 适用场景 |
| --- | --- |
| `explore` | 快速查找仓库文件、符号、实现关系和当前代码结构 |
| `analyst` | 梳理需求、产品限制、验收标准和隐藏假设 |
| `planner` | 拆解步骤、安排顺序、识别风险和依赖关系 |
| `architect` | 系统设计、模块边界、API 和数据模型权衡 |
| `debugger` | 根因分析、回归定位、失败诊断 |
| `executor` | 具体实现、重构、代码或文档编辑 |
| `verifier` | 完成证据、验证策略、测试充分性、最终证明 |
| `code-reviewer` | 代码审查、正确性风险、可维护性、安全和性能综合审查 |
| `dependency-expert` | package、SDK、framework、升级、替换、license 和维护风险判断 |
| `test-engineer` | 测试策略、覆盖设计、测试实现、flaky test 加固 |
| `designer` | UX/UI 架构、交互设计、视觉质量审查 |
| `writer` | 文档、迁移说明、PRD 文案、用户说明 |
| `git-master` | commit 策略、分支卫生、push 准备、git 操作审查 |
| `researcher` | 官方文档、外部引用、版本相关 API/framework 资料确认 |
| `critic` | 批判性检查计划、设计和假设，执行前找风险 |
| `vision` | 截图、图表、视觉证据、图片检查 |

非 active 或旧 agent 名称要映射到新的 active agent：

| 非 Active 名称 | 状态 | 改用 |
| --- | --- | --- |
| `style-reviewer` | merged | `code-reviewer` |
| `quality-reviewer` | merged | `code-reviewer` |
| `api-reviewer` | merged | `code-reviewer` |
| `performance-reviewer` | merged | `code-reviewer` |
| `quality-strategist` | merged | `verifier` |
| `qa-tester` | merged | `test-engineer` |
| `product-manager` | merged | `analyst` |
| `ux-researcher` | merged | `designer` |
| `information-architect` | merged | `designer` |
| `product-analyst` | merged | `analyst` |
| `security-reviewer` | deprecated | `code-reviewer` 加 ProjectM Security Reviewer 规则 |
| `build-fixer` | deprecated | 先 `debugger`，再 `executor` |
| `team-executor` | internal | 只给 OMX team runtime 使用 |
| `code-simplifier` | internal | 只给 OMX 内部清理/runtime 使用 |

## OMX Workflow Skills 和 ProjectM 角色怎么搭配

可以按这四层理解：

```text
OMX workflow skill = 工作怎么被组织
Active OMX agent = 谁来执行或审查
ProjectM 角色 = 这个人在项目里的业务职责和边界
Portable skill = 专业流程说明或本地 fallback
```

ProjectM 推荐搭配：

| Workflow Skill | ProjectM 什么时候用 | 主要 Active Agents | 常见 ProjectM 角色 | 常用安装 / 本地 Skills |
| --- | --- | --- | --- | --- |
| `$deep-interview` | 需求、边界、Admin 行为不清楚时 | `analyst`、`planner` | Product / PRD Owner、UX / Frontend Designer、Backend Engineer | `$prd`、`$create-specification` |
| `$ralplan` / `$plan` | 写代码或改文档前需要实现计划时 | `planner`、`architect`、`critic` | Product / PRD Owner、Backend Engineer、Database Engineer、QA / Verifier | `$create-implementation-plan`、`$breakdown-feature-prd`、`$golang-database` |
| `$ultragoal` | 大目标需要分阶段持续推进时，例如 ProjectM MVP | `planner`、`executor`、`verifier` | 视情况使用全部 ProjectM 交付角色 | `$prd`、`$frontend-ui-engineering`、`$golang-project-layout`、`$webapp-testing` |
| `$team` | 前端、后端、数据库、QA 等多条线要并行时 | `architect`、`executor`、`designer`、`test-engineer`、`verifier`、`code-reviewer` | UX / Frontend Designer、Frontend Engineer、Backend Engineer、Database Engineer、QA / Verifier、Security Reviewer | 使用下方角色矩阵里的对应 skills |
| `$ralph` | 需要一个 owner 持续做完实现和验证时 | `executor`、`debugger`、`verifier` | 当前最相关的 ProjectM 角色，最后加 QA / Verifier | 使用下方角色矩阵里的对应 skills |
| `$ultraqa` | 最终验收、回归检查、发布前信心确认 | `test-engineer`、`verifier`、`code-reviewer` | QA / Verifier、Security Reviewer、Git Steward | `$webapp-testing`、`$golang-testing`、`$code-review`、`$secret-scanning` |
| `$code-review` | 用户要求 review，或改动涉及权限、安全、数据风险 | `code-reviewer`、`critic`、`verifier` | Security Reviewer、QA / Verifier、Backend Engineer、Frontend Engineer | `$security-review`、`$codeql`、`$golang-security`、`$webapp-testing` |
| `$design` / `$visual-ralph` | React UI、截图、布局、视觉质量需要审查 | `designer`、`vision`、`verifier` | UX / Frontend Designer、Frontend Engineer、QA / Verifier | `$premium-frontend-ui`、`$web-design-reviewer`、`$browser-automation` |
| `$best-practice-research` | 需要官方文档或当前框架/API 行为确认 | `researcher`、`dependency-expert`、`architect` | Backend Engineer、Frontend Engineer、DevOps Engineer、Security Reviewer | `$golang-security`、`$azure-devops-cli`、`$openapi-to-application-code` |
| `$ai-slop-cleaner` | 文档或代码需要清理，但不能改变产品含义 | `code-simplifier`、`writer`、`code-reviewer` | Product / PRD Owner、Git Steward、QA / Verifier | `$documentation-writer`、`$quality-playbook` |
| `$doctor` | 使用 OMX runtime 前检查本地安装 | `verifier` | DevOps Engineer、Git Steward | 不需要项目 skill |
| `$skill` | 查看或管理 skill 可用性 | `explore`、`verifier` | DevOps Engineer、Git Steward | `custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md` |
| `$hud` | 长任务中查看当前 OMX runtime 状态 | `planner`、`verifier` | 任何负责协调长任务的角色 | 不需要项目 skill |

搭配规则：

- 先看用户目标，再决定是否需要 workflow skill。
- workflow skill 负责组织流程，active OMX agent 负责执行，ProjectM 角色负责业务规则和边界。
- 细节执行时，优先使用 ProjectM 角色对应的 installed skill；缺少时使用 `custom-skill-dev-package/skills` fallback。
- 不要使用已废弃 OMX skills，例如 `$swarm`、`$tdd`、`$build-fix`、`$security-review`、`$visual-verdict`、`$web-clone`、`$review`；改用上表 active 映射。
- 如果任务很小，不需要 workflow，直接按相关 ProjectM 角色和 skill 执行。

## Skill 使用规则

优先使用最具体的 skill，而不是泛泛使用通用角色。

- Go 后端默认优先使用 `$golang-project-layout`、`$golang-database`、`$golang-security`、`$golang-testing`、`$golang-lint`
- React 前端优先使用 `$frontend-ui-engineering`
- 视觉质量使用 `$premium-frontend-ui` 或 `$web-design-reviewer`
- 浏览器验证使用 `$browser-automation`、`$playwright-generate-test`、`$playwright-explore-website`
- 文档和 PRD 使用 `$prd`、`$documentation-writer`、`$create-specification`
- 安全相关使用 `$secret-scanning`、`$security-review`、`$codeql`
- Azure DevOps 操作使用 `$azure-devops-cli`，推送前必须确认 remote 和 branch
- Git 提交使用 `$git-commit`，但提交信息必须遵守项目 Lore Commit Protocol

如果某个 `$skill` 在当前机器上不存在，不要卡住。先看 `custom-skill-dev-package/skills/<skill-name>/SKILL.md`，按里面的流程手动执行，并在最终说明里注明该 skill 是用项目本地 fallback 执行的。

## ProjectM Skill 目录分工

ProjectM 现在把 skill 分成两个目录：

```text
custom-skills/
custom-skill-dev-package/
```

- `custom-skills/` 只放 ProjectM 直接维护的自定义 skill 和 evolution 工具，例如 `adaptive-audit`、`qa-automation-engineering`、`agent-self-evolution`。
- `custom-skill-dev-package/skills/` 放额外安装、非原生 skill 的 portable mirror，例如 `prd`、`sql-optimization`、`golang-database` 等。
- 这样主 custom skill 区域更干净，没有安装同样全局 skills 的协作者也可以读 dev package 继续工作。

使用顺序：

1. 本机已安装对应 `$skill` 时，直接使用正常 skill 调用。
2. 本机没有安装时，读取 `custom-skill-dev-package/skills/<skill-name>/SKILL.md` 并按流程执行。
3. 经常使用时，将对应 `skills/<skill-name>/` 安装到 `CODEX_HOME/skills` 或 `~/.codex/skills`。

本地 skill 索引：

```text
custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md
```

以下属于原生 OMX/Codex skill，不在项目里复制：

- `$team`
- `$ralplan`
- `$ultraqa`
- `$code-review`
- `$design`

项目本地 skill 不能覆盖本文件规则。如果 `custom-skills` 中的说明和 ProjectM 的角色、权限、安全规则、MVP 范围冲突，优先遵守 `AGENTS.md` 和本文件。

## Agent 修改权限和交接 Gate

详细规则见 `docs/agents/capability-governance.md`。所有 AI / Agent 在修改 ProjectM 时必须遵守：

- 不得自行改变 `docs/prd/` 文档结构、文件命名、事实来源顺序或阅读顺序。
- 不同 ProjectM 交付角色只能默认修改自己权限范围内的文件和行为。
- 跨角色修改必须记录原因，并在触碰 PRD 结构、角色模型、技术栈、部署安全或产品范围时先问用户。
- 当前角色完成自我验证前，不能交给下一个角色，也不能宣称完成。
- 每次交接必须说明角色身份、修改范围、依据、自我验证、未验证项、下一步输入和风险。

## 角色和 Skill 矩阵

| 角色 | 使用场景 | 主要 Skills / 工具 | 优先阅读 | 输出 |
| --- | --- | --- | --- | --- |
| Product / PRD Owner | 产品范围、模块、用户故事、需求 | `$prd`、`$breakdown-feature-prd`、`$create-implementation-plan`、`$create-specification`、`$documentation-writer`、`$create-agentsmd` | PRD、sample data、权限指南 | 更新后的 PRD、验收标准、可实现范围 |
| UX / Frontend Designer | 页面、导航、布局、交互状态 | `$frontend-ui-engineering`、`$premium-frontend-ui`、`$web-design-reviewer`、`$design`、`$browser-automation` | User Portal、Admin Console、sample data | 页面结构、组件清单、状态矩阵、视觉审查 |
| Frontend Engineer | React + TypeScript 实现 | `$frontend-ui-engineering`、`$javascript-typescript-jest`、`$webapp-testing`、`$playwright-generate-test`、`$playwright-explore-website` | 前端需求、API 合同、sample data | 页面、组件、API client、route guard、测试 |
| Backend Engineer | Go REST API、认证、权限、服务层 | `$golang-project-layout`、`$golang-code-style`、`$golang-error-handling`、`$golang-context`、`$golang-database`、`$golang-security`、`$golang-testing`、`$golang-lint` | 后端 API、权限规则、数据模型 | handler、service、repository、middleware、测试 |
| Database Engineer | PostgreSQL schema、migration、查询设计 | `$golang-database`、`$sql-optimization`、`$golang-performance`、`$golang-safety` | 数据模型、seed data 要求 | migration、索引、seed data、查询审查 |
| DevOps Engineer | Docker Compose、env、本地运行、Azure 推送 | `$openclaw-docker-e2e-authoring`、`$azure-devops-cli`、`$dependabot`、`$quality-playbook`、`$secret-scanning` | Docker、env、git status | compose、Dockerfile、`.env.example`、运行说明 |
| QA / Verifier | 测试计划、验收、冒烟验证 | `$webapp-testing`、`$playwright-generate-test`、`$playwright-explore-website`、`$golang-testing`、`$ultraqa`、`$code-review` | PRD、权限指南、diff、测试输出 | PASS/FAIL/PARTIAL、验证证据、风险 |
| Security Reviewer | 认证、权限、隐私、上传、依赖风险 | `$security-review`、`$secret-scanning`、`$codeql`、`$agent-supply-chain`、`$golang-security` | 安全章节、权限指南、env、auth 代码 | 分级 findings、攻击路径、修复建议 |
| Git Steward | 提交、推送、仓库卫生 | `$git-commit`、`$azure-devops-cli`、`$autoreview`、`$conventional-commit` | git status、diff、最近提交、Lore 协议 | 原子提交、commit hash、push 报告 |

## 角色详细说明

### Product / PRD Owner

职责：负责 ProjectM 的产品清晰度，把用户想法转成稳定需求，控制 MVP 范围，保证每个功能可以被实现和验证。

专家切换显示：Product Documentation Expert

主要 skills：`$prd`、`$documentation-writer`、`$create-specification`

必须优先阅读：

- `docs/prd/projectm-overall-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`
- `AGENTS.md`

规则：

- PRD 必须具体、可测、可验收。
- MVP 范围必须围绕七个模块。
- 角色只能是 `user` 和 `super_user`。
- 不要重新加入超出 `user` 与 `super_user` 之外的旧版管理员角色。
- 不要把未完成实现描述成已经完成。
- 不要新增模块、依赖、基础设施、分析系统或 AI 功能，除非用户明确要求。
- 财经轻资讯必须保持非投资建议边界：
  - 不写股票推荐
  - 不写买卖建议
  - 不写个股预测
  - 不承诺收益
- 角色、权限或 Admin Console 流程变化时，同步更新权限指南。
- 页面内容变化时，同步更新 sample data。

### UX / Frontend Designer

职责：负责门户体验设计，重点是员工首页第一眼可用、信息密度合理、Admin Console 流程清楚、导航符合权限。

专家切换显示：UX / Frontend Expert

主要 skills：`$frontend-ui-engineering`、`$premium-frontend-ui`、`$web-design-reviewer`、`$browser-automation`

规则：

- 先设计实际门户体验，不做营销 landing page。
- 首页顶部必须显示今日公司简报。
- Admin Console 使用工作台布局：顶部栏、左侧导航、主内容区。
- 信息密度适合内部系统，清晰、安静、易扫描。
- 普通 `user` 不显示 Admin 导航。
- 普通 `user` 直接访问 `/admin/*` 应看到 403。
- 不设计任何普通 `user` 进入 Admin Console 的路径。
- 不使用泛 AI 风格、大型营销 hero、装饰性卡片堆、紫色渐变填充。
- 桌面和移动端都要保证文字不重叠、内容可读。

### Frontend Engineer

职责：负责 React 应用表面，把 PRD 和 UX 决策转成页面、组件、路由保护、API 调用、loading、empty、error 状态和浏览器可验证流程。

专家切换显示：UX / Frontend Expert

主要 skills：`$frontend-ui-engineering`、`$javascript-typescript-jest`、`$webapp-testing`、`$playwright-generate-test`、`$playwright-explore-website`、`$browser-automation`

规则：

- 默认使用 React + TypeScript + Vite。
- 先做可用门户，不做静态展示页。
- 必须实现路由保护：
  - 登录页面以外的页面使用 `RequireAuth`
  - `/admin/*` 使用 `RequireRole(["super_user"])`
- 前端隐藏 Admin 入口只是 UX，后端才是权限事实来源。
- API 响应 envelope 默认如下：

```json
{
  "code": "OK",
  "message": "success",
  "data": {},
  "request_id": "req_..."
}
```

- 后端未完成前，使用 `docs/prd/references/sample-data.md` 作为 mock/reference data 来源。
- 不引入新角色、浏览记录或财经投资建议。
- App 不做移动端管理写入；`super_user` 管理统一在 Web Admin Console。
- 前端完成后，至少验证：
  - login route
  - home page
  - documents page
  - training page
  - `/admin/dashboard` 作为 `super_user` 可访问
  - `/admin/dashboard` 作为 `user` 被拒绝

### Backend Engineer

职责：负责 Go REST API 和服务端业务规则，确保认证、授权、内容可见性、审计日志和 API 响应一致。

专家切换显示：Backend / Database Architect

主要 skills：`$golang-project-layout`、`$golang-database`、`$golang-security`、`$openapi-to-application-code`

规则：

- 后端使用 Go REST API。
- 后端负责 route group、middleware、validation、error response、request id、日志和 audit event。
- API 路径必须和 PRD 一致。
- 认证和权限必须在 middleware 或 service layer 执行，不能只靠前端。
- 所有 `/api/v1/admin/*` 必须要求 `super_user`。
- 所有 `super_user` 管理和后台写入都在 Web Admin Console；App 不做移动端管理写入。
- 用户门户 API 只返回 `published` 且用户可访问的内容。
- SQL 必须参数化，不允许拼接用户输入。
- content、document、course、task 使用 soft delete。
- 必须记录 audit：
  - login
  - content create/update/publish/archive/delete
  - document upload/update/delete/download
  - course create/update/delete
  - user create/update/disable/role change
  - portal config changes
- 不实现浏览历史，MVP 已明确移除。
- 不记录密码、JWT、数据库凭据、上传内容或敏感 request body。

### Database Engineer

职责：负责 PostgreSQL 数据结构、migration、索引、关系和 seed data，支持员工门户和 Admin Console。

专家切换显示：Backend / Database Architect

主要 skills：`$golang-database`、`$golang-security`、`$golang-project-layout`、`$openapi-to-application-code`

规则：

- 使用 PostgreSQL 16。
- 使用 migration，不做临时 schema 改动。
- 优先写明确、可 review 的 SQL migration。
- 保留 PRD 中关键表：
  - `users`
  - `roles`
  - `user_roles`
  - `departments`
  - `contents`
  - `documents`
  - `courses`
  - `course_progress`
  - `audit_logs`
  - `favorites`
  - `download_logs`
  - `newcomer_tasks`
  - `user_newcomer_tasks`
  - `categories`
  - `tags`
  - `portal_widgets`
  - `daily_brief_items`
- 不添加 `recent_views`。
- 不添加浏览历史等价功能，例如 browse、view_history、reading history、activity tracking、analytics jobs。
- 不添加 `user` 和 `super_user` 以外的角色。
- 不存明文密码或 secrets。
- 未经明确批准，不使用 trigger、隐藏副作用或 stored procedure。
- 常用过滤字段需要索引：
  - `status`
  - `content_type`
  - `category_id`
  - `published_at`
  - `department_id`
  - `created_at`
  - `user_id`

### DevOps Engineer

职责：负责本地运行和部署卫生，确保 Docker Compose 能稳定启动，环境变量清楚，secrets 不进仓库。

专家切换显示：DevOps / Git Expert

主要 skills：`$azure-devops-cli`、`$secret-scanning`、`$quality-playbook`、`$git-commit`

规则：

- Docker Compose 必须包含：
  - `frontend`
  - `backend`
  - `postgres`
  - `pgadmin`
- pgAdmin 端口固定为 `5050`。
- Go API 默认端口 `8080`。
- React 前端默认端口 `3000`。
- PostgreSQL 默认端口 `5432`。
- PostgreSQL 数据必须使用 volume 持久化。
- uploads 必须使用 volume 持久化。
- 不能提交含真实 secret 的 `.env`。
- 只能提交 `.env.example`。
- pgAdmin 不能作为生产公开入口。
- 默认端口变更时，PRD、文档和验证命令必须一起更新。

### QA / Verifier

职责：负责证明工作已经完成，而不是复述实现说明。尤其严格检查权限、已移除功能和财经合规边界。

专家切换显示：QA / Security Expert

主要 skills：`$webapp-testing`、`$playwright-generate-test`、`$golang-testing`、`$security-review`、`$codeql`

文档最低验证：

- 搜索旧版管理员角色，确认只保留 `user` 与 `super_user`
- 搜索浏览历史，确认没有 `recent_views`
- 检查 `user`、`super_user`、pgAdmin `5050`
- 检查财经轻资讯没有股票推荐、买卖建议、投资建议

未来应用最低验证：

- backend unit tests
- PostgreSQL integration tests
- frontend route guard tests
- API contract tests
- Docker Compose smoke test

浏览器最低验证：

- login 页面可访问
- `user` 可访问首页、文档中心、培训中心
- `user` 直接访问 `/admin/dashboard` 被拒绝
- `super_user` 可访问 `/admin/dashboard`
- 财经页面有免责声明，没有投资建议文字

权限测试必须证明：

- `user` 不能访问 `/admin/*`
- `user` 不能成功调用 `/api/v1/admin/*`
- `super_user` 可以访问全部 Admin Console 模块
- User Portal 不返回未授权内容

### Security Reviewer

职责：负责认证、授权、secrets、上传、隐私、依赖和运行暴露风险审查。

专家切换显示：QA / Security Expert

主要 skills：`$security-review`、`$codeql`、`$golang-testing`、`$webapp-testing`、`$playwright-generate-test`

规则：

- 权限漏洞按高优先级处理。
- 后端是权限事实来源，前端角色检查不是安全边界。
- 所有 `/api/v1/admin/*` 必须要求 `super_user`。
- 密码必须使用 bcrypt 或同等级方式 hash。
- 日志不能包含密码、JWT、数据库密码或上传内容。
- 文件上传必须校验大小、扩展名和 MIME type。
- 上传路径必须防止 path traversal、双扩展名、MIME spoofing、超大文件。
- SQL 必须参数化。
- React 避免 unsafe HTML injection。
- 生产 CORS 必须使用 allowlist。
- pgAdmin 不能生产公开暴露。
- 财经内容必须有免责声明，不能像投资建议。
- 不接受 `/api/v1/admin/*` 对 `user` 返回 200。
- 不接受仓库内真实 `.env` secrets。
- 不接受重新加入浏览记录、`recent_views` 或未声明的用户行为追踪。

### Git Steward

职责：负责仓库安全、提交和推送。必须确认文件范围、写符合 Lore 协议的 commit message，只推送到确认过的目标分支。

专家切换显示：DevOps / Git Expert

主要 skills：`$git-commit`、`$secret-scanning`、`$azure-devops-cli`、`$quality-playbook`

规则：

- 遵守 workspace 的 Lore Commit Protocol。
- 不 force push 到 `main`。
- 不执行 destructive git 命令，除非用户明确要求。
- 提交前检查：
  - `git status --short`
  - staged diff/stat
  - 确认 `.omx/`、`.DS_Store`、真实 secrets、本地 env 没有 staged
- 纯文档修改不需要 build，但最终说明要明确。
- 无关改动尽量拆成不同 commit。
- 不 rebase `main` / `master`。
- 不跳过 hooks，除非用户明确要求且记录风险。
- Azure push 前必须确认 remote URL、branch、status 和最近 commits。

## 开发命令

当前文档阶段检查：

```bash
rg -n "旧版管理员角色|legacy admin role|recent_views|TBD" docs AGENTS.md agentschinese.md
rg -n "user|super_user|pgAdmin|5050|股票推荐|买卖建议|投资建议" docs AGENTS.md agentschinese.md
wc -l docs/*.md AGENTS.md agentschinese.md
```

未来实现完成后的命令：

```bash
docker compose up --build
go test ./...
npm test
npm run build
```

不要在对应文件和工具不存在时声称这些命令通过。

## 文档规则

- PRD 修改按层级放在 `docs/prd/`；稳定项目基调用 `docs/prd/projectm-overall-prd.md`，端侧细节用 `docs/prd/endpoints/`，阶段任务用 `docs/prd/phases/`。
- 角色和 Admin 使用说明放在 `docs/prd/references/permissions-and-admin-guide.md`。
- 页面 mock/reference 内容放在 `docs/prd/references/sample-data.md`。
- 修改模块时，同时更新所有受影响文档。
- 验收标准必须具体，避免只写“快速”“简单”“现代”这类不可测描述。

## 实现规则

- 有代码后优先遵守现有项目模式。
- 修改保持小、清楚、可 review。
- 实现行为时添加测试。
- 能用结构化 parser/API 时，不用随意字符串处理。
- 没有明确理由不要加新依赖。
- 用户角色只允许 `user` 和 `super_user`。
- 不实现浏览历史，除非用户明确推翻之前决定。

## 完成前验证清单

报告完成前，至少验证相关子集：

- 改动文件是有意的。
- PRD、权限指南、sample data 保持一致。
- 旧角色名不存在。
- 已移除功能没有被重新加入，例如浏览历史。
- 财经模块保持非投资建议边界。
- Docker 默认端口保持：
  - frontend: `3000`
  - backend: `8080`
  - postgres: `5432`
  - pgadmin: `5050`
- 如果代码已存在，测试或 smoke check 已运行，并报告结果。
