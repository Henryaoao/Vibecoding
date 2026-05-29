# ProjectM 模块 PRD：文档中心 Web 前端层

## 1. 文档状态

- 阶段：模块 Web 前端层。
- 模块：文档中心。
- 状态：生效。
- 责任层：React + TypeScript + Vite Web。
- 本文件继承 ProjectM 稳定规则，不得重写角色、端侧范围或合规边界。

## 2. 目标

定义 `document-center` 模块在 Web 员工门户和 Web Admin Console 中的浏览器端行为，使 Web 能在不重写后端合同的前提下交付 文档中心 能力。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 模块合同登记表：`docs/prd/phases/modules/contract-register.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。
- Web 端 PRD：`docs/prd/endpoints/web-prd.md`。
- Web 壳层 PRD：`docs/prd/phases/foundation/web-shell-prd.md`。
- 后端 PRD：`docs/prd/phases/modules/document-center/backend-prd.md`。

## 4. 范围内

- Web 员工端的列表、详情、筛选/搜索、空状态、错误状态和允许的互动。
- Web Admin Console 中本模块的管理入口和生命周期操作。
- 调用后端合同、处理权限/会话错误和展示业务状态。
- 与 Web 壳层导航和 Admin 壳层的接入。

## 5. 范围外

- App 移动端导航和平台状态。
- 后端 API 事实、数据库事实和授权真相。
- 具体 UI 文案、视觉样式和像素级组件设计。
- 完整测试用例或自动化脚本。

## 6. 依赖与前置条件

- Web 技术栈为 React + TypeScript + Vite。
- Web 壳层、认证守卫和 Admin 壳层已经规划或实现。
- 后端模块合同已定义可见数据、权限、错误和管理动作。
- `super_user` 管理能力必须通过后端授权确认。

## 7. 需求

### 7.1 Web 员工门户行为

1. Web 员工端提供文档检索、筛选、详情和下载入口；Web Admin Console 提供文档管理与授权。
2. Web 必须展示加载、空数据、错误、无权限、会话过期和重试状态。
3. Web 必须按后端合同展示当前用户可见内容。
4. Web 不得实现浏览历史、最近浏览或页面访问轨迹。

### 7.2 Web Admin Console 行为

1. Web Admin Console 中本模块管理入口仅对 `super_user` 展示。
2. 管理写入必须调用后端管理 API，不能只在前端修改状态。
3. 管理列表应能表达草稿、已发布、归档、隐藏或下线等后端确认状态。
4. 前端必须处理管理 API 的 401、403、参数错误、状态冲突和资源不存在。

## 8. 验收标准

- Web 员工端能力能支持 搜索、筛选、查看文档元数据，并下载自己有权限访问的文档。
- Web Admin Console 能支持 上传、编辑、授权、发布、归档和下线文档。
- Web 未重写后端权限事实，管理写入均依赖后端授权。
- `user` 无法进入本模块管理能力。
- 未加入浏览历史或旧角色。

## 9. 验证指针

文档阶段验证应检查本文件是否链接 Web 端 PRD、后端 PRD、整体 PRD、决策策略和合同登记表；是否保留两角色模型；是否避免浏览历史；财经模块是否保留非投资建议边界。实现阶段验证由 Web 单元/集成/e2e 测试承接。

## 10. OMX 交接

执行时先读取 Web 壳层 PRD 和本模块后端 PRD。若页面需要后端未提供的字段或状态，不要在 Web 端假造合同；应更新后端 PRD 与合同登记表。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
