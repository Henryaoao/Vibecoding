# P01 Central Orchestration

阶段：P01 - 项目脚手架、运行底座与通用合同

目标：先建立共同运行底座，再进入模块业务开发。

当前基准：`main` / `origin/main`。开始任何席位工作前，先 `git fetch --prune` 并确认自己的本地基准来自最新远端。

## 必读

- `AGENTS.md`
- `docs/four-person-omx-team-roadmap/README.md`
- `docs/omx-team-stage-packs/_central/P01/how-to-run.md`
- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/references/omx-decision-policy.md`
- `docs/prd/references/permissions-and-admin-guide.md`
- `docs/prd/phases/foundation/project-scaffold-prd.md`
- `docs/prd/phases/foundation/api-contract-foundation-prd.md`
- `docs/prd/phases/foundation/auth-session-prd.md`
- `docs/prd/phases/foundation/web-shell-prd.md`
- `docs/prd/phases/foundation/app-shell-prd.md`
- `docs/prd/endpoints/web-prd.md`
- `docs/prd/endpoints/app-prd.md`

## 运行顺序

1. D 先单独跑：建立或校准极薄平台基线。
2. B 等 D 放行后单独跑：建立 Web shell 与模块挂载基线。
3. A 和 C 等 B 放行后并行跑。
4. 四人都 push 后进入 P01 合并。

## 席位职责

| 席位 | 分支 | 职责 |
| --- | --- | --- |
| D | `codex/p01-d-platform-runtime-baseline` | 后端、API envelope、认证会话、Docker、PostgreSQL、pgAdmin、健康检查和环境样例。 |
| B | `codex/p01-b-web-shell-baseline` | Web shell、模块挂载点、设计系统基础、通用状态组件。 |
| A | `codex/p01-a-info-publishing-foundation` | 今日公司简报和公司公告墙的基础数据形态、mock 边界和只读接入约定。 |
| C | `codex/p01-c-app-community-finance-foundation` | App shell 状态边界、热帖/新人/财经基础字段、合规展示边界。 |

## 等待条件

- B 不得在 D 未 push 基线前开始。
- A/C 不得在 B 未 push Web shell 基线前开始。
- A/C 可以同时开始，但都必须从 B 的已推送基线分支创建自己的分支。

## 放行信号

D 放行必须回报：

- 分支：`codex/p01-d-platform-runtime-baseline`
- commit SHA
- 验证结果
- 是否触碰真实 `.env`：必须为否
- 是否改变默认端口：必须为否

B 放行必须回报：

- 分支：`codex/p01-b-web-shell-baseline`
- commit SHA
- 从哪个 D commit 创建
- Web shell 挂载约定
- 验证结果

A/C 完成必须回报：

- 分支名
- commit SHA
- 从哪个 B commit 创建
- 修改范围
- 验证结果

## 不要提前做的事

- 不做完整业务模块。
- 不做 Admin 写入。
- 不做 P02 数据库模型扩展。
- 不做 P03 后端模块读取 API。
- 不做 P04 员工门户完整页面。
- 不做 P05/P06 Admin Console 管理能力。
- 不提交真实 `.env`、真实密钥、真实 Teams / Entra 凭据。
- 不引入 `content_admin`、`department_admin`、`system_admin`。
- 不实现 `recent_views`、浏览历史、页面访问轨迹或等价被动行为历史。
- 财经轻资讯不得包含投资建议、买卖建议、个股预测或收益承诺。
