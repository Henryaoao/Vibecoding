# ProjectM 移动端架构设计

## 1. 文档目的

本文档是 ProjectM Mobile 的当前技术架构说明。它位于当前 `docs/prd/` 事实来源之后，只覆盖移动 App 本身，不展开 Web、Go 后端、MySQL 或 Docker 的整体平台架构。

需求来源：

- `docs/prd/` 当前事实来源
- `docs/user-admin-permissions-guide.md`

本文档目标：

- 记录当前移动端工程结构、导航结构和模块边界。
- 记录当前 API client、鉴权、权限守卫、缓存和错误处理方式。
- 记录当前推送通知、文件预览、安全存储和移动 Admin Console 的架构方案。
- 为后续创建 `mobile/` Expo 工程提供直接可执行的技术蓝图。

本文档不是不可变更的规则。后续实现、测试、真机验证或后端契约变化如果证明当前架构存在问题，应调整本文档。每次架构调整必须同步更新 `mobile/docs/mobile-project-status.md` 中的架构变更记录，说明改动内容、改动原因、影响范围和验证结果。

## 2. 架构决策

| 主题 | 当前方案 |
| --- | --- |
| App 技术栈 | React Native + Expo + TypeScript |
| 路由 | Expo Router 文件路由 |
| 请求状态 | TanStack Query |
| 本地安全存储 | `expo-secure-store` |
| 推送通知 | `expo-notifications` + Expo Push Service |
| 文件能力 | 短期 preview URL + 系统预览 / 外部应用打开 |
| UI 状态 | 页面级 loading / error / empty / refreshing 状态 |
| Admin 操作 | 第一版只支持单条操作，不支持批量操作 |
| 权限模型 | 只有 `user` 和 `super_user` |
| Mock 数据 | 从当前 `docs/prd/` 事实来源和后端合同派生，API contract 保持真实形状 |

移动端架构原则：

- 移动端不复制后端权限逻辑，所有后台接口仍以服务端校验为准。
- 移动端隐藏 Admin 入口只是体验优化，不能作为安全边界。
- Mock 阶段也必须保持真实 API envelope，避免后续接入真实后端时重写调用层。
- 推送、文件预览、Admin 写操作都必须能处理 401、403 和网络失败。
- 财经轻资讯必须保留免责声明，不展示股票推荐、买卖建议、个股预测或收益承诺。

## 3. 工程目录

未来移动端工程使用 `mobile/` 目录。推荐结构：

```text
mobile/
├── app/
│   ├── _layout.tsx
│   ├── forbidden.tsx
│   ├── (auth)/
│   ├── (tabs)/
│   ├── briefs/
│   ├── announcements/
│   ├── forum-hot/
│   ├── newcomer/
│   ├── finance/
│   ├── documents/
│   ├── training/
│   ├── me/
│   └── admin/
├── src/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── features/
│   ├── files/
│   ├── notifications/
│   ├── storage/
│   ├── theme/
│   ├── types/
│   └── utils/
├── assets/
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

目录职责：

| 目录 | 职责 |
| --- | --- |
| `app/` | Expo Router 页面、layout、路由分组和 403 页面。 |
| `src/api/` | API client、request envelope、endpoint 封装、错误类型。 |
| `src/auth/` | 登录、退出、会话恢复、角色判断、权限守卫。 |
| `src/components/` | 通用 UI 组件，如按钮、列表项、空状态、确认弹窗。 |
| `src/features/` | 按业务模块组织页面逻辑和组件。 |
| `src/files/` | 文件下载、preview URL、系统预览、失败降级。 |
| `src/notifications/` | 通知权限、token 注册、通知点击路由、偏好设置。 |
| `src/storage/` | 安全存储封装和非敏感偏好缓存。 |
| `src/theme/` | 颜色、字号、间距、图标、移动端视觉 token。 |
| `src/types/` | API DTO、角色、内容类型、错误码等 TypeScript 类型。 |
| `src/utils/` | 日期、文件大小、枚举展示、输入校验等纯函数。 |

## 4. 路由结构

移动端使用 Expo Router。推荐路由：

```text
app/
├── _layout.tsx
├── forbidden.tsx
├── (auth)/
│   └── login.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── documents.tsx
│   ├── training.tsx
│   └── me.tsx
├── modules/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── briefs.tsx
│   ├── announcements.tsx
│   ├── forum-hot.tsx
│   ├── newcomer.tsx
│   └── finance.tsx
├── documents/
│   └── [id].tsx
├── training/
│   └── [id].tsx
├── me/
│   ├── favorites.tsx
│   ├── downloads.tsx
│   ├── training.tsx
│   └── newcomer-tasks.tsx
└── admin/
    ├── _layout.tsx
    ├── index.tsx
    ├── dashboard.tsx
    ├── contents/
    ├── documents/
    ├── courses/
    ├── newcomer-tasks/
    ├── categories/
    ├── tags/
    ├── users/
    ├── roles.tsx
    ├── portal-config.tsx
    └── audit-logs.tsx
```

路由规则：

- `(auth)` 只放登录和未来认证相关页面。
- `(tabs)` 是普通用户日常入口：首页、文档、培训、个人中心。
- 7 个用户模块必须都有可达入口；第一版用 `src/navigation/moduleRoutes.ts` 维护统一模块路由清单。
- `modules/` 承载非 Tab 用户模块的第一层页面，详情页成熟后可继续拆到对应动态路由。
- 文档中心和培训中心作为高频入口保留在 `(tabs)`，后续详情页放在 `documents/[id]` 和 `training/[id]`。
- `admin/` 使用独立 layout，只有 `super_user` 可进入。
- 无权限访问 Admin 页面时跳转或渲染 `forbidden.tsx`。

## 5. 状态管理

移动端状态分三层：

| 状态类型 | 存放位置 | 示例 |
| --- | --- | --- |
| 服务端状态 | TanStack Query | 首页、内容列表、文档列表、课程进度、Admin 列表。 |
| 会话状态 | `src/auth/` provider | 当前用户、角色、token 是否恢复完成。 |
| 本地偏好 | `src/storage/` | 通知偏好缓存、最近选择的筛选项、非敏感 UI 设置。 |

状态规则：

- 服务端数据通过 query key 管理，不在全局 store 中重复保存。
- 登录、退出、token 过期必须统一驱动 query cache 清理或失效。
- 表单草稿只保存在当前页面状态；后台写操作成功后刷新对应列表和详情 query。
- 下拉刷新使用 TanStack Query refetch，不绕过 API client。

## 6. API Client

API client 位于 `src/api/`，统一处理 transport 选择、base URL、token 注入、响应 envelope、错误和 request id。

响应 envelope：

```ts
export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
  request_id: string;
};
```

错误类型：

```ts
export type ApiError = {
  status: number;
  code: string;
  message: string;
  requestId?: string;
};
```

请求规则：

- 所有业务请求都经过同一个 API client。
- 未配置 `EXPO_PUBLIC_API_BASE_URL` 时默认使用本地 `mockTransport`，保留离线开发和测试行为。
- 配置 `EXPO_PUBLIC_API_BASE_URL` 时使用 fetch-backed transport，并从 base URL 与 request path 组装真实 API URL。
- 已登录请求自动附加 Bearer token。
- 401 触发会话失效和登录跳转。
- 403 显示权限错误；Admin 页面应进入 403 状态。
- 非 2xx 响应必须解析 `message` 和 `request_id`，用于错误提示和排查。
- 请求日志不得输出 token、密码、上传内容或敏感响应体。
- 默认 transport 由 `createConfiguredApiTransport()` 创建；未配置或配置无效时继续使用 `mockTransport`。
- 设置 `EXPO_PUBLIC_API_BASE_URL` 为有效 URL 后，API client 使用 fetch-backed transport，把 request path 拼接到 base URL、转发 Authorization header，并对有 body 的请求发送 JSON `Content-Type`。
- fetch-backed transport 只接受 canonical `ApiEnvelope<T>` JSON；非 JSON 响应和网络失败映射为 `ApiError`，错误消息不得泄漏 token。

推荐模块：

```text
src/api/
├── client.ts
├── errors.ts
├── endpoints.ts
├── envelope.ts
├── fetchTransport.ts
├── transportConfig.ts
├── auth.ts
├── contents.ts
├── documents.ts
├── courses.ts
├── me.ts
├── admin.ts
└── mock/
```

## 7. 鉴权与权限守卫

### 7.1 登录流程

1. 用户打开 App。
2. Auth provider 从 `expo-secure-store` 读取 token。
3. 如果 token 存在，调用 `GET /api/v1/auth/me` 恢复当前用户。
4. 恢复成功后进入首页。
5. 恢复失败或 token 不存在时进入登录页。
6. 登录成功后保存 token，拉取 `/auth/me`，注册 push token。

### 7.2 退出流程

1. 调用 `POST /api/v1/auth/logout`。
2. 调用设备解绑接口或停用当前设备 token。
3. 清理 secure token。
4. 清理 TanStack Query cache。
5. 回到登录页。

### 7.3 权限守卫

移动端实现与 Web `RequireAuth`、`RequireRole(["super_user"])` 等价的守卫。

守卫规则：

- 未登录访问受保护页面：跳转登录。
- `user` 访问 Admin 页面：展示 403。
- `super_user` 访问 Admin 页面：允许进入。
- 当前用户状态恢复中：展示全屏加载状态。
- `/api/v1/admin/*` 返回 403：当前页面必须显示权限错误，不得吞掉错误继续展示旧数据。

## 8. Mock 策略

第一阶段可以用 mock 数据推进移动端体验，但 mock 层必须保持真实 API contract。

Mock 规则：

- mock response 仍包裹 `code`、`message`、`data`、`request_id`。
- mock API 也要模拟 401、403、空状态和网络错误。
- mock 数据不得引入新角色。
- mock 阶段必须保留财经轻资讯免责声明。
- API 调用函数名、参数和返回类型应按真实接口设计，后续只切换 transport 或 base URL。
- 本地默认仍为 mock fallback；只有显式配置有效真实 API base URL 时才切换到 fetch-backed transport。
- mock 内容应覆盖首页、7 个用户模块、个人中心、Admin Dashboard 和一个 Admin 单条写操作流程。

## 9. 推送通知架构

第一版推送使用 Expo Push Service。

### 9.1 客户端流程

1. 用户登录成功。
2. App 检查通知权限。
3. 如果用户同意，获取 Expo push token。
4. 调用 `POST /api/v1/me/devices` 注册设备。
5. 用户在个人中心管理通知偏好。
6. App 接收通知后，根据 payload 跳转对应详情页。
7. 退出登录时解绑或停用当前设备。

### 9.2 API contract

| Method | Path | 用途 |
| --- | --- | --- |
| POST | `/api/v1/me/devices` | 注册设备和 Expo push token。 |
| DELETE | `/api/v1/me/devices/{id}` | 解绑设备。 |
| GET | `/api/v1/me/notification-settings` | 获取通知偏好。 |
| PUT | `/api/v1/me/notification-settings` | 更新通知偏好。 |

设备字段：

- `id`
- `user_id`
- `platform`
- `expo_push_token`
- `device_name`
- `app_version`
- `enabled`
- `last_seen_at`

### 9.3 通知 payload

推荐 payload：

```json
{
  "type": "announcement",
  "resource_type": "content",
  "resource_id": 2101,
  "route": "/announcements/2101"
}
```

通知规则：

- 通知正文不放密码、token、文件内容或敏感正文。
- App root 挂载 `useNotificationResponseListener()`，通过懒加载 `expo-notifications` 的 `addNotificationResponseReceivedListener` 接收通知点击 response。
- listener 只读取 `response.notification.request.content.data` 并交给 `clickRouting` 白名单解析；测试必须通过 injectable provider 验证，避免 Jest 和非原生环境加载 native 模块。
- 点击通知后必须重新请求详情接口。
- 如果用户已无权限，展示 403 或资源不可用状态。
- 推送功能必须用 iOS / Android 真机和 development / preview build 验证；未实际执行前不得声明真机 smoke 已完成。

## 10. 文件预览架构

文件预览采用短期 preview URL。

### 10.1 客户端流程

1. 用户打开文档详情。
2. 用户点击预览。
3. App 调用 `POST /api/v1/documents/{id}/preview-url`。
4. 后端返回短期有效 URL、文件名、mime type、过期时间。
5. App 根据 mime type 选择预览方式。
6. 预览失败时展示错误，并提供下载或外部打开降级入口。

### 10.2 Preview URL contract

推荐响应：

```json
{
  "code": "OK",
  "message": "success",
  "data": {
    "preview_url": "https://example.com/files/preview-token",
    "file_name": "employee-handbook-2026.pdf",
    "mime_type": "application/pdf",
    "expires_at": "2026-05-26T18:00:00+08:00"
  },
  "request_id": "req_01H..."
}
```

规则：

- 获取 preview URL 前必须校验用户文档权限。
- preview URL 必须短期有效。
- 无权限用户不能获得文件名、mime type、下载地址或 preview URL。
- PDF 和图片优先应用内或系统预览。
- Word、Excel、PPT 优先系统预览或外部应用打开。
- 大文件必须展示进度、失败状态和重试入口。

## 11. Admin Console 移动架构

移动端完整支持 `super_user` Admin Console，但第一版只支持单条操作。

### 11.1 页面模式

| 页面类型 | 移动端模式 |
| --- | --- |
| Dashboard | 指标摘要 + 最近操作 + 模块入口。 |
| 列表页 | 搜索、筛选、加载更多、单条进入详情。 |
| 详情页 | 展示元数据、状态、关键内容和操作入口。 |
| 编辑页 | 分段表单、固定底部操作栏、保存草稿和发布。 |
| 确认页 | 发布、归档、删除、禁用、角色变更二次确认。 |

### 11.2 操作规则

- 不支持批量选择、批量归档或批量删除。
- 保存草稿、发布、归档、软删除走对应 Admin API。
- 发布、归档、软删除、禁用用户、修改角色必须二次确认。
- 写操作成功后刷新列表、详情和 Dashboard query。
- 写操作失败必须展示后端 message 和 request id。

### 11.3 Admin 模块

| 模块 | 第一版能力 |
| --- | --- |
| Dashboard | 查看指标和最近操作。 |
| 内容管理 | 单条新建、编辑、保存草稿、发布、归档、软删除。 |
| 文档管理 | 单条上传或编辑、发布、归档、软删除。 |
| 课程管理 | 单条创建、编辑、发布、归档、软删除。 |
| 新人任务管理 | 单条创建、编辑、启用、禁用。 |
| 分类管理 | 单条创建、编辑、禁用。 |
| 标签管理 | 单条创建、编辑、禁用。 |
| 用户管理 | 单条创建、编辑、禁用、分配角色。 |
| 角色权限 | 查看角色定义，给单个用户分配角色。 |
| 首页栏目配置 | 修改启用状态、排序和展示条数。 |
| 审计日志 | 搜索、筛选、查看详情。 |

## 12. 安全与隐私

安全规则：

- token 只存储在 `expo-secure-store`。
- 生产环境 API 必须使用 HTTPS。
- 请求日志不得输出密码、token、上传内容或敏感响应。
- 退出登录必须清理 token、query cache 和当前设备状态。
- App 恢复会话必须重新调用 `/api/v1/auth/me`。
- 所有 Admin 写操作以后端授权和审计为准。
- 文件预览和下载不得绕过文档权限。
- 财经轻资讯页面必须展示免责声明。

客户端错误处理：

- 401：清理会话并进入登录页。
- 403：展示权限错误；Admin 页面进入 403。
- 404：展示资源不存在或已下架。
- 5xx：展示可重试错误和 request id。
- 网络失败：展示离线/网络异常状态，不伪造成功。

## 13. 构建与分发

移动端第一阶段使用 EAS development / preview build。

构建策略：

- development build 用于开发调试、真机推送和文件预览验证。
- preview build 用于内部评审和业务验收。
- 不使用 Expo Go 作为推送验收依据。
- App Store / Google Play 正式上架不进入 MVP。

环境配置：

| 环境 | API Base URL | 用途 |
| --- | --- | --- |
| local | 本机或局域网后端地址 | 开发调试。 |
| mock | 本地 mock transport | 后端未就绪时开发页面。 |
| staging | 测试环境 API | 内部验收。 |

## 14. 测试策略

移动端开发采用 test-first / TDD 流程。每个新增功能在实现前必须先写测试，先看到测试失败，再实现最小代码让测试通过，最后在测试保护下重构。

推荐测试栈：

- `jest-expo`：Expo 项目的 Jest preset。
- Jest：单元测试和组件测试运行器。
- React Native Testing Library：验证用户可观察的 UI 行为。

测试组织规则：

- Expo Router 的测试文件不放在 `app/` 目录内，避免被路由系统识别为页面。
- API client、权限判断、纯函数优先写单元测试。
- screen、component、表单、状态优先写 React Native Testing Library 组件测试。
- 登录、首页、文档、Admin guard 使用集成式组件测试覆盖关键路径。
- `expo-secure-store`、`expo-notifications`、文件系统和系统预览能力在 Jest 中使用 mock。
- 不追求无意义快照测试；优先测试权限边界、错误状态、数据契约和用户可观察行为。
- 真机能力不作为单元测试阻塞项，但必须在后续 smoke 阶段验证。

每个新功能的开发顺序：

1. 写失败测试，描述目标行为。
2. 实现最小功能，让测试通过。
3. 重构代码，并保持测试通过。
4. 更新 `mobile/docs/mobile-project-status.md`。

未来工程测试范围：

- TypeScript 类型检查。
- API client 单元测试：envelope、401、403、request id、token 注入。
- Auth 测试：登录、恢复会话、退出清理。
- Role guard 测试：`user` 不能进入 Admin，`super_user` 可以进入 Admin。
- Query 测试：列表加载、空状态、错误状态、刷新和失效。
- Push 真机 smoke：权限请求、token 注册、通知点击路由。
- File preview 真机 smoke：PDF、图片、Office 文件、无权限和失败降级。
- Admin smoke：单条创建、编辑、发布、归档、软删除和二次确认。

## 15. 实施顺序建议

建议按以下顺序创建移动端工程：

1. Expo + TypeScript 工程初始化。
2. 配置 `jest-expo`、Jest、React Native Testing Library 和基础 test scripts。
3. 先写第一个失败测试：登录页或 403 页面渲染。
4. 实现基础路由、主题、通用组件和 403 页面，让测试通过。
5. 先写 API client envelope / 401 / 403 测试，再实现 API client、mock transport、类型和 sample 数据映射。
6. 先写 Auth provider 测试，再实现 secure token、登录和会话恢复。
7. 先写 User Portal vertical slice 测试，再实现首页、文档、培训、个人中心。
8. 先写 Admin guard 测试，再实现 Admin Dashboard 和一个内容管理单条流程。
9. 先写 push token / preview URL mock 测试，再接入通知偏好、preview URL 和系统预览。
10. 覆盖剩余 7 个用户模块和 Admin 模块。
11. 真机 smoke、权限测试和内部 preview build。

## 16. 明确不做

移动端架构第一版不包含：

- Web 前端架构。
- Go 后端分层架构。
- MySQL 迁移设计。
- Docker Compose 运行架构。
- 离线优先编辑和冲突合并。
- 完整论坛发帖、评论和私信。
- 正式应用商店上架流程。
- 批量后台操作。

## 17. 文档维护规则

- 本文档记录当前推荐技术方案。
- 架构可以根据实现、测试、真机行为或后端契约变化调整。
- 每次架构调整必须同步更新 `mobile/docs/mobile-project-status.md` 的架构变更记录。
- 本文档不记录项目进度、已解决问题、未解决问题或下一步状态。
