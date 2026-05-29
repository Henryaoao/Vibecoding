# ProjectM 模块 PRD：今日公司简报 App 前端层

## 1. 文档状态

- 阶段：模块 App 前端层。
- 模块：今日公司简报。
- 状态：生效。
- 责任层：React Native + TypeScript + Expo App。
- 本文件继承 ProjectM 稳定规则，不得重写角色、端侧范围或合规边界。

## 2. 目标

定义 `today-briefing` 模块在移动端 App 中的独立员工门户行为，使 App 能基于后端合同交付 今日公司简报 的移动端体验。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 模块合同登记表：`docs/prd/phases/modules/contract-register.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。
- App 端 PRD：`docs/prd/endpoints/app-prd.md`。
- App 壳层 PRD：`docs/prd/phases/foundation/app-shell-prd.md`。
- 后端 PRD：`docs/prd/phases/modules/today-briefing/backend-prd.md`。

## 4. 范围内

- App 中本模块的移动端列表、详情、筛选/搜索、空状态、错误状态和允许的员工互动。
- 调用后端合同、处理认证/权限/离线/弱网/重试状态。
- `user` 与 `super_user` 作为员工门户用户时的读取或本人数据更新。
- 与 App 壳层导航、会话和平台状态的接入。

## 5. 范围外

- 移动端管理写入、移动端 Admin Console、用户管理、角色分配和内容管理。
- 后端 API 事实、数据库事实和授权真相。
- 浏览器路由、Web 组件和 Web 页面结构。
- 具体 UI 文案、视觉样式和完整测试用例。

## 6. 依赖与前置条件

- App 技术栈为 React Native + TypeScript + Expo-managed workflow。
- App 壳层、认证状态、导航和弱网处理已经规划或实现。
- 后端模块合同已定义可见数据、权限、错误和允许动作。
- 管理写入不在 App 范围内。

## 7. 需求

### 7.1 App 员工门户行为

1. App 提供移动端今日简报入口、简报详情、历史列表和弱网重试。
2. App 必须用移动端合适方式展示加载、空数据、错误、无权限、会话过期、离线、弱网和重试状态。
3. App 必须按后端合同展示当前用户可见内容或允许的本人数据更新。
4. App 不得实现浏览历史、最近浏览或页面访问轨迹。
5. App 不得加入任何管理写入；`super_user` 管理工作流不进入 App。

### 7.2 通用 App 规则

1. App 消费后端合同，不定义授权事实来源。
2. App 不得在未确认安全策略外缓存敏感数据。
3. App 技术栈保持 React Native + TypeScript + Expo-managed workflow。
4. 个人任务或个人进度更新只能影响当前认证用户自己的记录。
5. 所有管理写入都由 Web Admin Console 承担。

## 8. 验收标准

- App 需求能支持 查看当日简报、重点摘要、历史简报和关联入口。
- App PRD 独立描述移动端行为，不需要实现者读取浏览器页面结构才能执行。
- App 消费后端权限和生命周期合同，不重写权限事实。
- App 不包含移动端管理写入。
- App 技术栈保持 React Native + TypeScript + Expo-managed workflow。

## 9. 验证指针

文档阶段验证应检查本文件是否链接 App 端 PRD、App 壳层 PRD、后端 PRD、整体 PRD、决策策略和合同登记表；是否保留两角色模型；是否避免浏览历史；财经模块是否保留非投资建议边界。实现阶段验证由 App 单元/集成/e2e 或手工验收承接。

## 10. OMX 交接

执行时先读取 App 壳层 PRD 和本模块后端 PRD。若移动端体验需要后端未提供的字段或状态，应更新后端 PRD 与合同登记表，不要在 App 端假造合同。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。当前 App 技术栈为 React Native + TypeScript + Expo-managed workflow，移动端管理写入被排除。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
