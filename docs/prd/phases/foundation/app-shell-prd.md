# ProjectM 基础阶段 PRD：App 壳层

## 1. 文档状态

- 阶段：基础阶段。
- 状态：生效。
- 责任层：ProjectM 基础能力。
- 本文件继承整体项目 PRD 和 OMX 决策策略，不得重写稳定产品规则。

## 2. 目标

定义 App 端导航、认证、平台状态和技术基线，让移动端模块体验能独立于浏览器页面结构执行。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。

## 4. 范围内

- React Native + TypeScript + Expo-managed workflow 技术基线。
- 移动端导航、认证状态、离线/弱网处理、错误/空状态和个人入口。
- App 作为员工门户的跨平台体验基线。

## 5. 范围外

- 移动端管理写入、移动端 Admin Console 或用户/角色管理。
- 具体模块 UI 文案。
- 后端 API 或数据库事实来源。

## 6. 依赖与前置条件

- 用户已确认 ProjectM 作为多端内部公司门户的定位。
- MVP 模块、角色模型和合规边界继承整体项目 PRD。
- 技术栈方向继承 AGENTS.md 与决策策略。

## 7. 需求

1. App 必须使用 React Native + TypeScript + Expo-managed workflow，除非用户确认改变技术基线。
2. App 面向 `user` 与 `super_user` 的员工门户使用场景，但不承载管理写入。
3. 所有 `super_user` 管理和写入工作流由 Web Admin Console 承担。
4. App 必须清晰处理未登录、会话过期、无权限、离线、弱网、重试、空状态和错误状态。
5. App 不得默认缓存敏感文档或形成页面浏览历史。

## 8. 验收标准

- 后续 App 模块 PRD 能继承统一移动端壳层与技术栈。
- App 管理写入边界被明确排除。
- 移动端状态处理要求足够让 OMX 独立规划执行。

## 9. 验证指针

文档阶段验证应检查本文件是否继承整体 PRD、决策策略和权限参考；是否未引入旧角色、浏览历史、财经违规内容或真实密钥；是否足够让 OMX 独立规划该基础阶段。实现阶段验证由对应实现/QA 产物承接。

## 10. OMX 交接

执行本阶段时，先确认当前仓库状态和已存在代码，不要假设尚未创建的结构已经完成。若实现方案需要改变已接受技术栈、端侧边界或安全边界，先向用户确认。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
