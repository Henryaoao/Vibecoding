# ProjectM Mobile Agent Workflow

## 1. 文档目的

本文档定义 ProjectM Mobile 的多 Agent 工作流。它只覆盖移动端协作流程，不改变产品需求、不改变技术架构、不创建新的应用角色。

目标：

- 当前 Codex 对话默认作为移动端 Orchestrator Agent 入口。
- 新需求先由 Orchestrator Agent 接收、澄清、判断路由并产出 Requirement Handoff。
- Requirement Handoff 标记 `Implementation-ready: Yes` 后，等待用户确认，再派发 Development Agent。
- Development Agent 必须使用 TDD：先写失败测试，再实现，再验证。
- Development Agent 完成后自动派发 Test Agent。
- Test Agent 如果发现问题，按问题类型回流到 Orchestrator、Architecture、Development 或 Security。
- 所有状态变化同步记录到 `mobile/docs/mobile-project-status.md`。

## 2. 可复用项目资产

本工作流直接引用项目已有 agent / skill 资产，不复制到 `mobile/` 内，也不修改这些外部文件。

| 资产 | 用途 |
| --- | --- |
| `docs/agents/projectm-agent-specs.md` | ProjectM 通用 agent 规格、职责、输入输出、停止条件。 |
| `docs/agents/omx-workflows.md` | OMX / native sub-agent 路由规则。 |
| `docs/agents/phase-02/02.4-runtime-boundaries.md` | Codex App、OMX tmux、native subagents 的能力边界。 |
| `docs/agents/phase-02/02.10-qa-security-acceptance-skill-chain.md` | QA、安全、权限和验收链路。 |
| `custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md` | 可复用 portable skills 清单。 |
| `mobile/docs/mobile-architecture.md` | 移动端架构和 TDD / test-first 策略。 |

运行边界：

- 本阶段暂时不使用 Codex native sub-agent；除非用户后续明确恢复，否则不把 native sub-agent 作为默认派发目标。
- 当前优先使用 ProjectM 已配置的 OMX agents、OMX workflow skills、installed skills 和 MCP；当前对话只作为 Orchestrator / 控制流入口。
- Orchestrator Agent 不应把非平凡工作全部自己做完。除非是很小的单文件整理、明确的紧急修复、或 OMX runtime 不可用，否则必须先把具体工作路由到对应专业 agent。
- `$team` live panes 只在真实 OMX tmux runtime 可用时使用。需要并行或长任务时，优先使用 `omx team` 或其他项目已有 OMX workflow。
- 如果 OMX runtime 不可用，当前对话作为 fallback Orchestrator，结合已安装 ProjectM skills 和项目文档直接执行，并在最终说明中标记为 fallback。
- Agent、skill、MCP 的选择优先使用 ProjectM 已配置资产；如果项目内没有对应配置，Orchestrator Agent 必须先询问用户，是使用 Codex native 能力、安装新工具，还是继续手动执行。
- `omx team` CLI 使用单个 `N:agent-type` 启动 worker，例如 `omx team 2:verifier "<task>"`；不要写成 `1:analyst 1:verifier "<task>"`，该形式会只识别第一个 agent spec，其余文本会进入任务描述。需要混合职责时，由 Orchestrator 拆分为清晰的 handoff、独立 team，或先确认 OMX 支持的启动语法。
- UI 截图式 smoke / visual walkthrough 暂由用户人工测试；Orchestrator 不主动逐页截图验证，除非用户明确要求。
- 移动端当前需求以 `docs/prd/` 当前事实来源为准；`mobile/docs/parked/` 内历史文档已搁置，不得使用或引用。

## 3. 当前可用 OMX Agents

当前本机 `omx agents list` 可用的 user-scope agents：

| Agent | 用途 |
| --- | --- |
| `explore` | 快速仓库检索、文件/符号定位、现状发现。 |
| `analyst` | 需求澄清、验收标准、隐藏约束。 |
| `planner` | 任务排序、执行计划、风险和依赖。 |
| `architect` | 系统设计、模块边界、接口和长期权衡。 |
| `debugger` | 根因分析、回归隔离、失败诊断。 |
| `executor` | 代码实现、重构、功能开发。 |
| `verifier` | 完成证据、声明验证、测试充分性。 |
| `code-reviewer` | 综合代码审查、正确性/维护性/安全/性能风险。 |
| `dependency-expert` | SDK、包、框架、版本和替换方案评估。 |
| `test-engineer` | 测试策略、覆盖设计、测试实现、稳定性。 |
| `designer` | UX/UI 架构、交互设计、视觉问题评审。 |
| `writer` | 文档、迁移说明、用户指引。 |
| `git-master` | 提交策略、历史卫生、分支/推送安全。 |
| `researcher` | 外部官方文档和版本相关研究。 |
| `critic` | 对计划、设计、假设做反向挑战。 |
| `vision` | 截图、图像、图表和视觉证据分析；当前仅在用户要求视觉检查时使用。 |
| `prometheus-strict-metis` | Prometheus Strict 需求访谈和歧义映射。 |
| `prometheus-strict-momus` | Prometheus Strict 对抗式计划批判。 |
| `prometheus-strict-oracle` | Prometheus Strict 实施就绪验证。 |
| `scholastic` | 本体/分类错误、隐藏假设和推理审查。 |
| `team-executor` | 受监督 team 执行；通常由 OMX team runtime 内部使用。 |
| `code-simplifier` | 代码清理简化；通常作为内部/后处理用途。 |

## 4. 移动端职责映射

第一版复用项目已有 agent 类型，不新增独立角色名。移动端角色名称只是业务协作标签，具体执行优先映射到 OMX agent。

| Agent | 职责 | OMX 映射 | Read First | 可编辑范围 | 输出 |
| --- | --- | --- | --- | --- | --- |
| Orchestrator Agent | 总入口、需求澄清、路由决策、交接、回流控制。 | 当前对话控制流。 | `docs/prd/` 当前事实来源、`mobile/docs/mobile-architecture.md`、`mobile/docs/mobile-project-status.md`、项目 agent 资产。 | 需求变化时先确认 PRD 修改范围；架构变化时改 architecture；状态变化改 status。 | Requirement Handoff、派发决策、回流决策。 |
| Product / Requirement Agent | 需求、范围、验收标准、非目标。 | `analyst`，复杂歧义时 `prometheus-strict-metis`。 | PRD、权限指南、status。 | 需求变化时改 PRD；状态变化改 status。 | Requirement Handoff。 |
| Planning Agent | 阶段计划、任务拆分、依赖排序。 | `planner` + `critic`。 | architecture、status、当前代码。 | 计划类文档和 status。 | Plan Handoff。 |
| Architecture Agent | 技术方案、模块边界、API contract、风险。 | `architect`，必要时 `dependency-expert`。 | `mobile/docs/mobile-architecture.md`、当前 mobile 代码、Requirement Handoff。 | `mobile/docs/mobile-architecture.md`、status。 | Architecture Handoff。 |
| Design Agent | 移动端交互、页面状态、原型评审。 | `designer`，需要看图时 `vision`。 | PRD、prototype spec、当前 screens。 | `mobile/docs/mobile-prototype-spec.md`、status。 | Design Handoff 或评审记录。 |
| Development Agent | TDD 实现移动端功能。 | `executor`。 | Requirement / Architecture Handoff、architecture、当前代码。 | `mobile/app/`、`mobile/src/`、测试文件、status。 | Development Handoff。 |
| Debug Agent | 失败根因、回归定位、环境诊断。 | `debugger`。 | 失败日志、测试结果、相关代码。 | 修复建议、必要时测试/代码补丁。 | Debug Report。 |
| Test Agent | 独立验收、失败定位、回流建议。 | `test-engineer` + `verifier`。 | Requirement Handoff、Development Handoff、changed files。 | 测试文件和 status，除非任务只要求只读验收。 | QA Report。 |
| Review Agent | 代码审查、维护性、安全/性能风险汇总。 | `code-reviewer`，必要时 `critic`。 | diff、关键代码、测试结果。 | 只读 review 或小范围修复建议。 | Review Findings。 |
| Security Agent | 鉴权、权限、token、文件权限、财经合规。 | `code-reviewer` + security skills。 | PRD、权限指南、auth/api/files/admin 改动。 | 安全相关测试、status；架构变化需同步 architecture。 | Security Findings。 |
| Dependency Agent | Expo/RN/库版本、CLI、安装和兼容性。 | `dependency-expert` + `researcher`。 | package files、官方文档、架构。 | 依赖建议、升级/替换方案。 | Dependency Report。 |
| Documentation Agent | 文档整理、状态同步、说明输出。 | `writer`。 | docs、status、handoff。 | docs/status。 | Documentation Handoff。 |
| Git Agent | 分支安全、diff、提交、推送准备。 | `git-master`。 | git status、diff、验证结果、Lore protocol。 | Git 操作和 status。 | Git report。 |

## 5. 当前对话作为 Orchestrator Agent

当用户在当前对话中提出新移动端需求时，默认由 Orchestrator Agent 作为总流程控制入口处理。

推荐提示：

```text
我有一个新的移动端需求：<需求描述>
```

Orchestrator Agent 必须先判断需求是否已被 `docs/prd/` 当前事实来源覆盖，并决定是否需要派发其他 Agent。

- 已覆盖：不改 PRD，直接产出 Requirement Handoff。
- 需求新增或变化：先向用户确认 PRD 修改范围，再更新 PRD，并在 status 记录原因。
- 只是技术实现调整：不改 PRD，转 Architecture Agent，并在 status 记录。
- 只是交互或视觉问题：转 Design Agent，并在 status 记录。
- 涉及权限、token、文件访问或财经合规：转 Security Agent 或要求安全复核。

Orchestrator Agent 不直接实现代码，除非用户明确要求单 Agent 执行小改动、当前工作是很小的文档/状态更新、或 OMX runtime 不可用。常规功能只有 Requirement Handoff 标记 `Implementation-ready: Yes` 后，才允许进入开发派发。

## 6. 半自动流转规则

第一版采用半自动确认。

流程：

1. 用户提出需求。
2. Orchestrator Agent 澄清需求、判断是否需要架构/设计/安全前置，并输出 Requirement Handoff。
3. 如果 Requirement Handoff 是 `Implementation-ready: No`，继续澄清或派发前置 Agent。
4. 如果 Requirement Handoff 是 `Implementation-ready: Yes`，等待用户确认是否派发 Development Agent。
5. 用户确认后，Orchestrator 优先派发 `executor` 执行 TDD 实现，而不是自己直接写完。
6. Development Agent 输出 Development Handoff 后，自动派发 `test-engineer` / `verifier`。
7. Test Agent 输出 QA Report。
8. QA `PASS` 后进入 `git-master` 或等待用户下一步。
9. QA `FAIL` / `BLOCKED` 时按反馈循环回流。

自动边界：

- Orchestrator -> Development：需要用户确认。
- Development -> Test：自动，优先 `test-engineer`，最终声明验证可交给 `verifier`。
- Test -> Development 修复：如果问题是明确实现缺陷，可自动回流 Development Agent。
- Test -> Orchestrator：如果问题涉及需求不清、验收变化或需要重新路由，必须回到当前对话。
- Security 高风险问题：必须先经过 Security Agent，再继续开发。

## 7. Requirement Handoff

```text
Requirement Handoff

Feature:
<短名称>

Requirement:
<用户需要什么，以及为什么>

Roles:
<user / super_user / both>

In Scope:
- <范围内>

Out of Scope:
- <范围外>

Affected Areas:
- Routes:
- API contracts:
- State:
- Admin:
- Notifications / files / security:

Acceptance Criteria:
- Given <状态>, when <操作>, then <可观察结果>.

Compliance:
- Roles remain user and super_user only.
- No browsing history or recent_views.
- Finance content has no stock recommendation, buy/sell advice, prediction, or return promise.

Docs:
- PRD update: Yes/No
- Architecture update: Yes/No
- Status update: Yes

Implementation-ready: Yes/No

Open Questions:
- <只有未 ready 时填写>
```

## 8. Architecture Handoff

```text
Architecture Handoff

Feature:
<短名称>

Approach:
<当前推荐技术方案>

Files / Modules:
- <预计修改范围>

API / Data Contract:
- <endpoint, DTO, mock behavior, error handling>

State and Navigation:
- <query keys, auth/role guards, routes>

Risks:
- <风险和缓解>

Architecture Changes:
- Change needed: Yes/No
- Reason:
- Status record required: Yes/No
```

## 9. Development Handoff

```text
Development Handoff

Feature:
<短名称>

TDD Evidence:
- Failing test written first:
- Test file:
- Initial failure:
- Passing result:

Implementation:
- Files changed:
- Behavior added:
- Behavior intentionally not added:

Verification:
- npm run typecheck:
- npm test -- --runInBand:
- Additional smoke:

Status Updated:
Yes/No

Ready for QA:
Yes/No
```

Development Agent 规则：

- 开发前必须先写失败测试。
- 只实现让测试通过所需的最小功能。
- 重构必须在测试通过后进行。
- 不得修改与任务无关的用户改动。
- 不得新增 `user` / `super_user` 以外的应用角色。
- 不得新增浏览历史、`recent_views` 或等价行为追踪。
- 财经轻资讯不得加入股票推荐、买卖建议、个股预测或收益承诺。

## 10. QA Report

```text
QA Report

Feature:
<短名称>

Result:
PASS / FAIL / BLOCKED

Evidence:
- Command:
- Result:
- Manual smoke:

Permission Checks:
- user:
- super_user:
- Admin direct access:

Defects:
- <owner: Product / Architecture / Development / Security>

Return Route:
- None
- Product clarification needed
- Architecture update needed
- Development fix needed
- Security review needed
```

Test Agent 必须验证：

- Requirement Handoff 的验收标准是否满足。
- TDD 证据是否存在。
- `npm run typecheck` 是否通过。
- `npm test -- --runInBand` 是否通过。
- UI 截图式逐页 smoke 当前由用户人工测试；Test Agent 不主动截图，除非用户明确要求。
- 权限边界是否符合 `user` / `super_user`。
- 没有 active 旧角色、浏览历史或财经建议越界。

## 11. 反馈循环

| QA 发现的问题 | 回流到 | 必须动作 |
| --- | --- | --- |
| 需求不清、验收标准冲突、范围变化 | Orchestrator Agent | 澄清需求，必要时更新 PRD 和 status。 |
| 技术方案、目录、API contract 不匹配 | Architecture Agent | 更新 architecture，并在 status 记录原因。 |
| 测试失败、行为缺失、回归 | Development Agent | 先补/改失败测试，再修实现。 |
| 权限、token、文件访问、财经合规、安全风险 | Security Agent | 输出风险级别和修复要求。 |
| 验证证据不足 | Test Agent | 补跑命令或标记 BLOCKED。 |

循环结束条件：

- QA Report 为 `PASS`；或
- 用户明确接受 `BLOCKED` 状态并决定暂停。

## 12. Agent 执行提示模板

以下模板用于 OMX runtime 可用后的 agent 派发，或在 OMX 不可用时由当前 Orchestrator Agent 直接按职责执行。本阶段不默认派发 Codex native sub-agent。

### 12.1 Development Agent

```text
You are the ProjectM Mobile Development Agent.

Mission:
Implement <feature> using TDD.

Read first:
- AGENTS.md
- docs/agents/projectm-agent-specs.md
- docs/agents/omx-workflows.md
- mobile/docs/mobile-agent-workflow.md
- docs/prd/ 当前事实来源
- mobile/docs/mobile-architecture.md
- mobile/docs/mobile-project-status.md
- <Requirement Handoff>

Allowed edits:
- mobile/app/<specific area>
- mobile/src/<specific area>
- mobile/src/**/__tests__/<specific tests>
- mobile/docs/mobile-project-status.md

Rules:
- Write a failing test before implementation.
- You are not alone in the codebase; do not revert unrelated edits.
- Preserve roles user and super_user only.
- Do not add recent_views or browsing history.
- Do not add finance advice behavior.

Output:
Use the Development Handoff format from mobile/docs/mobile-agent-workflow.md.
```

### 12.2 Test Agent

```text
You are the ProjectM Mobile Test Agent.

Mission:
Verify <feature> after Development Handoff.

Read first:
- AGENTS.md
- docs/agents/projectm-agent-specs.md
- docs/agents/phase-02/02.10-qa-security-acceptance-skill-chain.md
- mobile/docs/mobile-agent-workflow.md
- docs/prd/ 当前事实来源
- mobile/docs/mobile-project-status.md
- <Requirement Handoff>
- <Development Handoff>

Allowed edits:
- mobile test files only if missing coverage must be added
- mobile/docs/mobile-project-status.md

Rules:
- Verify the claim before reporting PASS.
- Report FAIL with owner and return route.
- Preserve user / super_user role model.
- Treat permission bugs as high priority.

Output:
Use the QA Report format from mobile/docs/mobile-agent-workflow.md.
```

## 13. 用户常用指令

```text
我有一个新的移动端需求：...
```

```text
根据 Requirement Handoff 派发 Development Agent，用 TDD 实现。
```

```text
派发 Test Agent 验收刚才的开发结果，如果失败就按反馈循环返回。
```

```text
请 Git Agent 检查当前 diff，按 Lore 协议提交。
```

## 14. 完成门禁

一个移动端功能完成前必须满足：

- Requirement Handoff 存在，或需求已完全被 PRD 覆盖。
- Orchestrator -> Development 已经过用户确认。
- Development Handoff 有 TDD 证据。
- `npm run typecheck` 通过。
- `npm test -- --runInBand` 通过。
- QA Report 为 `PASS`。
- `mobile/docs/mobile-project-status.md` 已更新。
- 未新增 active 旧角色、浏览历史或财经建议越界。
