# ProjectM 模块 PRD：员工论坛热帖 数据库层

## 1. 文档状态

- 阶段：模块数据库层。
- 模块：员工论坛热帖。
- 状态：生效。
- 责任层：数据库。
- 本文件继承 ProjectM 稳定规则，不得重写角色、端侧范围或合规边界。

## 2. 目标

定义 `forum-hot-posts` 模块在 PostgreSQL 16 中需要持久化的业务事实、生命周期、约束、索引方向和样例数据对齐点，为后端 API 和端侧消费提供一致基础。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 模块合同登记表：`docs/prd/phases/modules/contract-register.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。
- 样例数据：`docs/prd/references/sample-data.md`。

## 4. 范围内

- 员工论坛热帖 的核心数据实体和业务事实。
- 内容状态、可见性、排序、归档和必要审计字段。
- PostgreSQL 约束、外键、索引和查询方向的需求描述。
- 与样例数据的业务语义对齐。

## 5. 范围外

- 后端 API 路径、请求/响应字段和授权实现。
- Web 或 App 页面、导航、组件和 UI 文案。
- 完整迁移 SQL 和测试用例。
- 生产部署、备份和运维细节。

## 6. 依赖与前置条件

- 项目数据库方向为 PostgreSQL 16。
- 认证和用户基础数据能提供 `user` 与 `super_user` 两种角色。
- 模块状态、权限和合规边界继承整体 PRD 与决策策略。
- 如需要文件存储或外部对象存储，必须在实现阶段单独确认技术方案。

## 7. 需求

### 7.1 模块数据事实

1. 保存帖子、评论、轻量互动、热度分数、可见状态、置顶/隐藏状态和内容审计字段。
2. 热度计算需要可解释的输入字段，例如评论数、互动数、发布时间衰减和人工置顶权重。
3. 不得把普通页面访问沉淀为浏览历史或最近访问列表。
4. 评论、互动和管理审计记录继承认证基础 PRD 的通用用户归因规则，使用引用 `users.user_id` 的业务字段，例如 `author_user_id`、`user_id`、`created_by_user_id`、`updated_by_user_id` 或 `actor_user_id`。
5. 数据库不得把 `email`、`display_name`、`teams_user_id` 或 token 字段作为作者、互动用户、创建者、更新者或管理操作者的主归因字段。

### 7.2 通用数据库规则

1. 所有业务记录应具备可追踪的创建、更新和状态信息，具体字段由实现阶段收敛。
2. 时间字段使用能表达时区的类型方向，例如 PostgreSQL `TIMESTAMPTZ`。
3. 对高频列表、状态筛选、发布时间排序和权限过滤建立索引方向。
4. 管理写入应能关联操作者，但不得保存密钥或敏感正文载荷到审计记录。
5. 不得设计 `recent_views`、浏览历史或页面访问轨迹表。
6. 不得引入 `content_admin`、`department_admin`、`system_admin` 等旧角色。
7. 对 `author_user_id`、`user_id`、`created_by_user_id`、`updated_by_user_id`、`actor_user_id` 等高频归因字段建立外键和查询索引方向，便于按用户查评论、互动和审计记录。

## 8. 验收标准

- 数据库需求能支持 查看热帖、详情、评论摘要，并在后端允许的范围内参与轻量互动。
- 数据库需求能支持 维护帖子可见性、状态、排序、违规处理和热度策略参数。
- 数据事实、生命周期和约束足够后端层规划 API。
- 未引入旧角色、浏览历史或端侧 UI 细节。
- 与 `docs/prd/references/sample-data.md` 的业务语义一致。

## 9. 验证指针

文档阶段验证应检查本文件是否链接整体 PRD、决策策略和合同登记表；是否保留两角色模型；是否避免浏览历史；财经模块是否保留非投资建议边界。实现阶段验证由数据库迁移、种子数据和后端集成验证承接。

## 10. OMX 交接

执行时先读取本文件和对应后端 PRD。若发现端侧需要的数据未在本文件描述，应更新数据库 PRD 与合同登记表，不要只在端侧临时添加字段。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
