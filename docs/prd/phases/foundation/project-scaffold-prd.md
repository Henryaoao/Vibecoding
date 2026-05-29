# ProjectM 基础阶段 PRD：项目脚手架

## 1. 文档状态

- 阶段：基础阶段。
- 状态：生效。
- 责任层：ProjectM 基础能力。
- 本文件继承整体项目 PRD 和 OMX 决策策略，不得重写稳定产品规则。

## 2. 目标

定义 ProjectM 实现开始前的仓库、配置、运行入口和文档对齐要求，让后续 Web、App、后端和数据库工作能在同一工程边界内展开。

## 3. 事实来源链接

- 整体项目 PRD：`docs/prd/projectm-overall-prd.md`。
- PRD 索引：`docs/prd/README.md`。
- 决策策略：`docs/prd/references/omx-decision-policy.md`。
- 阶段 PRD 合同：`docs/prd/phases/README.md`。
- 权限与 Admin 参考：`docs/prd/references/permissions-and-admin-guide.md`。

## 4. 范围内

- 仓库目录约定、基础包管理入口、环境变量样例、Docker Compose 服务边界和文档入口。
- Web、App、后端、数据库未来实现目录的占位规划。
- 本地开发默认端口约定：frontend `3000`、backend `8080`、postgres `5432`、pgAdmin `5050`。

## 5. 范围外

- 具体业务模块实现。
- 生产部署细节、云资源配置和密钥管理实作。
- 完整测试用例或 QA 脚本。

## 6. 依赖与前置条件

- 用户已确认 ProjectM 作为多端内部公司门户的定位。
- MVP 模块、角色模型和合规边界继承整体项目 PRD。
- 技术栈方向继承 AGENTS.md 与决策策略。

## 7. 需求

1. 脚手架必须支持后续 React + TypeScript + Vite Web、React Native + TypeScript + Expo App、Go REST API 和 PostgreSQL 16。
2. 不得提交真实 `.env` 密钥；只能提交样例配置。
3. 文档入口必须指向 `docs/prd/README.md`，避免让 `.omx/` 工作流产物成为长期产品事实来源。
4. 如果现有源代码结构与本 PRD 冲突，必须先说明差异并获得用户确认后再迁移。

## 8. 验收标准

- 后续实现者能从仓库入口识别 Web、App、后端、数据库和文档位置。
- 本地服务端口与 ProjectM 约定一致，pgAdmin 仍为 `5050`。
- 没有真实密钥或生产部署细节被写入 PRD。

## 9. 验证指针

文档阶段验证应检查本文件是否继承整体 PRD、决策策略和权限参考；是否未引入旧角色、浏览历史、财经违规内容或真实密钥；是否足够让 OMX 独立规划该基础阶段。实现阶段验证由对应实现/QA 产物承接。

## 10. OMX 交接

执行本阶段时，先确认当前仓库状态和已存在代码，不要假设尚未创建的结构已经完成。若实现方案需要改变已接受技术栈、端侧边界或安全边界，先向用户确认。

## 11. 决策策略继承

`docs/prd/references/omx-decision-policy.md` 中的硬红线全部适用。改变模块边界、角色规则、端侧范围、App 技术栈或合规边界需要用户确认。
