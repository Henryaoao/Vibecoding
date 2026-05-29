# ProjectM 移动端 PRD 对齐架构与执行指南

## 1. 文档状态

- 状态：当前生效的移动端开发指南。
- 范围：仅覆盖 `mobile/` React Native + TypeScript + Expo App。
- 需求事实来源：`docs/prd/` 与当前用户明确指令。
- 替代关系：当旧移动端本地 PRD、旧架构说明与 `docs/prd/` 冲突时，以本文档和 `docs/prd/` 为准。

本文档不修改 PRD 事实。如果需求变化需要修改 PRD，必须先询问用户并确认具体改动范围。

## 2. 必读 PRD 顺序

移动端开发前，只读取当前任务必要的 PRD：

1. `AGENTS.md`
2. `docs/prd/README.md`
3. `docs/prd/projectm-overall-prd.md`
4. `docs/prd/references/omx-decision-policy.md`
5. `docs/prd/endpoints/app-prd.md`
6. `docs/prd/phases/foundation/app-shell-prd.md`
7. UI、布局、组件或视觉实现任务读取 `mobile/docs/mobile-ui-visual-reference.md`。
8. 登录、退出、会话、角色、401 或 403 相关任务读取 `docs/prd/phases/foundation/auth-session-prd.md`。
9. API client、错误处理或跨端合同相关任务读取 `docs/prd/phases/foundation/api-contract-foundation-prd.md`。
10. 模块开发读取对应模块的 App 前端 PRD 和后端 PRD。
11. 模块合同可能变化时读取 `docs/prd/phases/modules/contract-register.md`。

Web PRD 只用于理解 Web 端负责的 Admin Console 或跨端一致性，不得把 Web Admin Console 范围带入 App。

## 3. 当前移动端范围

App 是 `user` 与 `super_user` 都可使用的员工门户。

当前 MVP 范围：

- 登录、退出、会话恢复、401、403、加载、空状态、错误、重试、离线和弱网状态。
- 首页摘要、今日公司简报和模块入口。
- 七个员工门户模块：
  - 今日公司简报
  - 公司公告墙
  - 员工论坛热帖
  - 新人专区
  - 财经轻资讯
  - 文档中心
  - 培训中心
- 当前认证用户自己的新人任务状态和培训进度更新。
- 文档搜索、详情、有权限预览、下载和外部打开降级。
- 财经轻资讯必须展示非投资建议边界。

暂时搁置的能力：

- 推送通知。
- 通知偏好。
- 收藏。
- 个人下载记录。
- 移动端 Admin Console 和全部移动端管理写入流程。

搁置文件位于 `mobile/docs/parked/features/`。这些文件只保留用于未来恢复，当前不得作为开发参考。

## 4. 架构基线

| 主题 | 当前方案 |
| --- | --- |
| App 技术栈 | React Native + TypeScript + Expo-managed workflow |
| 路由 | `mobile/app/` 下的 Expo Router 文件路由 |
| 服务端状态 | TanStack Query |
| 会话存储 | 仅使用 `expo-secure-store` 存储认证 token |
| API 访问 | 共享 API client、统一 envelope、mock transport fallback、真实 base URL 时使用 fetch transport |
| 文件能力 | 权限校验后的 preview URL、下载、分享/外部打开降级，403 不泄漏敏感元数据 |
| 视觉参考 | 粉色像素风，详见 `mobile/docs/mobile-ui-visual-reference.md` |
| 推送通知 | 已搁置，不导入通知 helper，不注册设备 |
| Admin Console | 移动端已搁置；所有 `super_user` 管理写入归 Web Admin Console |
| 角色 | 仅 `user` 与 `super_user` |

App 只消费后端合同，不定义数据库事实、授权事实或 Admin 生命周期规则。

## 5. 路由结构

当前 active route 应聚焦员工门户：

```text
mobile/app/
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
│   ├── index.tsx
│   ├── briefs.tsx
│   ├── announcements.tsx
│   ├── forum-hot.tsx
│   ├── newcomer.tsx
│   └── finance.tsx
├── briefs/[id].tsx
├── announcements/[id].tsx
├── forum-hot/[id].tsx
├── newcomer/[id].tsx
├── finance/[id].tsx
├── documents/[id].tsx
├── training/[id].tsx
└── me/
    ├── training.tsx
    └── newcomer-tasks/
```

用户重新启用相关需求前，不得新增 active `admin/`、`me/notifications`、`me/favorites` 或 `me/downloads` 路由。

## 6. API 与状态规则

- 所有业务请求都经过 `src/api/client.ts`。
- API 响应保持后端 envelope：`code`、`message`、`data`、`request_id`。
- Bearer token 只能由共享 client 注入。
- 401 清理会话并回到认证流程。
- 403 展示统一 forbidden 或资源级权限状态。
- Query key 按业务域组织，例如 `["mobile", "documents"]`。
- mutation 成功后只更新或失效最小相关 query 范围。
- 不把服务端数据重复存进额外全局 store。
- 不记录 token、密码、文档正文、上传内容或敏感响应体。

共享文件中可能暂时保留已搁置功能的 endpoint 常量、mock 数据或类型定义，因为它们和 active 模块合同混在同一文件里。它们不是当前需求，后续只有在安全拆分时再清理。

## 7. 模块执行说明

每个模块按对应模块 App 前端 PRD 实现，并消费对应后端 PRD。

| 模块 | 移动端执行要求 |
| --- | --- |
| 今日公司简报 | 当前简报、历史列表/详情、弱网重试 |
| 公司公告墙 | 列表、详情、搜索/筛选、空状态、错误状态、权限状态 |
| 员工论坛热帖 | 热帖列表、详情；只有后端合同支持时才做允许的轻量互动 |
| 新人专区 | 资料列表/详情，以及当前用户自己的任务状态更新 |
| 财经轻资讯 | 列表、详情、分类或标签展示，明确非投资建议边界 |
| 文档中心 | 搜索/筛选、元数据详情、有权限预览、下载和打开降级 |
| 培训中心 | 课程列表/详情、材料入口，以及当前用户自己的进度更新 |

如果 App 需要后端 PRD 未定义的字段、错误码、筛选条件或 mutation，必须先走合同变更路径；涉及 PRD 范围变化时先询问用户。不要在 App 端自行发明 API 事实。

## 8. 安全与隐私

- 后端授权是事实来源。
- 前端隐藏入口只是体验优化。
- App 不展示也不实现移动端 Admin Console。
- `/api/v1/admin/*` 仍由后端保护，并由 Web Admin Console 消费。
- 不实现浏览历史、`recent_views`、被动阅读历史或页面访问轨迹。
- 文档预览/下载在无权限时不得暴露文件名、MIME type、URL 或下载地址。
- 除非 PRD 明确要求，不在安全存储中保存认证 token 之外的数据。
- 财经页面不得包含股票推荐、买卖建议、个股预测或收益承诺。

## 9. 开发流程

1. 读取必要的 PRD 切片。
2. 判断任务属于 foundation、模块 App 前端、API client、认证会话还是文件能力。
3. 确认该能力是 active 范围，不在搁置区。
4. UI 或布局任务先读取 `mobile/docs/mobile-ui-visual-reference.md`，按粉色像素风参考实现。
5. 为可观察行为、API 合同或权限边界添加/更新针对性测试。
6. 实现满足 active PRD 的最小移动端改动。
7. 先跑相关测试，再对共享改动跑 typecheck。
8. 只有架构、active 范围或开发说明变化时才更新移动端文档。

除非用户明确要求并确认具体范围，不得修改 PRD。

## 10. 验证清单

移动端改动按相关范围验证：

- `npm --prefix mobile run typecheck`
- 变更涉及的 API、auth、screen 或 module targeted Jest tests。
- `git diff --check -- mobile`
- active route 扫描确认没有导入搁置功能。
- UI 任务确认符合 `mobile/docs/mobile-ui-visual-reference.md` 的粉色像素风、描边、硬阴影和布局规则。
- 财经页面保留合规边界。
- 文档预览/下载仍遵守授权和失败状态。
- 不新增 `user` / `super_user` 之外的角色。
- 不新增浏览历史或等价被动追踪。

## 11. 搁置功能恢复规则

未来恢复搁置功能时：

1. 先让用户确认该功能重新进入 active 范围。
2. 如果影响 App 范围、Admin 边界、通知、收藏或个人历史记录，先确认或更新 PRD 路径。
3. 从 `mobile/docs/parked/features/<feature>/` 对应分类把文件移回原位。
4. 重新连接路由、imports、API functions、mock 和测试。
5. targeted tests 与 typecheck 通过后，才能把它视为 active 功能。
