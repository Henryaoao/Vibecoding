# ProjectM 模块 PRD：新人专区 后端层

## 1. 文档状态

- 阶段：模块后端层。
- 模块：新人专区。
- 状态：生效。
- 责任层：Go REST API。
- 本文件继承 ProjectM 稳定规则，不得重写角色、端侧范围或合规边界。

## 2. 目标

定义 `newcomer-zone` 模块的后端 API、授权、验证、生命周期、审计和跨端合同，使 Web 与 App 能消费同一服务端事实。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 模块合同登记表：`docs/prd/phases/modules/contract-register.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。
- API 合同基础 PRD：`docs/prd/phases/foundation/api-contract-foundation-prd.md`。
- 数据库 PRD：`docs/prd/phases/modules/newcomer-zone/database-prd.md`。

## 4. 范围内

- 员工端读取或互动 API。
- `super_user` 管理 API 和状态流转。
- 服务端授权、输入验证、错误、分页、排序、筛选和审计要求。
- Web 与 App 可消费的合同输出。

## 5. 范围外

- 数据库迁移 SQL 和具体索引实现。
- Web/App 组件、路由和 UI 文案。
- 完整测试用例或自动化脚本。
- 生产部署和运维细节。

## 6. 依赖与前置条件

- 已读取 API 合同基础 PRD。
- 已读取 `newcomer-zone` 数据库 PRD。
- 认证会话基础能提供当前用户和角色。
- 管理命名空间遵循 `/api/v1/admin/*` 或 API 基础阶段确认的等价路径。

## 7. 需求

### 7.1 模块 API 行为

1. 员工接口返回新人资源、任务列表、个人任务状态和个人任务更新动作。
2. 管理接口支持资源、任务模板、排序、发布、归档和下线。
3. 员工接口必须按当前用户权限过滤数据。
4. 管理写入必须校验状态流转、必要字段和操作者权限。
5. API 响应必须能被 Web 与 App 同时消费，端侧差异不应导致合同分叉。

### 7.2 通用后端规则

1. `user` 和 `super_user` 都可以使用员工端接口，前提是资源对当前用户可见。
2. 管理 API 必须要求 `super_user`，并位于 `/api/v1/admin/*` 或已确认等价命名空间。
3. 后端必须返回可区分的未登录、会话过期、无权限、参数错误、资源不存在和状态冲突错误。
4. 后端必须记录必要管理审计，不记录密钥或敏感正文载荷。
5. 后端不得依赖端侧隐藏作为安全边界。
6. Web/App 请求的合同变更必须登记到合同登记表。

## 8. 验收标准

- 后端合同清楚区分员工能力和管理能力。
- 管理写入要求 `super_user` 并可审计。
- Web/App PRD 可以消费该合同而不重写权限事实。
- API 行为能支持 查看新人资料、完成个人入职任务、跟踪自己的任务状态。
- API 行为能支持 维护入职资料、任务模板、排序、有效期和面向新人群体的内容状态。

## 9. 验证指针

文档阶段验证应检查本文件是否链接整体 PRD、决策策略和合同登记表；是否保留两角色模型；是否避免浏览历史；财经模块是否保留非投资建议边界。实现阶段验证由 API 测试、权限测试和集成测试承接。

## 10. OMX 交接

执行时先确认数据库事实是否足够支撑 API。若 Web 或 App 需要新增字段、状态或错误码，先更新后端 PRD 与合同登记表，再进入端侧实现。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
