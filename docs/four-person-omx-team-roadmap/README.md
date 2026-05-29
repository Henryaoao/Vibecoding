# ProjectM 四人 OMX Team 串行阶段路线图

生成时间：2026-05-28

本文只记录 ProjectM 的串行开发阶段顺序，以及每个阶段四个 `omx team` 席位的大方向。具体到某一阶段时，再单独拆 A/B/C/D 的可执行任务。

## 1. 执行方式

- 四个席位全部使用 `omx team` 执行。
- 每个阶段先并行开发，再统一合并。
- 合并后的代码作为下一阶段基线。
- 下一阶段的四人细任务在上一阶段合并后再拆。
- 原 milestone 只作任务池参考，阶段顺序以 PRD 拆分后的技术依赖为准。

每个阶段默认先读：

- `AGENTS.md`
- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/references/omx-decision-policy.md`

## 2. 四个席位

| 席位 | 长期主题 | 模块边界 |
| --- | --- | --- |
| A | 信息发布核心 | 今日公司简报、公司公告墙 |
| B | 知识资料与学习 | 文档中心、培训中心 |
| C | 社区成长与财经 | 员工论坛热帖、新人专区、财经轻资讯 |
| D | 平台、权限、集成与质量 | 脚手架、共享合同、认证/RBAC、Web/App shell、Docker、QA、安全、交付 |

## 3. 串行阶段总览

| 顺序 | 阶段 | 主要目标 |
| --- | --- | --- |
| P00 | 规划、工作流与硬门禁冻结 | 固定范围、角色、禁止项、执行规则和四人协作方式。 |
| P01 | 项目脚手架、运行底座与通用合同 | 建立 Web、App、Backend、Database、Docker 的共同基础。 |
| P02 | 数据库模型、Seed 数据与模块合同 | 固定数据事实、状态、索引、seed 和模块合同。 |
| P03 | 后端基础、认证 RBAC 与员工端读取 API | 建立后端合同、权限事实来源和员工端读取能力。 |
| P04 | Web 员工门户与模块读取体验 | Web 消费真实 API，完成员工门户七模块读取体验。 |
| P05 | Admin Console 只读地基 | 建立 Admin 壳、权限拒绝、导航和管理列表。 |
| P06 | Admin 写入、审计与文件安全闭环 | 完成管理写入、状态流转、审计和上传下载安全。 |
| P07 | App 员工端 | 完成 React Native + Expo 员工门户；不做移动端管理写入。 |
| P08 | 测试体系建设 | 建立后端、前端、App、API、Docker、安全和合规测试体系。 |
| P09 | 整体联调、缺陷修复与回归 | 端到端联调全系统并闭环修复问题。 |
| P10 | 正式验收 | 按 PRD 成功标准完成验收。 |
| P11 | 提交、交付与归档 | 冻结代码、整理文档、报告、版本和交付清单。 |

## 4. 阶段详情

### P00：规划、工作流与硬门禁冻结

目标：固定 MVP 范围、两角色模型、禁止项、PRD 边界、OMX 执行方式和质量门禁。

本阶段先读 PRD / 规则：

- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`
- `docs/prd/phases/README.md`
- `docs/agents/README.md`
- `docs/agents/omx-workflows.md`
- `docs/agents/project-roles.md`
- `docs/agents/capability-governance.md`
- `docs/agents/skills.md`
- `docs/agents/verification.md`

限制范围：

- 只整理规划、规则、边界和后续执行约束。
- 不实现业务代码。
- 不改 `docs/prd/` 目录层级和事实来源顺序。
- 不新增角色、模块、技术栈或移动端管理写入。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告范围、管理边界、样例数据。 |
| B | 文档/培训范围、文件权限、下载、课程和学习状态。 |
| C | 热帖/新人/财经范围、财经合规、无浏览历史边界。 |
| D | Agent/Skill/Workflow、验证命令、角色模型和禁止项门禁。 |

### P01：项目脚手架、运行底座与通用合同

目标：先建立共同运行底座，再进入模块业务。

本阶段先读 PRD：

- `docs/prd/phases/foundation/project-scaffold-prd.md`
- `docs/prd/phases/foundation/api-contract-foundation-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/foundation/web-shell-prd.md`
- `docs/prd/phases/foundation/app-shell-prd.md`
- `docs/prd/endpoints/web-prd.md`
- `docs/prd/endpoints/app-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`

限制范围：

- 只做脚手架、运行底座、通用合同、壳层和基础配置。
- 不做完整业务模块。
- 不做 Admin 写入。
- 不提交真实 `.env` 或密钥。
- 保持默认端口：Web `3000`、Backend `8080`、PostgreSQL `5432`、pgAdmin `5050`。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 信息发布模块需要的基础数据形态和 mock 边界。 |
| B | Web shell、模块挂载点、设计系统基础、通用状态组件。 |
| C | 热帖/新人/财经需要的合规字段和展示边界。 |
| D | Go 后端骨架、API envelope、配置、Docker Compose、PostgreSQL、pgAdmin、健康检查。 |

### P02：数据库模型、Seed 数据与模块合同

目标：固定模块数据事实，让后端可以稳定实现。

本阶段先读 PRD：

- `docs/prd/phases/modules/contract-register.md`
- `docs/prd/phases/modules/*/database-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`
- `docs/prd/phases/foundation/auth-session-prd.md`

限制范围：

- 只做 PostgreSQL schema、migration、索引、约束、seed 和合同登记。
- 不做后端 API 实现。
- 不做 Web/App 页面。
- 不创建 `recent_views`、浏览历史或页面访问轨迹。
- 不引入 `content_admin`、`department_admin`、`system_admin` 或第三种应用角色。
- 不使用 MySQL / phpMyAdmin / `3306` / `8081` 旧边界。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告表、状态、排序、有效期、seed。 |
| B | 文档/培训表、下载、收藏、课程、学习进度、seed。 |
| C | 热帖/新人/财经表、合规字段、任务状态、seed。 |
| D | 用户、角色、部门、分类、标签、首页配置、审计日志、迁移规范、索引。 |

### P03：后端基础、认证 RBAC 与员工端读取 API

目标：完成员工端真实 API 和后端权限基础。

本阶段先读 PRD：

- `docs/prd/phases/foundation/api-contract-foundation-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/prd/phases/modules/*/database-prd.md`
- `docs/prd/phases/modules/*/backend-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`

限制范围：

- 只做后端基础、认证/RBAC、员工端读取 API、本人数据 API 和后端测试。
- 不做 Web/App UI。
- 不做 Admin 业务写入。
- `/api/v1/admin/*` 权限基础可以做，但具体管理写入留到 P06。
- 员工端 API 只返回已发布、可见、有权限内容。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告列表、详情、搜索、筛选、可见性规则。 |
| B | 文档/培训列表、详情、下载权限、学习进度读取、本人数据读取。 |
| C | 热帖/新人/财经列表、详情、新人任务本人状态、财经免责声明字段。 |
| D | 登录、`/auth/me`、会话、RequireAuth、RequireSuperUser、service 权限复核、API contract。 |

### P04：Web 员工门户与模块读取体验

目标：Web 员工门户接入 P03 后端合同。

本阶段先读 PRD：

- `docs/prd/endpoints/web-prd.md`
- `docs/prd/phases/foundation/web-shell-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/prd/phases/modules/*/backend-prd.md`
- `docs/prd/phases/modules/*/web-frontend-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`

限制范围：

- 只做 Web 员工门户读取体验。
- 不做 Admin 写入。
- 不改后端权限事实。
- 不引入新角色、新路由库或新的全局状态管理库，除非另行确认。
- 不实现浏览历史、最近浏览或页面访问轨迹。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告 Web service、types、组件、列表、详情、首页联动。 |
| B | 文档/培训 Web service、types、组件、搜索筛选、下载入口、课程详情。 |
| C | 热帖/新人/财经 Web service、types、组件、合规提示、本人任务入口。 |
| D | Web shell 接线、路由守卫、登录会话、加载/空/错/重试状态、构建检查。 |

### P05：Admin Console 只读地基

目标：先做 Admin 壳和管理列表，不进入复杂写入状态机。

本阶段先读 PRD：

- `docs/prd/endpoints/web-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/phases/foundation/web-shell-prd.md`
- `docs/prd/phases/foundation/api-contract-foundation-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/prd/phases/modules/*/backend-prd.md`
- `docs/prd/phases/modules/*/web-frontend-prd.md`

限制范围：

- 只做 Admin shell、导航、403、route guard、管理列表和只读 API。
- 不做创建、编辑、发布、归档、删除等写入动作。
- 不做批量操作。
- 不做移动端 Admin。
- 前端隐藏不能替代后端授权。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告 Admin list API 与 Web 管理列表。 |
| B | 文档/培训 Admin list API 与 Web 管理列表。 |
| C | 热帖/新人/财经 Admin list API 与 Web 管理列表。 |
| D | Admin shell、`super_user` 导航、`user` 403、Admin route guard、审计只读入口。 |

### P06：Admin 写入、审计与文件安全闭环

目标：在只读链路稳定后补管理写入和安全边界。

本阶段先读 PRD：

- `docs/prd/endpoints/web-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/phases/foundation/api-contract-foundation-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/prd/phases/modules/*/backend-prd.md`
- `docs/prd/phases/modules/*/web-frontend-prd.md`
- `docs/prd/references/sample-data.md`

限制范围：

- 只做 Web Admin Console 管理写入、后端 Admin API、审计和文件安全。
- 所有 `/api/v1/admin/*` 必须要求 `super_user`。
- 不做 App 管理写入。
- 不做不可恢复批量删除。
- 不记录密码、JWT、数据库密码、上传内容或敏感请求正文。
- 财经内容不得出现股票推荐、买卖建议、个股预测或收益承诺。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告创建、编辑、发布、归档、下线、置顶、有效期。 |
| B | 文档上传、元数据、授权、发布、归档、下载审计、课程管理。 |
| C | 热帖治理、新人资料/任务模板、财经合规检查、发布和归档。 |
| D | 审计写入、最后 `super_user` 保护、分类标签、首页配置、上传下载安全、敏感信息保护。 |

### P07：App 员工端

目标：完成移动端员工门户；App 不做 Admin Console 或管理写入。

本阶段先读 PRD：

- `docs/prd/endpoints/app-prd.md`
- `docs/prd/phases/foundation/app-shell-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/prd/phases/modules/*/backend-prd.md`
- `docs/prd/phases/modules/*/app-frontend-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`

限制范围：

- 只做 React Native + TypeScript + Expo 员工门户。
- 不做移动端 Admin Console。
- 不做移动端管理写入。
- App 不定义权限事实，只消费后端合同。
- 不在未确认策略外缓存敏感文档。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告 App 列表、详情、首页摘要、弱网状态。 |
| B | 文档/培训 App 浏览、材料入口、本人学习进度、安全缓存边界。 |
| C | 热帖/新人/财经 App 浏览、本人任务状态、财经合规提示。 |
| D | App shell、导航、登录会话、API client、401/403、离线、重试、移动端检查。 |

### P08：测试体系建设

目标：把开发结果变成可重复运行的测试体系。

本阶段先读 PRD / 规则：

- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/endpoints/web-prd.md`
- `docs/prd/endpoints/app-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/omx-decision-policy.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/agents/verification.md`
- `docs/agents/capability-governance.md`

限制范围：

- 只建设测试、扫描、报告和验证脚本。
- 不借测试阶段扩大产品范围。
- 不修业务缺陷，除非是测试基础本身需要的最小修复。
- 不写入真实密钥、真实账号密码或生产数据。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告后端、Web/App、Admin 测试。 |
| B | 文档/培训权限、下载、课程、学习进度测试。 |
| C | 热帖/新人/财经合规、状态、边界测试。 |
| D | 测试目录、测试账号、seed、API contract、权限矩阵、Docker smoke、secret scan、报告模板。 |

### P09：整体联调、缺陷修复与回归

目标：把数据库、后端、Web、App、Admin、Docker 放到同一环境里联调。

本阶段先读 PRD / 规则：

- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/endpoints/web-prd.md`
- `docs/prd/endpoints/app-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/sample-data.md`
- `docs/prd/phases/modules/contract-register.md`
- `docs/agents/verification.md`

限制范围：

- 只做联调、缺陷修复、回归和集成说明。
- 不新增 PRD 外功能。
- 不改变角色模型、端侧范围或技术栈。
- 不把临时联调数据写成长期产品事实。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告端到端联调与修复。 |
| B | 文档/培训端到端联调与修复。 |
| C | 热帖/新人/财经端到端联调与修复。 |
| D | 联调环境、API base URL、seed/账号、权限拒绝、错误态、Docker、回归批次。 |

### P10：正式验收

目标：按 PRD 成功标准验收功能、权限、安全、运行和禁止项。

本阶段先读 PRD / 规则：

- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/endpoints/web-prd.md`
- `docs/prd/endpoints/app-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/omx-decision-policy.md`
- `docs/prd/references/sample-data.md`
- `docs/agents/verification.md`
- `docs/agents/capability-governance.md`

限制范围：

- 只做验收、缺陷登记、风险登记和签收材料。
- 不在验收阶段新增功能。
- 不放宽权限、安全、财经或 App 管理边界。
- 未通过项只能标记失败、阻塞、豁免或延期，不能改写 PRD 含义。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 简报/公告功能验收和 Admin 验收。 |
| B | 文档/培训功能验收、下载权限验收、课程/学习进度验收。 |
| C | 热帖/新人/财经功能验收、财经合规验收、禁止项验收。 |
| D | 验收准入、角色权限、安全、运行性能、Docker、AC-01 到 AC-10、签收材料。 |

### P11：提交、交付与归档

目标：冻结代码，整理最终交付包。

本阶段先读 PRD / 规则：

- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/endpoints/web-prd.md`
- `docs/prd/endpoints/app-prd.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/references/omx-decision-policy.md`
- `docs/agents/verification.md`
- `docs/agents/capability-governance.md`
- `AGENTS.md` 的 Lore Commit Protocol

限制范围：

- 只做交付文档、最终检查、版本说明、提交准备和归档。
- 不新增业务功能。
- 不提交真实 `.env`、密钥、令牌、账号密码或本地临时垃圾。
- 不 force push `main`。
- 不跳过最终检查，除非交付说明明确记录未验证项。

| 席位 | 本阶段方向 |
| --- | --- |
| A | 信息发布模块交付说明、已知风险、使用说明。 |
| B | 文档/培训模块交付说明、权限说明、课程说明。 |
| C | 热帖/新人/财经模块交付说明、财经合规边界、后续计划。 |
| D | README、本地启动、环境变量、部署运维、测试报告、secret scan、Lore commit、版本说明、交接清单。 |

## 5. 阶段合并节奏

每个阶段结束时：

1. A/B/C/D 各自完成本阶段任务。
2. D 先合共享壳、合同、验证脚本或集成修复。
3. A/B/C rebase 到阶段基线后合入模块变更。
4. 统一跑阶段检查。
5. 修完冲突和阻塞项。
6. 再拆下一阶段的四人细任务。

## 6. 下一步

下一次拆任务时，只拆一个阶段。每个席位拆到可以直接交给 `omx team` 的粒度：

- 阶段目标
- A/B/C/D 各自 prompt
- 可改文件
- 禁止触碰文件
- 读取顺序
- 检查命令
- 汇报格式
- 合并顺序
