# ProjectM 阶段 PRD 执行合同

## 1. 目的

阶段 PRD 是给 OMX 执行使用的小型需求文档。每份阶段 PRD 必须足够小，能被独立规划、执行和验收，同时继承 ProjectM 的稳定项目基线。

## 2. 必读继承链

执行阶段 PRD 前必须读取：

1. `AGENTS.md`。
2. `docs/prd/README.md`。
3. `docs/prd/projectm-overall-prd.md`。
4. `docs/prd/references/omx-decision-policy.md`。
5. 当前阶段 PRD 指向的端侧、权限、样例或合同文档。

## 3. 阶段 PRD 必备章节

模块阶段 PRD 必须包含以下中文章节：

1. 文档状态。
2. 目标。
3. 事实来源链接。
4. 范围内。
5. 范围外。
6. 依赖与前置条件。
7. 需求。
8. 验收标准。
9. 验证指针。
10. OMX 交接。
11. 决策策略继承。

## 4. 技术层职责

| 层级 | 负责内容 | 主要依赖 |
| --- | --- | --- |
| 数据库 | 数据事实、持久化生命周期、约束、索引、样例/种子形态。 | 整体 PRD、决策策略、模块产品意图。 |
| 后端 | API 合同、验证、授权、生命周期、审计写入。 | 数据库事实和约束。 |
| Web 前端 | 浏览器信息架构、路由、页面状态、组件边界、API 消费。 | 后端合同和 Web 端 PRD。 |
| App 前端 | 移动端信息架构、导航、平台状态、API 消费。 | 后端合同和 App 端 PRD。 |

## 5. 基础阶段 PRD

| 路径 | 作用 |
| --- | --- |
| `docs/prd/phases/foundation/project-scaffold-prd.md` | 项目脚手架、目录、环境样例和本地运行边界。 |
| `docs/prd/phases/foundation/auth-session-prd.md` | 认证、会话、角色和授权基线。 |
| `docs/prd/phases/foundation/api-contract-foundation-prd.md` | 通用 REST API 合同、错误、分页和管理命名空间。 |
| `docs/prd/phases/foundation/web-shell-prd.md` | Web 应用壳、路由壳和 Admin 壳层基础。 |
| `docs/prd/phases/foundation/app-shell-prd.md` | App 壳层、移动端导航和平台状态基础。 |

## 6. 模块阶段 PRD

批准的模块目录：

- `today-briefing`
- `announcements`
- `forum-hot-posts`
- `newcomer-zone`
- `finance-light-news`
- `document-center`
- `training-center`

每个模块必须有四份阶段 PRD：

- `database-prd.md`
- `backend-prd.md`
- `web-frontend-prd.md`
- `app-frontend-prd.md`

因此 MVP 模块阶段 PRD 总数为 28 份。

## 7. 合同登记

`docs/prd/phases/modules/contract-register.md` 记录模块间、后端与端侧之间的重要合同关系。任何阶段 PRD 如果提出 API、权限、字段或状态合同变更，都必须同步检查合同登记表。

## 8. 维护规则

- 阶段 PRD 必须中文优先，代码标识符和技术栈名称除外。
- 不要在阶段 PRD 中写完整测试用例；只写可验收条件和验证指针。
- 若需要改变模块边界、角色、合规边界、端侧范围或技术栈，必须先问用户。
- App 阶段 PRD 不得加入移动端管理写入。
- 财经轻资讯阶段 PRD 必须保留非投资建议边界。
