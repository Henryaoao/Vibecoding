# ProjectM 基础阶段 PRD：认证与会话

## 1. 文档状态

- 阶段：基础阶段。
- 状态：生效。
- 责任层：ProjectM 基础能力。
- 本文件继承整体项目 PRD 和 OMX 决策策略，不得重写稳定产品规则。

## 2. 目标

定义 ProjectM 认证、会话、角色识别和授权边界，让所有端和后端都继承同一权限模型。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。

## 4. 范围内

- 登录、退出、会话过期、当前用户信息、角色声明和受保护 API 的授权基线。
- `user` 与 `super_user` 两种角色的服务端判定。
- Web Admin Console 的进入条件和 `/api/v1/admin/*` 授权要求。

## 5. 范围外

- 具体身份提供商选型。
- 企业单点登录集成细节。
- 测试账号密码或真实凭据。

## 6. 依赖与前置条件

- 用户已确认 ProjectM 作为多端内部公司门户的定位。
- MVP 模块、角色模型和合规边界继承整体项目 PRD。
- 技术栈方向继承 AGENTS.md 与决策策略。

## 7. 需求

1. 应用角色只能是 `user` 和 `super_user`。
2. 后端授权是事实来源，前端隐藏入口只作为体验优化。
3. 所有 `/api/v1/admin/*` 接口必须要求 `super_user`。
4. App 不包含移动端管理写入；`super_user` 在 App 中只作为员工门户用户使用。
5. 会话过期、未登录、无权限状态必须在 Web 和 App 端分别有可实现的处理方式。
6. Web 登录会话 cookie 名称统一为 `projectm_session`；后端认证中间件以该 cookie 作为浏览器会话读取入口。当前 MVP 可保留开发期兼容头，但正式 Web 登录接入必须收敛到该 cookie 名称。

## 8. 验收标准

- 认证基础设计没有引入旧角色名或第三种角色。
- 后续模块 PRD 可以直接引用本文件处理权限和会话状态。
- Admin 写入边界清晰归属 Web Admin Console。
- Web 与后端文档中的登录会话 cookie 名称一致，均为 `projectm_session`。

## 9. 验证指针

文档阶段验证应检查本文件是否继承整体 PRD、决策策略和权限参考；是否未引入旧角色、浏览历史、财经违规内容或真实密钥；是否足够让 OMX 独立规划该基础阶段。实现阶段验证由对应实现/QA 产物承接。

## 10. OMX 交接

执行本阶段时，先确认当前仓库状态和已存在代码，不要假设尚未创建的结构已经完成。若实现方案需要改变已接受技术栈、端侧边界或安全边界，先向用户确认。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
## 12. Teams SSO implementation addendum

当前实现使用 Microsoft Teams / Entra ID OAuth 登录作为唯一登录入口；这补充本文件原始 MVP 范围，不改变 `user` / `super_user` 两角色规则。

### 12.1 环境变量

后端从环境读取：

- `SESSION_SECRET`：ProjectM 会话 cookie 签名密钥。
- `TEAMS_CLIENT_ID`
- `TEAMS_CLIENT_SECRET`
- `TEAMS_TENANT_ID`，默认 `common`
- `TEAMS_REDIRECT_URI`
- `TEAMS_AUTH_URL`，默认 `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize`
- `TEAMS_TOKEN_URL`，默认 `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- `TEAMS_USERINFO_URL`，默认 `https://graph.microsoft.com/oidc/userinfo`
- `TEAMS_SCOPES`，默认 `openid profile email`

`TEAMS_CLIENT_ID`、`TEAMS_CLIENT_SECRET` 或 `TEAMS_REDIRECT_URI` 缺失时，Teams 登录入口返回统一 API envelope 错误；不得提供备用账号或密码登录入口。

本实现依据 Microsoft identity platform OAuth 2.0 授权码流程与 OpenID Connect userinfo 端点：通过 `/oauth2/v2.0/authorize` 获取授权码，通过 `/oauth2/v2.0/token` 换取 access token，并通过 `https://graph.microsoft.com/oidc/userinfo` 获取用户信息。若企业租户要求不同端点或 scope，只能通过上述环境变量覆盖，不得把真实凭据写入仓库。

### 12.2 接口与会话

- `GET /api/v1/auth/teams/start`：生成 OAuth `state`，写入 HttpOnly state cookie，并跳转到 Microsoft identity platform 授权页。
- `GET /api/v1/auth/teams/callback`：校验 `state`，用 `code` 换取 access token，读取 OIDC userinfo，映射 ProjectM 用户，成功后签发 `projectm_session` cookie 并跳回前端首页。
- `POST /api/v1/auth/logout`：清除 ProjectM session cookie；不会调用 Microsoft 退出。

所有失败响应使用统一 API envelope；日志和响应不得暴露 app secret、access token 或 user token。

### 12.3 用户映射规则

users 表保存 `teams_user_id`、`teams_tenant_id`、`avatar_url`、`last_login_at`。后端按 Teams / Entra user id、email 查找既有用户；未找到时可创建普通 `user`。OAuth 登录绝不能默认创建或提升为 `super_user`。

### 12.4 操作归因参数

后续记录用户操作、管理写入、文档下载、课程进度、论坛互动或安全审计时，业务表和审计表必须优先使用 ProjectM 内部稳定用户 ID 作为操作者标识，建议字段名为 `actor_user_id` 或上下文明确时的 `user_id`，其值来自认证后的 `users.user_id` / `CurrentUser.userId`，不得使用邮箱、显示名、前端缓存值或 Teams token 作为业务归因主键。

Teams / Entra 身份只用于登录映射和外部身份辨别。需要追溯外部身份时，应使用 `teams_tenant_id` + `teams_user_id` 的组合；其中 `teams_user_id` 来自 Microsoft OIDC userinfo 的稳定用户标识（优先 `sub`，缺失时使用 `oid`），`teams_tenant_id` 来自 `tid`。`email`、`preferred_username`、`display_name` 可能变化，只能作为展示或辅助查找字段，不能作为审计归因参数。

应用方式：

1. 前端提交用户行为时不得传 `actor_user_id`、`author_user_id` 或任何可冒充操作者的用户 ID 字段；请求体只提交业务对象和业务内容，例如评论只提交 `post_id` 与 `body`。
2. 后端认证中间件必须从 `projectm_session` 解析当前用户，并把 `users.user_id` 放入请求上下文。
3. 后端写入任何用户发起的业务记录时，必须从请求上下文取当前用户 ID，并按业务语义选择字段名：创建者/作者使用 `author_user_id` 或 `created_by_user_id`，个人所属记录使用 `user_id`，执行者/操作者审计使用 `actor_user_id`，更新者可使用 `updated_by_user_id`。
4. 后端必须忽略或拒绝前端传入的操作者字段，避免用户伪造他人操作。
5. API 响应可以返回 `displayName`、`avatarUrl` 等展示字段，但展示字段不得反向作为下一次写入的身份来源。
6. 新模块设计用户行为、上传、下载、评论、点赞、收藏、报名、学习进度、任务状态、内容创建、管理操作或安全事件时，都必须继承本归因规则，并在对应数据库/API PRD 中声明具体字段名。
