# ProjectM 基础阶段 PRD：API 合同基础

## 1. 文档状态

- 阶段：基础阶段。
- 状态：生效。
- 责任层：ProjectM 基础能力。
- 本文件继承整体项目 PRD 和 OMX 决策策略，不得重写稳定产品规则。

## 2. 目标

定义 Go REST API 的通用合同、错误、分页、认证和跨端消费规则，避免模块 PRD 重复发明基础协议。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。

## 4. 范围内

- REST 路径命名、响应信封、错误结构、分页/排序/筛选参数、认证头和管理命名空间。
- 跨 Web 与 App 的合同消费原则。
- 合同变更登记机制。

## 5. 范围外

- 七个 MVP 模块的具体端点字段清单。
- OpenAPI 生成器或代码生成工具选择。
- 性能压测脚本。

## 6. 依赖与前置条件

- 用户已确认 ProjectM 作为多端内部公司门户的定位。
- MVP 模块、角色模型和合规边界继承整体项目 PRD。
- 技术栈方向继承 AGENTS.md 与决策策略。

## 7. 需求

1. API 必须区分员工端读取合同和 `super_user` 管理合同。
2. 管理接口默认位于 `/api/v1/admin/*` 或由 API 基础阶段确认的等价管理命名空间。
3. 错误响应必须能表达未登录、会话过期、无权限、参数错误、资源不存在和业务状态冲突。
4. 分页、排序和筛选行为必须可被 Web 与 App 同时消费。
5. 任何模块合同变更都必须记录到 `docs/prd/phases/modules/contract-register.md`。
6. Web 浏览器会话 cookie 名称为 `projectm_session`。浏览器请求必须携带该 cookie；认证失败仍按统一错误信封返回 401 或会话过期语义。开发期兼容头不得成为正式权限事实来源。

## 8. 验收标准

- 模块后端 PRD 可以继承一套统一 API 合同规则。
- Web/App PRD 不需要自行定义权限事实来源。
- 合同变更有明确登记位置。
- Web 登录会话 cookie 名称可被后续前端、后端和 QA 任务直接引用。

## 9. 验证指针

文档阶段验证应检查本文件是否继承整体 PRD、决策策略和权限参考；是否未引入旧角色、浏览历史、财经违规内容或真实密钥；是否足够让 OMX 独立规划该基础阶段。实现阶段验证由对应实现/QA 产物承接。

## 10. OMX 交接

执行本阶段时，先确认当前仓库状态和已存在代码，不要假设尚未创建的结构已经完成。若实现方案需要改变已接受技术栈、端侧边界或安全边界，先向用户确认。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
