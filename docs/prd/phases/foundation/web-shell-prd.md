# ProjectM 基础阶段 PRD：Web 壳层

## 1. 文档状态

- 阶段：基础阶段。
- 状态：生效。
- 责任层：ProjectM 基础能力。
- 本文件继承整体项目 PRD 和 OMX 决策策略，不得重写稳定产品规则。

## 2. 目标

定义 Web 端应用壳、路由、认证保护、员工门户入口和 Admin Console 基础，让模块页面能按统一结构接入。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。

## 4. 范围内

- React + TypeScript + Vite Web 技术基线。
- 员工门户壳层、认证守卫、错误/空状态框架、导航入口和 Admin Console 壳层。
- `super_user` 管理入口的前端呈现与后端授权配合。

## 5. 范围外

- 具体模块页面细节和 UI 文案。
- App 移动端导航。
- 生产部署细节。

## 6. 依赖与前置条件

- 用户已确认 ProjectM 作为多端内部公司门户的定位。
- MVP 模块、角色模型和合规边界继承整体项目 PRD。
- 技术栈方向继承 AGENTS.md 与决策策略。

## 7. 需求

1. Web 必须使用 React + TypeScript + Vite 作为当前接受技术栈。
2. Web 员工门户面向 `user` 与 `super_user`；Web Admin Console 仅面向 `super_user`。
3. 前端路由保护不得替代后端授权。
4. 壳层必须为七个 MVP 模块提供可插入的导航和页面区域。
5. 页面结构可以被阶段 PRD 细化，但具体 UI 文案不属于整体项目 PRD。

## 8. 验收标准

- 后续 Web 模块 PRD 能直接接入统一 Web 壳层。
- Admin Console 基础位置清晰且未扩展角色模型。
- 没有把 App 端交互或移动端要求塞入 Web 壳层 PRD。

## 9. 验证指针

文档阶段验证应检查本文件是否继承整体 PRD、决策策略和权限参考；是否未引入旧角色、浏览历史、财经违规内容或真实密钥；是否足够让 OMX 独立规划该基础阶段。实现阶段验证由对应实现/QA 产物承接。

## 10. OMX 交接

执行本阶段时，先确认当前仓库状态和已存在代码，不要假设尚未创建的结构已经完成。若实现方案需要改变已接受技术栈、端侧边界或安全边界，先向用户确认。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
