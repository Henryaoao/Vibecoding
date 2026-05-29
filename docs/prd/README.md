# ProjectM PRD 事实来源索引

## 1. 目的

`docs/prd/` 是 ProjectM 的产品需求事实来源。这里保存稳定项目基调、端侧约束、参考规则和可独立执行的阶段 PRD，让 OMX 后续规划、执行和验收时不需要依赖一份过大的 Web 专用文档。

所有 PRD 文档以中文为主；代码标识符、路径、角色代码、API 路径和技术栈名称保留英文原文。

## 2. 事实来源优先级

当文档之间出现冲突时，按以下顺序处理：

1. 用户在当前对话中的明确指令。
2. `docs/prd/projectm-overall-prd.md` 中的稳定项目规则。
3. `docs/prd/references/omx-decision-policy.md` 中的红线和确认策略。
4. 端侧 PRD：`docs/prd/endpoints/web-prd.md` 或 `docs/prd/endpoints/app-prd.md`。
5. 参考文档：权限、样例数据、合同登记等。
6. 具体阶段 PRD。
7. `.omx/` 下的计划和执行产物。

`.omx/` 只记录工作流过程，不是长期产品事实来源。

## 3. 层级原则

- 整体项目 PRD 只写稳定项目基调，不放测试用例、具体 UI 文案、部署细节、API 字段清单或数据库字段清单。
- 端侧 PRD 只写该端需要知道的技术栈、信息架构、交互和边界。
- 阶段 PRD 必须继承整体 PRD 与决策策略，只定义自己负责的可交付切片。
- 数据库阶段 PRD 定义数据事实、持久化生命周期、约束、索引和样例形态。
- 后端阶段 PRD 定义 API、授权、验证、生命周期和服务端合同。
- Web 与 App 阶段 PRD 消费后端合同；可以提出合同变更，但不得静默重写合同事实。
- 每份阶段 PRD 必须能被 OMX 独立规划、执行和验收。

## 4. 文档地图

| 路径 | 状态 | 作用 |
| --- | --- | --- |
| `docs/prd/projectm-overall-prd.md` | 生效 | ProjectM 稳定项目宪章和整体产品基调。 |
| `docs/prd/endpoints/web-prd.md` | 生效 | Web 端技术栈、浏览器信息架构、Web Admin Console 和页面结构边界。 |
| `docs/prd/endpoints/app-prd.md` | 生效 | App 端技术栈、移动端信息架构、导航、平台状态和管理写入边界。 |
| `docs/prd/references/permissions-and-admin-guide.md` | 生效 | `user` / `super_user` 权限和 Web Admin Console 使用规则。 |
| `docs/prd/references/sample-data.md` | 生效 | 样例内容、参考数据和演示用业务语义。 |
| `docs/prd/references/omx-decision-policy.md` | 生效 | OMX 执行红线、默认策略和必须向用户确认的事项。 |
| `docs/prd/phases/README.md` | 生效 | 阶段 PRD 模板、执行合同和层级职责。 |
| `docs/prd/phases/foundation/` | 生效 | 脚手架、认证会话、API 合同、Web 壳层、App 壳层。 |
| `docs/prd/phases/modules/` | 生效 | 七个 MVP 模块按数据库、后端、Web 前端、App 前端拆分的阶段 PRD。 |

## 5. 必须向用户确认的改动

以下内容不得由代理自行改变：

- 项目定位或目标用户。
- 七个 MVP 模块的增删或合并边界。
- 角色模型：只能是 `user` 与 `super_user`。
- 财经轻资讯的合规边界。
- Web/App 端侧文档范围。
- App 技术栈或 App 管理写入边界。
- 会导致生产部署、安全边界或数据合规显著变化的技术方案。

## 6. OMX 推荐阅读顺序

执行任何阶段任务前，按以下顺序读取：

1. `AGENTS.md`。
2. 本索引。
3. `docs/prd/projectm-overall-prd.md`。
4. `docs/prd/references/omx-decision-policy.md`。
5. 涉及权限时读取 `docs/prd/references/permissions-and-admin-guide.md`。
6. 涉及样例内容时读取 `docs/prd/references/sample-data.md`。
7. 涉及 Web 或 App 时读取对应端侧 PRD。
8. 当前阶段 PRD 及其依赖阶段 PRD。
9. 如涉及模块接口变更，读取并更新 `docs/prd/phases/modules/contract-register.md`。

## 7. 维护规则

- PRD 变更必须保持中文优先。
- 阶段 PRD 标题结构如需调整，必须同步更新 `docs/agents/verification.md` 中的校验规则。
- 模块需求变更通常要同时检查数据库、后端、Web 前端、App 前端四层；除非用户明确只改某一层。
- 不要在 PRD 中加入完整测试用例；验收标准可以写，测试设计应进入 QA 或实现阶段文档。
