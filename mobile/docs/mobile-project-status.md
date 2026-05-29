# ProjectM 移动端项目状态

## 1. 文档目的

本文档记录 ProjectM Mobile 的实时项目状态，包括当前阶段、进度、已解决问题、未解决问题、风险、下一步、决策历史和架构变更记录。

本文档是状态记录的唯一位置。每次完成新文档、创建工程、实现功能、发现问题、解决问题、调整架构或改变下一步计划，都必须同步更新本文档。

## 2. 当前阶段

| 项目 | 状态 |
| --- | --- |
| 当前阶段 | RN + Expo + TypeScript 移动端工程已创建；当前按 `docs/prd/` 重整为员工门户 App 范围。 |
| 当前重点 | 以 `mobile/docs/mobile-prd-implementation-guide.md` 为移动端架构和执行入口；推送通知、收藏、下载记录、通知偏好、移动端 Admin Console 和旧原型已搁置，不作为当前开发范围。 |
| 工程状态 | 已创建 `mobile/` Expo Router 工程骨架；`package-lock.json` 和 `node_modules/` 已存在，当前 shell 可使用 nvm 下的 `npm`。 |
| 后端状态 | 移动端所需 API contract 已在文档中定义，真实接口尚未实现。 |
| 分支状态 | 本地 `garrison` 已基于远端最新 `origin/codex/project-m-milestone-01-02`，并保留移动端工程骨架提交。 |
| 验证状态 | 已执行文档级检查、静态原型结构检查、移动端 JSON 配置解析检查、敏感范围关键词检查、agent / skill / MCP / OMX 能力审计、`npm run typecheck` 和 `npm test -- --runInBand`；最终全量结果以本次任务验证记录为准；已用 Expo Go 在 iOS / Android 模拟器完成启动和部分路由 smoke，尚未完成完整端到端路径覆盖。 |

## 3. 当前文档资产

| 文档 | 职责 | 维护规则 |
| --- | --- | --- |
| `docs/prd/` 当前事实来源 | 当前移动端需求事实来源。 | PRD 无需求变动不得修改；修改前先确认范围。 |
| `mobile/docs/parked/` | 已搁置移动端历史文档。 | 不删除，但不得作为当前事实来源、不得引用或继承。 |
| `mobile/docs/mobile-prd-implementation-guide.md` | 当前移动端架构和执行细节入口。 | 根据 `docs/prd/` 和用户确认后的范围维护；不得自行修改 PRD。 |
| `mobile/docs/mobile-ui-visual-reference.md` | 当前移动端 UI、视觉、布局和组件风格参考。 | 后续移动端 UI 开发优先参考；不得借视觉参考恢复已搁置功能。 |
| `ui reference/pink pixel art/` | Web 与移动端统一粉色像素风原型图、HTML 索引和 PDF 归档。 | 仅作视觉参考，不作为需求事实来源；移动端优先参考 `09-mobile-home.png` 到 `16-mobile-training.png`。 |
| `mobile/docs/mobile-project-status.md` | 项目状态、问题、风险、下一步和变更历史。 | 每次状态变化都要更新。 |

## 4. 已完成事项

| 日期 | 事项 | 结果 |
| --- | --- | --- |
| 2026-05-29 | 产出 mobile screenshot visual acceptance evidence。 | 使用 iOS Simulator `iPhone 17` + Expo Go 对首页、今日公司简报、财经轻资讯和新人专区生成可复现截图证据，artifact 保存于 `mobile/docs/evidence/task-5-mobile-visual-2026-05-29/`；确认 briefs / finance / newcomer 当前 viewport 不再出现重复筛选/排序控件，财经非投资建议边界可见。验证：Task 5 typecheck、focused briefs/finance/newcomer Jest、diff check 和截图尺寸检查通过；未新增依赖。 |
| 2026-05-29 | 完成 mobile docs evidence 复核。 | 确认本轮 active route/page 审计证据已集中在 `mobile/docs/mobile-route-audit-2026-05-29.md`，项目状态和架构变更已记录模块列表搜索/筛选/排序状态面板改动；未新增 PRD、架构或 parked 功能范围变更。验证：Task 4 运行 typecheck、focused screen Jest、full Jest、diff check 和 active guardrail grep；Jest 当前仍受公告/热帖页面重复筛选控件测试失败阻塞。 |
| 2026-05-29 | 复核移动端 no-new-deps 守卫。 | 确认当前 active mobile 范围未新增运行时依赖，`expo-notifications` 已从 `package.json` 和 lockfile active package entries 移除；`activeRouteGuardrails` 同时检查 manifest 与 lockfile，避免搁置通知能力通过依赖残留回流。 |
| 2026-05-29 | 完成 active mobile route/page 审计和模块列表状态统一。 | 新增 active route audit 文档；模块列表、文档中心和培训中心统一像素风计数/当前筛选/清除筛选状态；员工论坛热帖补齐搜索、链接类型筛选和排序，培训中心补齐课程筛选和排序；未恢复 Admin、推送、通知偏好、收藏、下载记录或浏览历史。 |
| 2026-05-28 | 精简首页菜单弹层标题区。 | 删除 `MobileMenu` 打开后的 `PROJECTM MENU / 模块列表` 标题块，只保留菜单导航按钮列表；菜单路由、当前态和搁置功能边界不变。验证：focused MobileMenu Jest 8 tests 通过；`npm --prefix mobile run typecheck` 通过。 |
| 2026-05-28 | 将移动端菜单限制为首页入口，其它页面改为返回键。 | 首页继续显示左上角 `MobileMenu`；通用 `Screen` 页首控件改为像素风“返回”按钮，点击优先返回上一页，无历史时回到首页；登录等 opt-out 页面仍不显示页首控件。验证：`npm --prefix mobile run typecheck` 通过；focused Jest 4 suites / 25 tests 通过；full Jest 42 suites / 176 tests 通过。 |
| 2026-05-28 | 完成 active mobile 已实现页 PRD / 视觉参考复核。 | 复核 active `mobile/app` / `mobile/src` 路由、菜单、guardrail 测试和状态文档；修复左上角菜单在公告、简报、热帖、新人、财经、文档、培训详情页未标记父级菜单当前态的问题，补充详情页 active-state 回归测试；未恢复 Admin Console、推送、通知偏好、收藏 UI、下载记录 UI 或浏览/阅读历史。验证证据记录于 OMX task 3。 |
| 2026-05-28 | 校准首页左上角菜单与粉色像素风实现细节。 | 菜单按钮按 safe area 与首页品牌条对齐，当前页面菜单项只关闭菜单不重复 push 路由，菜单项增加当前态；首页/菜单像素色 token 收敛到 `mobile/src/theme/pixel.ts`，保持不恢复 Admin、推送、通知偏好、收藏和下载记录入口。 |
| 2026-05-28 | 切换到仓库统一粉色像素风参考目录。 | Web 与移动端原型图统一使用 `ui reference/pink pixel art/`；移动端重点参考 `09-mobile-home.png` 到 `16-mobile-training.png`，原 `mobile/docs/reference-images/pink-pixel-mobile/` 重复图片已移除。 |
| 2026-05-28 | 扩展移动端粉色像素风执行规范。 | 已读取 `ui reference/pink pixel art/ui-reference.html`、`STYLE-README.md`、示例 `styles.css`、`PortalPage.tsx` 和核心组件，确认该目录包含截图、HTML 索引、PDF、Vite 示例、CSS token 与组件结构；保留并更新 `mobile/docs/mobile-ui-visual-reference.md` 作为移动端将 Web/CSS 参考翻译为 React Native 的执行规范。 |
| 2026-05-28 | 将移动端主导航从底部 Tab 切换为左上角菜单列表。 | `(tabs)` 路由组保留为 Expo Router 路径兼容层，但 UI 已从 `Tabs` 改为 `Stack + MobileMenu`；底部导航栏和 `TabIcon` 已移除，首页、7 个用户模块、文档中心、培训中心和个人中心均通过左上角像素菜单进入。 |
| 2026-05-28 | 从粉色像素风 PDF 提取移动端视觉参考。 | 已读取仓库内 `ui reference/pink pixel art/pink-pixel-art-image-compilation.pdf`，重点整理移动端页面 8 张参考图，新增 `mobile/docs/mobile-ui-visual-reference.md`；后续 UI 开发优先参考该风格，但不恢复已搁置功能。 |
| 2026-05-28 | 按当前 PRD 范围搁置移动端暂缓功能并重写架构执行入口。 | 推送通知、收藏、下载记录、通知偏好、移动端 Admin Console、旧架构原文、旧架构指针和旧静态原型已按分类移入 `mobile/docs/parked/features/`；新增 `mobile/docs/mobile-prd-implementation-guide.md` 作为当前入口。 |
| 2026-05-28 | 按 TDD 加固文档详情权限非披露边界。 | 普通 `user` 直接打开未授权文档详情（如 `doc_1003`）时 mock detail endpoint 返回 not found，详情页仅显示资源不可用状态，不渲染标题、分类、文件类型、大小、标签、预览或下载动作；`super_user` 仍可用于 mock 管理验证。targeted document API/detail tests、typecheck、lint、full Jest、diff/guardrail 检查证据记录在 OMX task 1。 |
| 2026-05-28 | 按 TDD 加固文档列表权限非披露边界。 | 普通 `user` 的文档列表、搜索、分类、标签和文件类型筛选只返回 permitted documents，不再暴露 `canPreview=false` 文档标题、分类、标签或文件类型；文档详情改为单文档 mock endpoint 以保持无权限文档不请求/不暴露 preview/download 元数据；`super_user` mock list 仍可用于管理验证。targeted documents/detail tests 4 个套件 21 个测试通过，`npm --prefix mobile run typecheck` 通过，full Jest 65 个套件 241 个测试通过。 |
| 2026-05-28 | 完成通知点击 listener QA guardrail。 | 独立复核真实 `expo-notifications` response listener 接入方向，补充通知点击路由 route group 拒绝回归测试，保持 safe click routing 只允许用户白名单路径并拒绝外部 URL、scheme、路径穿越和 Admin 路径；更新通知 README，未声明真实 iOS/Android 通知点击 smoke。 |
| 2026-05-28 | 按 TDD 完成文档中心搜索/分类/标签/文件类型筛选。 | 文档列表 API 支持 backend-aligned `search` / `category` / `tag` / `file_type` query，mock transport 按标题、分类、标签和文件类型过滤，文档中心页面提供对应筛选控件和标签展示；targeted documents tests、typecheck、full Jest 65 个测试套件 240 个测试通过。 |
| 2026-05-28 | 完成真实 API transport readiness QA。 | API client 现在通过 `createConfiguredApiTransport()` 保持默认 mock fallback；仅在显式配置有效 `EXPO_PUBLIC_API_BASE_URL` 时使用 fetch-backed transport；fetch transport 覆盖 base URL/path 拼接、Authorization 转发、JSON body、canonical envelope、非 JSON 和网络失败 `ApiError` 映射。QA 未声明真实 Go 后端、iOS 或 Android 设备 smoke。 |
| 2026-05-28 | 按 TDD 接入真实 Expo push 注册 provider。 | 新增 `expo-notifications` 依赖；通知注册 helper 提供真实 Expo provider，按需检查/请求权限、通过 Expo project id 获取 push token、上报平台/设备/App 版本，并保留测试可注入 provider；通知偏好页默认使用真实 provider，文案从 mock-only 调整为 development build 真机验证口径；未声明真实 iOS/Android push smoke 已完成。 |
| 2026-05-28 | 完成文档详情文件能力集成 QA 守卫。 | 复核 `DocumentDetailScreen` 现有集成测试覆盖：无权限文档不请求/暴露 preview 或 download 元数据；有权限文档保留可注入文件 provider、下载进度提示和失败重试 UI；本次未声明真实 iOS/Android 设备 smoke 或后端文件服务 smoke。 |
| 2026-05-28 | 按 TDD 对齐 Admin Dashboard 指标契约。 | Admin Dashboard API 改为从当前 mock state 汇总内容数量、待发布数量、阅读量、文档下载量、培训完成率和最近操作；页面展示 PRD 8.1 指标标签，培训完成率会随课程完成记录变化。 |
| 2026-05-28 | 按 TDD 加固 Admin 文档文件元数据校验。 | Admin 文档 mock API 在创建或更新前拒绝不支持的文件类型和超过 50 MB 的文件大小，并保持原记录不变；支持 `pdf` / `docx` / `xlsx` / `pptx` 且不超过 50 MB 的文档继续可保存；文档详情页展示后端校验错误且不误报保存成功；未新增原生文件选择依赖、角色、批量操作或追踪。 |
| 2026-05-28 | 按 TDD 加固 Admin 最后启用 `super_user` 保护。 | Admin 用户 mock API 拒绝禁用或降级最后一个启用状态的 `super_user`，并保持原记录不变；用户详情页在确认后展示后端校验错误且不误报成功；允许在存在其他启用 `super_user` 时正常降级；保持角色仅 `user` / `super_user`、无批量操作、无追踪。 |
| 2026-05-28 | 按 TDD 补齐 Admin 关键单条操作二次确认。 | 新增共享 Admin 确认面板；内容、文档、课程的发布/归档/软删除，以及用户角色变更/禁用、新人任务禁用、分类禁用、标签禁用均先展示确认 UI，取消不触发 mutation，确认后执行原有单条 API；保持无批量操作、无新角色、无浏览追踪和无财经建议。 |
| 2026-05-28 | 按 TDD 补齐文档详情下载降级进度与重试 UI。 | 文档详情在有权限文档预览失败或预览链接生成后保留下载 fallback；下载准备期间显示长耗时进度提示，失败后提供“重试下载文件”，成功/失败均不展示原始下载 URL、文件名或 mime type；无权限文档仍不请求预览或下载元数据。 |
| 2026-05-28 | 按 TDD 完成新人专区首页显示偏好。 | 新增 `/api/v1/me/profile` typed preference update contract、`showNewcomerOnHome` 默认偏好和 mock session 内持久化；个人中心可切换首页新人专区显示状态，首页在个人偏好关闭时仅隐藏新人专区模块，偏好与通知设置隔离，且普通用户与 `super_user` mock session 不互相泄漏。 |
| 2026-05-28 | 按 TDD 完成 Admin 角色权限只读页。 | 新增 Admin Dashboard 角色权限入口和 `/admin/roles` 页面；页面通过 `GET /api/v1/admin/roles` 展示 exactly `user` / `super_user` 的权限边界，不提供角色变更控件，普通用户访问角色元数据仍返回 403。 |
| 2026-05-28 | 完成个人中心收藏、下载记录和培训进度 mock vertical slice。 | 按 TDD 新增 `/me/favorites`、`/me/downloads`、`/me/training-progress` API contract，补齐 `我的收藏`、`下载记录`、`培训进度` 三个个人中心页面和入口路由；下载记录仅展示显式下载记录，不新增浏览或阅读行为追踪。 |
| 2026-05-26 | 创建移动端 PRD 初版。 | 历史移动端 PRD 已搁置，当前不作为事实来源。 |
| 2026-05-26 | 创建移动端架构初版。 | 旧架构文档现已搁置，当前不作为事实来源。 |
| 2026-05-26 | 明确架构可变更原则。 | 架构变更必须记录原因、具体改动、影响范围和验证结果。 |
| 2026-05-26 | 重整文档职责边界。 | PRD 保持需求，Architecture 保持架构，Status 记录状态。 |
| 2026-05-26 | 将移动端 PRD 改为可独立阅读。 | 该历史决策已被当前 `docs/prd/` 事实来源体系取代。 |
| 2026-05-28 | 实现今日公司简报 mobile mock vertical slice。 | 新增 briefs API wrapper、mock published-only list/detail/search/favorite、无当日回退日期标记、列表页和详情页；保持角色仅 `user` / `super_user`，不新增用户行为追踪。 |
| 2026-05-26 | 创建第一轮中低保真原型说明。 | 完成 `mobile/docs/mobile-prototype-spec.md`。 |
| 2026-05-26 | 创建静态可点击原型。 | 完成 `mobile/prototype/index.html`，覆盖登录、首页、7 个用户模块入口、文档预览、通知偏好、Admin 内容发布流程和 403。 |
| 2026-05-26 | 执行静态原型结构检查。 | HTML 内嵌脚本语法正常；22 个 screen 和 34 个点击跳转均能匹配目标页面。 |
| 2026-05-26 | 创建 RN + Expo + TypeScript 移动端工程骨架。 | 完成 Expo Router 基础路由、theme、API client、mock transport、Auth provider、登录页、首页、文档中心、培训中心、个人中心、Admin guard 和 403 页面。 |
| 2026-05-26 | 补齐移动端骨架基础测试和测试配置。 | 新增 API client、mock transport、角色判断和 403 页面测试；`npm run typecheck` 通过，`npm test -- --runInBand` 4 个测试套件 10 个测试通过。 |
| 2026-05-27 | 拉取并比较远端最新分支。 | `origin/codex/project-m-milestone-01-02` 比 `origin/main` 新，且领先 `main` 1 个提交；本地 `garrison` 已 rebase 到该 milestone 分支并保留移动端提交。 |
| 2026-05-27 | 建立移动端多 Agent 工作流。 | 该移动端专用工作流文档已搁置；后续 agent 规则以 `docs/agents/` 和 `AGENTS.md` 为准。 |
| 2026-05-27 | 将当前对话调整为移动端 Orchestrator Agent。 | 总控 Agent 负责接收所有问题、澄清需求、判断是否派发架构/设计/开发/测试/安全/Git，并用 Requirement Handoff 取代独立 Product Handoff。 |
| 2026-05-27 | 完成移动端 agent / skill / MCP 能力审计。 | 该一次性能力审计文档已搁置；后续能力判断以当前运行环境、`docs/agents/` 和 AGENTS 指引为准。 |
| 2026-05-27 | 检查 skill 相关外部 CLI 可用性。 | `git`、`node`、`npm`、`npx` 可用；`docker`、`go`、`mysql`、`codeql`、`az`、`gh`、`eas`、全局 `expo` 当前不在 PATH，已记录到能力审计。 |
| 2026-05-27 | 完成 agent / skill / MCP 修复后的验证。 | `git diff --check` 通过；已确认 44 个 installed skill 的 `SKILL.md` 存在；`npm run typecheck` 通过；`npm test -- --runInBand` 4 个测试套件 10 个测试通过。 |
| 2026-05-27 | 安装并配置 OMX。 | 根据官方 `Yeachan-Heo/oh-my-codex` 仓库说明，通过 `npm install -g oh-my-codex` 安装；执行 `omx setup --scope user --merge-agents`，用户级配置完成，项目 `AGENTS.md` 未修改；`omx doctor` 15 passed / 1 warning / 0 failed，`omx doctor --team` 通过。 |
| 2026-05-27 | 记录 OMX 生成的项目 runtime 状态目录。 | `omx setup` 在项目根目录生成 `.omx/setup-scope.json` 和 `.omx/hud-config.json`；决定保留为本地 runtime 状态，并通过 `.gitignore` 忽略，确保不影响远端。 |
| 2026-05-27 | 完成 live `omx team` smoke test。 | 安装 `tmux 3.6b`；直接从 Codex App shell 跑 `omx team` 会按预期失败并提示必须在 tmux leader pane 内运行；随后在临时 clean worktree 和临时 tmux session 中启动 1 个 `verifier` worker，worker 成功 ACK、claim task、读取 repo、保持 no-edit、transition task to completed、发送 DONE。临时 tmux session 和临时 git worktree 已清理。 |
| 2026-05-27 | 完成 live `omx team` 修复后的主工程验证。 | `omx doctor --team` 通过；`git worktree list` 仅剩主工作区；tmux 临时 session 已退出；主工作区 `npm run typecheck` 通过，`npm test -- --runInBand` 4 个测试套件 10 个测试通过。 |
| 2026-05-27 | 完成 2-worker 多 Agent workflow 验证。 | 在临时 clean worktree 和临时 tmux session 中执行 `omx team 2:verifier` no-edit smoke test；OMX 创建 2 个 worker pane、2 个 worker worktree 和 2 个任务；两个 worker 均 ACK、claim、检查 repo/docs、保持 no-edit、写入 result，并将任务 transition 到 `completed`。临时 tmux session 和临时 git worktree 已清理。 |
| 2026-05-27 | 按 TDD 完成文档预览 URL API contract。 | 先新增失败测试，再实现 `getDocumentPreviewUrl`、preview URL endpoint builder 和 mock transport 响应；未登录请求返回 401，不返回预览元数据。`npm run typecheck` 通过，`npm test -- --runInBand` 5 个测试套件 12 个测试通过。 |
| 2026-05-27 | 按 TDD 完成整体路由骨架第一版。 | 先新增 `moduleRoutes` 失败测试，再实现 7 个用户模块统一路由清单、首页模块点击入口、`app/modules/` 认证路由组和简报/公告/热帖/新人/财经占位页面；文档和培训继续保留在 Tab。`npm run typecheck` 通过，`npm test -- --runInBand` 6 个测试套件 15 个测试通过。 |
| 2026-05-27 | 修复移动端路由返回和底部 Tab 图标问题。 | 新增 `goBackOrHome` 测试与实现，模块页和 Admin 页返回按钮优先 `router.back()`，避免重复 push 首页导致动画方向和滚动位置异常；新增 RN 原生 `TabIcon` 组件并显式配置 4 个 Tab 图标，修复 Android 默认占位图标显示异常。`npm run typecheck` 通过，`npm test -- --runInBand` 8 个测试套件 21 个测试通过。 |
| 2026-05-27 | 按 TDD 完成文档中心详情与预览 vertical slice。 | 先新增文档详情 helper、文档列表点击和详情页组件失败测试，再实现文档列表点击进入详情、详情元数据展示、短期 preview URL 请求、无权限不请求预览、预览失败提示和返回文档列表 fallback。`npm run typecheck` 通过，`npm test -- --runInBand` 11 个测试套件 29 个测试通过。 |
| 2026-05-27 | 修复退出登录动画并补充系统打开预览动作。 | 新增 root stack 转场测试和 preview URL 打开测试；`(auth)` 进入使用 `slide_from_left`，退出登录返回登录页时视觉方向与 pop 一致；文档预览生成后显示“打开预览”，调用系统 URL handler。`npm run typecheck` 通过，`npm test -- --runInBand` 13 个测试套件 32 个测试通过。 |
| 2026-05-27 | 按 TDD 完成通知偏好与 push token 注册 mock vertical slice。 | Test Engineer 先新增 notification API 和 push registration helper 失败测试，Executor 实现 typed API wrapper、mock transport、可注入 push 注册 helper；随后新增通知偏好页面失败测试并实现个人中心入口、偏好开关、mock 设备注册状态。Verifier 回流指出 `/me/notifications` 需要认证 layout、mock 偏好更新需要持久化；已补 `app/me/_layout.tsx` 和 PUT 后 GET 持久化测试。`npm run typecheck` 通过，`npm test -- --runInBand` 16 个测试套件 38 个测试通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 内容管理单条 mock vertical slice。 | Worker-1 先新增 Admin content API 和 screen 失败测试，再实现内容列表、详情/新建编辑、保存草稿、发布、归档、软删除、mock transport 持久化和 Dashboard 入口；Worker-2 执行 QA 回流，Orchestrator 根据 leader 验证修复 Expo Router typed route、测试 mock 和软删除状态文本。`npm run typecheck` 通过，`npm test -- --runInBand` 18 个测试套件 42 个测试通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 文档管理单条 mock vertical slice。 | Worker-1 先新增 Admin document API 和 screen 失败测试，再实现文档列表、详情/新建编辑、发布、归档、软删除、mock transport 持久化和 Dashboard 入口；Worker-2 执行 QA 回流并确认不支持批量操作、普通用户 403、只修改 `mobile/` 范围。`npm run typecheck` 通过，`npm test -- --runInBand` 20 个测试套件 47 个测试通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 课程管理单条 mock vertical slice。 | Worker-1 先新增 Admin course API 和 screen 失败测试，再实现课程列表、详情/新建编辑、发布、归档、软删除、mock transport 持久化和 Dashboard 入口；保持 `super_user` 权限和单条操作范围。`npm run typecheck` 通过，`npm test -- --runInBand` 22 个测试套件 52 个测试通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 新人任务管理单条 mock vertical slice。 | Worker-1 先新增 Admin newcomer task API、mock transport 和 screen 失败测试，再实现新人任务列表、详情/新建编辑、启用、禁用、mock transport 持久化和 Dashboard 入口；保持 `super_user` 权限和单条操作范围，不新增批量控制或浏览历史追踪。`npm run typecheck` 通过，targeted Jest 3 个测试套件 9 个测试通过，full Jest 24 个测试套件 58 个测试通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 分类管理单条 mock vertical slice。 | Worker-1 先新增 Admin category API、mock transport 和 screen 失败测试，再实现分类列表、详情/新建编辑、启用、禁用、mock transport 持久化和 Dashboard 入口；保持 `super_user` 权限和单条操作范围，不新增批量控制或浏览历史追踪。验证证据记录于团队任务。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 标签管理单条 mock vertical slice。 | Worker-1 先新增 Admin tag API、mock transport 和 screen 失败测试，再实现标签列表、详情/新建编辑、启用、禁用、mock transport 持久化和 Dashboard 入口；保持 `super_user` 权限和单条操作范围，不新增批量控制或浏览历史追踪。验证证据记录于团队任务。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 用户管理单条 mock vertical slice。 | Worker-1 先新增 Admin user API、mock transport 和 screen 失败测试，再实现用户列表、详情/新建编辑、禁用、单角色分配、角色清单和 Dashboard 入口；角色严格限定为 `user` / `super_user`，保持 `super_user` 权限和单条操作范围，不新增批量控制。`npm run typecheck` 通过，targeted Jest 3 个测试套件 10 个测试通过，full Jest 30 个测试套件 74 个测试通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成 Admin 首页栏目配置单条 mock vertical slice。 | Worker-1 先新增 Admin portal config API、mock transport 和 screen 失败测试，再实现七个首页栏目列表、单条启用/禁用、展示顺序、展示数量保存、mock transport 持久化和 Dashboard 入口；Orchestrator/Worker-2 对账 stale QA failure，移除 tracked `mobile/node_modules` symlink，并固定 clean-install 可复现测试依赖。`npm ci`、`npm run typecheck`、targeted Jest 3 个测试套件 10 个测试、full Jest 32 个测试套件 79 个测试均通过。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成财经轻资讯 mobile-only vertical slice。 | Worker-1 先新增 finance API、列表页和详情页失败测试，再实现 `GET /api/v1/mobile/finance`、详情、收藏持久化、标签筛选、`/finance/[id]` 路由和模块页；内容均为 `super_user` 人工确认的内部资讯，显示来源/日期/标签/正文/免责声明，不包含股票推荐、买卖建议、个股预测或收益承诺。`npm run typecheck` 通过，targeted Jest 3 个测试套件 10 个测试通过，full Jest 44 个测试套件 133 个测试通过。 |
| 2026-05-27 | 按 TDD 完成设备解绑和通知点击路由 mobile-only slice。 | Worker-1 先新增设备 DELETE API、push 当前设备 id、AuthProvider signOut 解绑顺序和通知点击安全路由失败测试，再实现 `DELETE /api/v1/me/devices/{id}` typed wrapper、mock transport 设备持久化/重复解绑 404、注册后保存 current device id、退出登录先 logout 再 unlink 后清理 auth、通知 payload route 白名单解析；未安装真实 `expo-notifications`。验证证据记录于团队任务。 |
| 2026-05-27 | 通过 OMX/team 按 TDD 完成公司公告墙 mobile-only vertical slice。 | Worker-1 先新增 announcements API、列表页和详情页失败测试，再实现 `GET /api/v1/mobile/announcements`、详情、收藏持久化、搜索、分类筛选、置顶/重要标记、附件/部门/有效期/发布时间/阅读量展示和 `/announcements/[id]` 路由；过期已发布公告在公告墙可查询，草稿对普通用户模块 API 隐藏，不新增浏览历史、recent views 或已读追踪。验证证据记录于团队任务。 |
| 2026-05-28 | 通过 OMX/team 按 TDD 完成员工论坛热帖 mobile-only vertical slice。 | Worker-1 先新增 forum-hot API、列表页、详情页和通知路由失败测试，再实现 `GET /api/v1/mobile/forum-hot`、详情、默认热度排序、至少 3 条热帖、站内详情、外部链接安全打开失败提示和 `/forum-hot/[id]` 路由；MVP 仅聚合展示，不新增发帖、评论、私信、举报、版主管理或普通用户维护能力。验证证据记录于团队任务。 |
| 2026-05-28 | 通过 OMX/team 按 TDD 完成新人专区 mobile-only vertical slice。 | Worker-1 先新增 newcomer API、列表页、详情页和我的新人任务详情失败测试，再实现 `GET /api/v1/mobile/newcomer/content`、资料详情、搜索、收藏持久化、`/newcomer/[id]` 路由、我的启用任务列表/详情/完成和 `/me/newcomer-tasks/[id]` 路由；普通用户只看到 enabled 任务且按 `sort_order` 升序，不新增浏览历史、recent views 或已读追踪。验证证据记录于团队任务。 |

## 5. 已确定决策

| 日期 | 决策 | 原因 | 影响范围 |
| --- | --- | --- | --- |
| 2026-05-26 | 移动端采用 React Native + Expo + TypeScript。 | 适合 iOS / Android MVP，降低构建和原生能力接入成本。 | 移动端工程、依赖、构建分发。 |
| 2026-05-26 | 使用 Expo Router。 | 适合 Expo 文件路由，便于模块化页面组织。 | 路由结构和页面目录。 |
| 2026-05-26 | 使用 TanStack Query 管理服务端状态。 | 统一处理请求缓存、刷新、错误和失效。 | API client 和页面数据状态。 |
| 2026-05-28 | 推送通知、通知偏好、收藏、下载记录和移动端 Admin Console 暂时搁置。 | 当前用户指令和 `docs/prd/` App 边界要求移动端优先作为员工门户；管理写入归 Web Admin Console。 | 相关路由、API、组件、测试、旧原型和旧架构原文进入 `mobile/docs/parked/features/`。 |
| 2026-05-26 | 文件预览采用短期 preview URL。 | 系统预览和外部应用打开兼容性更好，权限边界更清晰。 | 文档预览 API 和客户端文件模块。 |
| 2026-05-26 | 移动端 Admin 曾按单条操作设计。 | 历史设计已被 2026-05-28 搁置决策覆盖。 | 旧实现和测试保留在搁置区，当前不使用。 |
| 2026-05-26 | 历史移动端 PRD 曾作为稳定需求源。 | 该历史决策已被当前 `docs/prd/` 事实来源体系取代。 | 移动端 PRD 维护方式。 |
| 2026-05-26 | 第一轮原型采用静态 HTML 交付。 | 当前环境无法直接产出 Figma 文件；静态 HTML 可验证点击路径，且不创建 RN + Expo 工程。 | 原型评审、页面流程验证。 |
| 2026-05-26 | 移动端开发采用 TDD / test-first 流程。 | API client、Auth、权限守卫、文件预览和 Admin 流程风险较高，先写测试可降低回归和契约偏差。 | 移动端工程、测试配置、功能开发节奏。 |
| 2026-05-27 | 当前对话默认作为移动端 Orchestrator Agent。 | 用户希望所有问题直接与当前对话沟通，由总控判断调用哪些 sub-agent。 | 需求澄清、Requirement Handoff、开发派发、QA 回流。 |
| 2026-05-27 | 移动端 Agent 流程采用半自动确认。 | Requirement Handoff ready 后等待用户确认再派发 Development Agent；Development 完成后自动派发 Test Agent。 | 多 Agent 协作节奏、风险控制和 TDD 执行。 |
| 2026-05-27 | 暂时不使用 Codex native sub-agent。 | 用户要求优先使用项目现有配置，并修复不可用能力。 | Orchestrator 直接使用已安装 project skills；OMX 修复前不依赖 native sub-agent。 |
| 2026-05-27 | 安装全部 ProjectM project skills。 | 让 ProjectM portable skills 和核心 custom skills 可被后续 Codex session 自动发现。 | `~/.codex/skills`，共 44 个 skill。 |
| 2026-05-27 | Agent / skill / MCP 配置优先级确定。 | 用户要求优先使用项目已配置内容，如果没有再询问是否使用 Codex native 或其他方案。 | Orchestrator 先查 ProjectM docs、agents、portable skills、OMX、已配置 MCP；缺口必须先问用户。 |
| 2026-05-27 | `.omx/` 只作为本地 runtime 状态保留。 | 用户确认可以保留 `.omx/`，但不能影响远端。 | 新增 `.gitignore` 忽略 `.omx/` 和 `.DS_Store`。 |
| 2026-05-27 | `omx team` 使用条件确定。 | live team 需要 tmux leader pane 和干净 leader 工作区；脏工作区会被 OMX 拒绝以保护 worktree。 | 当前工作区有未提交 docs 改动时，需先使用临时 clean worktree、提交/stash，或等待当前改动收口后再运行 live team。 |
| 2026-05-27 | `omx team` 多 worker 启动语法确定。 | 实测 `omx team 2:verifier "<task>"` 可以启动两个 worker；`omx team 1:analyst 1:verifier "<task>"` 会只识别第一个 agent spec，其余进入任务描述。 | 混合职责需要由 Orchestrator 拆分为 handoff、独立 team，或先确认 OMX 支持的混合角色语法。 |
| 2026-05-27 | Orchestrator 必须优先做控制流，不包办具体专业工作。 | 用户要求具体事情交给对应 agent 处理，不能只用少数“产品/开发/测试/Git”口径覆盖 OMX 的细分 agent。 | 后续需求默认由 Orchestrator 路由到 `analyst`、`planner`、`architect`、`designer`、`executor`、`test-engineer`、`verifier`、`code-reviewer`、`git-master` 等具体 agent。 |
| 2026-05-27 | UI 截图式逐页 smoke 暂停。 | 用户决定 UI 视觉和逐页截图测试由人工执行，避免自动截图测试太慢。 | Test Agent 只做 typecheck、unit/component tests、必要的路由/权限逻辑验证；只有用户明确要求时才运行模拟器截图/vision 检查。 |
| 2026-05-27 | 移动端需求维护转入当前 `docs/prd/` 事实来源体系。 | 最新提交中旧文档与远端 `main` 产生冲突；用户要求本地版本使用远端最新 `main`，后续不要改动保护文件。 | 移动端历史 PRD 已搁置，不再作为当前事实来源。 |

## 6. 已解决问题

| 问题 | 结论 |
| --- | --- |
| 移动端是否只做员工门户？ | 是。当前 App 范围是 `user` 与 `super_user` 都可使用的员工门户；移动端 Admin Console 和管理写入已搁置。 |
| 推送第一版怎么做？ | 暂不做。推送通知和通知偏好已进入搁置区，后续恢复必须先确认需求和 PRD 范围。 |
| 移动端是否已有通知偏好、push token 注册和通知点击基础链路？ | 历史实现已搁置。相关文件保留在 `mobile/docs/parked/features/notifications/`，当前不得引用或继续开发。 |
| 通知偏好页面是否受登录态保护？ | 历史实现已搁置；当前 active route 不包含 `/me/notifications`。 |
| mock 通知偏好更新是否持久化？ | 历史 mock 行为已搁置，当前不作为验收目标。 |
| 文件预览怎么做？ | 使用后端短期 preview URL。 |
| 移动端是否已有 preview URL contract？ | 是。已按 TDD 增加 `getDocumentPreviewUrl(documentId)`，mock transport 返回短期预览 URL，未登录请求返回 401。 |
| 文档中心是否已有列表到详情再到预览链路？ | 是。列表卡片可进入详情页，有权限文档可生成短期 preview URL，无权限文档不发起 preview 请求；文档详情集成测试已守住无权限元数据不请求/不暴露、下载进度和重试 UI；真实后端文件 URL 与 iOS/Android 原生保存/分享仍待 development / preview build smoke。 |
| 移动端 Admin 是否支持批量操作？ | 当前不支持，也不实现移动端 Admin Console；历史单条操作实现已搁置。 |
| 架构是否必须严格不变？ | 否。架构可以变更，但必须记录原因、具体改动、影响范围和验证结果。 |
| 用户模块路由骨架怎么组织？ | 7 个用户模块统一由 `src/navigation/moduleRoutes.ts` 维护入口；文档和培训作为 Tab 高频入口，其他模块先进入 `app/modules/` 骨架页面。 |
| 返回页面动画和滚动位置怎么处理？ | 从模块页或 Admin 页返回时优先使用 `router.back()`，让导航栈执行正常 pop 动画并保留上一页状态；直接进入页面时才 fallback 到 `/(tabs)`。 |
| 退出登录动画怎么处理？ | 根 Stack 中 `auth` 路由组使用 `slide_from_left`，让退出登录回到登录页时呈现从左向右的返回感；登录进入主应用仍使用 `slide_from_right`。 |
| 通知点击路由如何保证安全？ | `resolveNotificationClickRoute` / `navigateToNotificationRoute` 只接受白名单 app 内用户路径（如 `/announcements/2101`、模块页、文档详情、通知设置），拒绝外部 URL、scheme、双斜杠、路径穿越、Admin 路径和 Expo Router route group payload；真实 listener 接入仍复用该 safe routing。 |
| 文档预览是否只能显示“链接已生成”？ | 否。客户端已在生成短期 preview URL 后提供“打开预览”按钮并调用系统 URL handler；当前 mock URL 不是真实文件服务，真实内容预览仍依赖后端返回可访问的文件预览 URL。 |
| Android 底部 Tab 图标异常怎么处理？ | 不依赖默认 Tab 图标或外部 icon 字体，改为显式渲染 RN View 组成的 `TabIcon`。 |
| App 需求事实来源在哪里？ | 当前以 `docs/prd/` 事实来源体系为准；已搁置移动端历史 PRD 不得使用或引用。 |
| 原型第一轮如何交付？ | 使用静态低保真 HTML 原型和原型说明文档，后续可按评审结果升级为 Figma 或 Expo mock prototype。 |
| 是否采用先测后写的开发流程？ | 是。每个新增功能先写失败测试，再实现最小代码让测试通过。 |
| `main` 与 `codex/project-m-milestone-01-02` 哪个更新？ | `codex/project-m-milestone-01-02` 更新，提交时间为 2026-05-27 10:33:22 +0800；`main` 为 2026-05-26 17:47:21 +0800，且是 milestone 分支祖先。 |
| 移动端多 Agent 是否复用项目已有 agent / skill？ | 是。直接引用 `docs/agents/projectm-agent-specs.md`、`docs/agents/omx-workflows.md` 和 `custom-skill-dev-package/PROJECTM_PORTABLE_SKILLS.md`，不复制、不修改外部资产。 |
| OMX runtime 是否可调用？ | 是。已安装 `oh-my-codex`，`omx --version` 返回 `oh-my-codex v0.18.5`，`omx setup` 和 `omx doctor` 已通过基础验证。 |
| live `omx team` 是否可用？ | 是，已完成 no-edit smoke test。注意它必须从 tmux leader pane 启动，且 leader 工作区必须干净。 |
| 多 worker `omx team` 是否可用？ | 是。`omx team 2:verifier` 已完成 2-worker no-edit workflow 验证，两个任务均 completed。 |
| 移动端是否已有 Admin 内容管理单条流程？ | 是。已完成内容列表、详情/新建编辑、保存草稿、发布、归档、软删除、mock API contract、Dashboard 入口和组件/API 测试；批量操作仍不支持。 |
| 移动端是否已有 Admin 文档管理单条流程？ | 是。已完成文档列表、详情/新建编辑、发布、归档、软删除、mock API contract、Dashboard 入口和组件/API 测试；批量操作仍不支持。 |
| 移动端是否已有 Admin 标签管理单条流程？ | 是。已完成标签列表、详情/新建编辑、启用、禁用、mock API contract、Dashboard 入口和组件/API 测试；批量操作仍不支持。 |
| 移动端是否已有 Admin 首页栏目配置单条流程？ | 是。已完成七个首页栏目列表、单条启用/禁用、展示顺序、展示数量保存、mock API 持久化、Dashboard 入口和组件/API 测试；批量操作仍不支持。 |
| 移动端是否已有财经轻资讯列表/详情/标签筛选/收藏？ | 是。已完成 finance typed API wrapper、mock transport、列表页、详情页、标签筛选和当前 mock session 收藏持久化；每条内容显示来源、发布日期、标签、正文和免责声明，并标记 `super_user` 人工发布。 |
| 移动端是否已有公司公告墙列表/详情/搜索/分类筛选/收藏？ | 是。已完成 announcements typed API wrapper、mock transport、列表页、详情页、搜索、分类筛选和当前 mock session 收藏持久化；展示置顶/重要标记、附件、发布部门、有效期、发布时间和阅读量，草稿隐藏且不记录阅读行为。 |
| 移动端是否已有员工论坛热帖列表/详情/外部链接跳转？ | 是。已完成 forum-hot typed API wrapper、mock transport、列表页、详情页、默认热度排序和外部链接安全错误提示；普通用户只读查看聚合热帖，不能维护帖子，MVP 不实现发帖、评论、私信、举报或版主管理。 |
| 移动端是否已有新人专区资料和我的新人任务用户端流程？ | 是。已完成 newcomer typed API wrapper、mock transport、资料列表/详情/搜索/收藏、我的新人任务列表/详情/完成；普通用户只看到 enabled 任务，任务按 `sort_order` 升序，禁用任务详情/完成返回 404。 |
| 左上角菜单在详情页如何显示当前模块？ | 已修复。详情页路径（如 `/announcements/{id}`、`/documents/{id}`、`/training/{id}`）会标记对应父级菜单项为当前态；点击当前列表页仍避免重复 push，详情页点击父级菜单可返回对应模块列表。 |


## 7. 未解决问题

| 问题 | 当前状态 | 建议下一步 |
| --- | --- | --- |
| 真实 Go API 尚未实现。 | 课程详情/进度/完成、文档预览/下载等仍使用移动端 mock contract。推送、通知偏好、收藏、下载记录和移动端 Admin 已搁置。 | 后端实现时对齐 active 移动端 API wrapper、错误码和 mock contract，并补充联调。 |
| 真实财经轻资讯后端尚未实现。 | 移动端已提供 finance list/detail/tag filter mock contract，内容由 mock `super_user` 人工发布，不做外部自动抓取。 | 后端实现时对齐 active finance 读取 contract，并继续保留发布前合规审核。 |
| 真实员工论坛热帖后端尚未实现。 | 移动端已提供 forum-hot list/detail mock contract、热度排序和外部链接安全降级；不提供移动端写入或管理接口。 | 后端实现时对齐 `/api/v1/mobile/forum-hot`、`/api/v1/mobile/forum-hot/{id}` contract，并继续保持普通用户只读和聚合-only MVP 边界。 |
| 真实新人专区后端尚未实现。 | 移动端已提供 newcomer content list/detail/search 和 my newcomer tasks list/detail/complete mock contract，任务状态为当前用户 mock session 内持久化。 | 后端实现时对齐 active newcomer 读取和本人任务更新 contract，并在后端强制 enabled-only 和用户自有任务边界。 |
| 真实 `POST /api/v1/documents/{id}/preview-url` 后端尚未实现。 | 移动端 API client、mock transport、详情页调用链路和系统打开动作已完成。 | 后端实现时对齐移动端 contract，返回可访问文件 URL，并补充真实接口联调。 |
| 真实 `GET /api/v1/documents/{id}/download` 后端尚未实现。 | 移动端已提供 typed API wrapper、mock contract、详情页下载降级、进度提示、失败重试和 injectable 文件能力；DocumentDetailScreen QA 已确认无权限文档不请求/暴露下载元数据。 | 后端实现时返回短期下载 URL、文件名和 mime type，并在 development / preview build 中验证真实保存/分享能力。 |
| 推送后端发送链路尚未实现。 | 当前已搁置，不作为移动端 active blocker。 | 只有用户恢复推送需求并确认 PRD 范围后再重新评估。 |
| 真实通知真机 smoke 尚未完成。 | 当前已搁置，不作为移动端 active blocker。 | 只有用户恢复推送需求后再验证。 |
| UI 视觉规范尚未完整落地。 | 进行中。 | 已定义基础 theme 和通用组件，后续按原型评审继续扩展组件状态和模块页面。 |
| iOS / Android 真机验证尚未执行。 | 未开始。 | 当前优先验证 active 员工门户和文件预览/下载能力；推送 smoke 暂不做。 |
| Admin 全模块移动端工作量较大。 | 历史实现已搁置，不作为当前移动端范围。 | 只有用户恢复移动端 Admin 后再从搁置区恢复和验证。 |
| 第一轮原型尚未人工评审。 | 旧原型已搁置。 | 后续如需原型，应基于 `docs/prd/` 和 active guide 重做，不引用旧原型。 |
| 原型浏览器可视化自动检查尚未完成。 | 旧原型已搁置。 | 当前不需要继续验证旧原型。 |
| Expo 完整路由 smoke 尚未覆盖完。 | 部分完成，自动截图验证暂停。 | iOS / Android 模拟器均已通过 Expo Go bundle；已验证 Android 首页模块可进入公司公告墙骨架页，iOS 底部图标正常显示；后续 UI 逐页 smoke 由用户人工执行，自动侧只保留必要的非截图验证。 |
| OMX explore harness 有 warning。 | `omx doctor` 只有 1 个 warning：没有 Rust/cargo 或兼容 `OMX_EXPLORE_BIN`，影响 deprecated `omx explore` 兼容路径。 | 当前不依赖 `omx explore`；只有需要该路径时再安装 Rust 或配置 `OMX_EXPLORE_BIN`。 |
| app 校验不能在临时 clean worktree 中直接运行。 | smoke test 的临时 worktree 没有 `mobile/node_modules`，worker 执行 `npm run typecheck` 和 `npm test -- --runInBand` 时因依赖缺失失败。 | app 校验继续在主工作区 `mobile/` 中运行；live team smoke 的验收范围只覆盖 OMX runtime。 |
| 单次 `omx team` 混合角色语法尚未验证。 | `1:analyst 1:verifier` 没有启动两个不同角色，而是只启动一个 analyst worker。 | 多角色协作先由 Orchestrator 拆分任务或使用多个 team；需要时再查 OMX 官方语法。 |
| 新安装/刷新 skills 可能需要新会话生效。 | `omx setup` 后 doctor 报告 75 个 skills installed，当前会话的 skill discovery 可能仍是启动时快照。 | 重启 Codex 或开启新会话后验证 skill 是否自动触发。 |
| 部分 skill 依赖的外部 CLI 当前不可调用。 | `docker`、`go`、`mysql`、`codeql`、`az`、`gh`、`eas`、全局 `expo` 不在 PATH；移动端 npm 级验证不受影响。 | 按实际工作流逐项安装和登录，不把这些流程声明为已可执行。 |

## 8. 当前风险

| 风险 | 影响 | 缓解方式 |
| --- | --- | --- |
| 移动端 Admin Console 已搁置。 | 若误恢复会扩大安全面和测试范围。 | 相关文件留在 `mobile/docs/parked/features/admin-console/`，未获用户确认不得使用。 |
| mock 到真实 API 切换可能出现 contract 偏差。 | 接口接入成本上升。 | mock 层保持真实 envelope、参数和错误码。 |
| 财经内容合规边界严格。 | 不当文案可能被理解为投资建议或收益承诺。 | mock 内容只保留内部资讯阅读和安全教育口径；测试和人工扫描继续禁止股票推荐、买卖建议、个股预测、收益承诺和确定性结论。 |
| 推送已搁置但依赖仍可能残留。 | 误引用会重新引入真机和构建环境要求。 | 不导入 parked notifications；后续依赖清理需单独评估。 |
| 文件预览依赖后端 URL 和系统能力。 | 不同平台表现可能不同。 | PDF、图片、Office 分类型验证，并保留下载降级。 |
| 文档权限需与真实后端保持一致。 | mock 已隐藏普通用户不可访问文档，但真实 Go API 尚未实现相同列表权限过滤。 | 后端实现 `/api/v1/mobile/documents` 时按 permitted published documents 过滤，并复用移动端回归用例做联调验收。 |
| 权限遗漏风险。 | 普通用户可能看到 Admin 或未授权内容。 | 客户端守卫 + 后端 403 + 权限测试同时覆盖。 |
| 旧静态原型已搁置。 | 旧原型包含已暂停功能，可能误导当前范围。 | 后续原型需按 active PRD 范围重建。 |
| skill 已安装不等于所有外部工具可执行。 | 可能误以为 Azure、Docker、CodeQL 或 EAS 流程已经能直接运行。 | 在能力审计中单独记录外部 CLI 状态，执行前先验证命令、runtime 和认证。 |

## 9. 下一步

建议下一阶段按以下顺序推进：

1. 后续新需求先由 Orchestrator 输出路由决策，并明确派发到具体 OMX agent；非平凡实现优先由 `executor` 做，验证由 `test-engineer` / `verifier` 做，不能默认由 Orchestrator 包办。
2. UI 逐页截图/视觉 smoke 暂由用户人工测试；自动验证优先做 `npm run typecheck`、`npm test -- --runInBand`、权限/路由逻辑测试和必要的非截图 smoke。
3. 重启 Codex 或开启新会话后，验证 `omx setup` 刷新的 ProjectM / OMX skills 是否出现在运行时 skill discovery 中。
4. 后续需要 durable 多 agent 并行时，可以使用 `omx team`，但需先确保 leader 工作区干净，并从 tmux leader pane 启动。
5. 后续新增功能严格先写失败测试，再实现功能；优先补齐 active 员工门户、文件 provider 的 development build smoke、后端联调和必要组件/集成测试。
6. 不继续评审旧 `mobile/prototype/index.html`；它已随旧原型说明进入搁置区。
7. 如果发现需求缺口，先向用户确认 PRD 修改范围，再更新 `docs/prd/` 当前事实来源。
8. 如果发现技术方案需要调整，更新 `mobile/docs/mobile-prd-implementation-guide.md` 并记录架构变更。
9. 对真实文件下载/分享 provider 做 development / preview build 设备 smoke，并继续补齐后端联调；不要把未跑过的 iOS/Android 真机或后端文件服务验证标记为已完成。

## 10. 架构变更记录

| 日期 | 变更内容 | 改动原因 | 影响范围 | 验证结果 | 负责人 |
| --- | --- | --- | --- | --- | --- |
| 2026-05-29 | 统一 active 模块列表搜索/筛选/排序状态面板。 | 当前模块页在视觉参考中都需要计数条、清晰状态和 resettable controls；已有页面状态表达不一致，forum-hot/training 缺少显式排序/筛选。 | `mobile/app/modules/*`、`mobile/app/(tabs)/documents.tsx`、`mobile/app/(tabs)/training.tsx`、`mobile/src/components/ModuleListControls.tsx`、相关 screen tests 和 route audit 文档。 | targeted screen Jest、typecheck、full Jest 和 diff check 结果记录在 OMX task 1。 | worker-1 |
| 2026-05-28 | 移除首页菜单弹层标题块。 | 用户要求菜单列表里不再显示“模块列表”组件，只保留下方可点击按钮，减少弹层冗余信息。 | `mobile/src/components/MobileMenu.tsx`、`mobile/src/components/__tests__/MobileMenu.test.tsx` 和状态文档。 | focused MobileMenu Jest 8 tests 通过；`npm --prefix mobile run typecheck` 通过。 | Codex |
| 2026-05-28 | 将通用移动端页面页首控件从菜单切换为返回键。 | 用户确认只有首页应提供模块菜单，其它页面应通过返回键回到上一页，避免多层页面继续暴露全局菜单入口。 | `mobile/src/components/Screen.tsx`、`mobile/src/components/__tests__/PixelPrimitives.test.tsx`、首页菜单相关现有测试和状态文档。 | `npm --prefix mobile run typecheck` 通过；focused Jest 4 suites / 25 tests 通过；full Jest 42 suites / 176 tests 通过。 | Codex |
| 2026-05-28 | 将首页主导航改为 safe-area-aware 左上角菜单并抽出像素风 theme token。 | 首页需要匹配新的移动端粉色像素原型，移除底部导航后菜单按钮位置、当前路由重复 push 和 raw color 分散问题需要统一修正。 | `mobile/app/(tabs)/_layout.tsx`、`mobile/app/(tabs)/index.tsx`、`mobile/src/components/MobileMenu.tsx`、`mobile/src/theme/pixel.ts`、菜单/首页路由测试和视觉参考文档。 | `npm --prefix mobile run typecheck` 通过；菜单/首页 targeted Jest 3 suites / 11 tests 通过；full Jest 37 suites / 143 tests 通过；`git diff --check -- mobile` 通过。 | Codex |
| 2026-05-28 | 加固文档详情直达路由权限非披露 mock contract。 | PRD 要求无权限用户不能看到文档信息，上一阶段已隐藏列表但直达详情仍需同等权限边界。 | `mobile/app/documents/[id].tsx`、`mobile/src/api/mock/transport.ts`、文档 API 和详情页测试。 | TDD 新增未授权详情 API/页面断言；targeted Jest 4 suites / 23 tests 和 typecheck 通过；本轮按用户要求停止，真实后端和真机 smoke 未执行。 | OMX team |
| 2026-05-28 | 加固文档列表权限非披露 mock contract。 | PRD 要求普通用户只能搜索/筛选/下载允许文档；列表页不应泄露不可预览/不可下载文档的标题、分类、标签或文件类型。 | `mobile/src/api/documents.ts`、`mobile/src/api/endpoints.ts`、`mobile/src/api/mock/transport.ts`、文档列表/详情页面和测试。 | TDD 新增列表非披露、筛选非披露、详情元数据不暴露和 `super_user` 保留验证；targeted Jest 21 passed、typecheck 通过、full Jest 241 passed。 | OMX team |
| 2026-05-28 | 接入真实 Expo 通知点击 response listener readiness。 | 已有安全 clickRouting 只缺真实 `expo-notifications` 点击回调 wiring；需要保持 Jest/非原生环境稳定和 provider 可注入。 | `mobile/src/notifications/notificationListener.ts`、root layout、通知 listener/clickRouting 测试、notifications README 和架构/status 文档。 | TDD 新增 listener 测试先红；实现后 targeted Jest 8 passed，后续完整验证记录于团队任务。 | worker-1 |
| 2026-05-28 | 增加文档中心列表筛选 query contract。 | PRD 要求文档中心支持搜索、分类、标签和文件类型筛选，且应与后端 query contract 对齐。 | `mobile/src/api/documents.ts`、`mobile/src/api/mock/transport.ts`、`mobile/app/(tabs)/documents.tsx`、文档 API 和页面测试。 | TDD 新增 query/filter/screen 测试；实现后 targeted Jest 4 suites / 20 tests、typecheck、full Jest 65 suites / 240 tests 通过。 | OMX team |
| 2026-05-28 | 增加可配置真实 API transport。 | 真实 Go API 接入前需要在不破坏 mock 默认行为的前提下验证 fetch transport contract。 | `mobile/src/api/client.ts`、`mobile/src/api/fetchTransport.ts`、`mobile/src/api/transportConfig.ts`、transport/client 测试和 API 架构文档。 | TDD 新增 fetch transport/config 测试先红；实现后 targeted Jest 9 passed、full Jest 224 passed、`npm --prefix mobile run typecheck` 通过。 | worker-1 |
| 2026-05-26 | 创建移动端架构第一版。 | 在创建 RN + Expo 工程前明确移动端目录、路由、API client、鉴权、权限、推送和文件预览方案。 | 旧架构文档和后续移动端工程脚手架。 | 文档检查通过；尚未创建工程。 | Codex |
| 2026-05-26 | 将架构变更记录从架构文档迁移到状态文件。 | 状态文件需要统一承接进度、问题、决策历史和变更记录；架构文档只保留当前技术设计。 | 旧架构文档和 `mobile/docs/mobile-project-status.md`。 | 文档边界检查通过。 | Codex |
| 2026-05-26 | 在移动端架构中加入 TDD / test-first 开发流程。 | 用户选择先写测试再实现功能，适合控制 API、Auth、权限和 Admin 流程风险。 | 旧架构文档和后续移动端工程测试配置。 | 文档检查通过；PRD 未改。 | Codex |
| 2026-05-27 | 将用户模块第一层路由收敛到 `app/modules/`，并新增统一 `moduleRoutes` 清单。 | 当前阶段要先搭整体骨架，避免 7 个模块入口散落在首页和页面文件里；文档/培训仍保留为 Tab 高频入口。 | 旧架构文档、`mobile/app/modules/*`、`mobile/src/navigation/moduleRoutes.ts`、首页模块入口。 | `npm run typecheck` 通过；`npm test -- --runInBand` 6 个测试套件 15 个测试通过。 | Codex |
| 2026-05-27 | 完成 Admin 审计日志只读移动端 vertical slice。 | PRD 要求 `super_user` 可查看审计日志、搜索/过滤并查看详情，同时普通 `user` 访问 Admin API 返回 403 且审计日志不暴露敏感请求内容。 | `mobile/src/types/domain.ts`、`mobile/src/api/*`、`mobile/app/admin/*`、`mobile/src/screens/__tests__/adminAuditLogsScreen.test.tsx`。 | TDD 测试先红；随后补充实现并运行 typecheck、targeted Jest、full Jest。 | Codex |
| 2026-05-28 | 复核文档详情文件能力集成 QA 守卫。 | 真实文件 provider 接入前后都必须保持文档详情权限边界和降级 UI 不回退。 | `mobile/src/screens/__tests__/documentDetailScreen.test.tsx`、`mobile/docs/mobile-project-status.md`、`mobile/src/files/README.md`。 | 复用现有 DocumentDetailScreen 集成测试覆盖无权限元数据不请求/不暴露、下载进度和失败重试；本次 targeted Jest 7 passed，未执行真机或后端文件服务 smoke。 | worker-2 |
| 2026-05-28 | 补齐文档详情下载进度和失败重试状态。 | 大文件或长耗时下载需要给用户明确等待状态，失败后可重试，同时继续隐藏短期下载 URL、文件名和 mime type。 | `mobile/app/documents/[id].tsx`、`mobile/src/screens/__tests__/documentDetailScreen.test.tsx`。 | TDD 新增进度与重试测试；targeted Jest 通过，完整验证证据记录于团队任务。 | worker-2 |
| 2026-05-27 | 完成文档预览失败后的下载降级 mock contract。 | 文件预览需求要求有权限用户可通过短期 preview URL 打开，失败或不支持时保留下载入口，且无权限用户不得获取文件元数据。 | `mobile/src/api/*`、`mobile/src/files/preview.ts`、`mobile/app/documents/[id].tsx`、文档详情/API/文件 helper 测试。 | 已补充 TDD 测试；当前 worker worktree 缺少 `mobile/node_modules`，需要在主工作区或装配依赖后运行 typecheck/Jest。 | Codex |
| 2026-05-27 | 完成财经轻资讯 list/detail/tag/favorite mock contract。 | PRD 7.6 要求财经轻资讯支持列表、详情、标签筛选和收藏，且每条资讯展示来源、日期、正文和免责声明；MVP 不自动抓取外部财经新闻。 | `mobile/src/types/domain.ts`、`mobile/src/api/*`、`mobile/src/api/mock/*`、`mobile/app/modules/finance.tsx`、`mobile/app/finance/[id].tsx`、finance API/页面测试。 | TDD 新增 finance API、列表和详情测试；targeted Jest 10 passed；full Jest 133 passed；`npm run typecheck` 通过。 | worker-1 |
| 2026-05-27 | 完成培训中心课程详情与个人进度 mock contract。 | PRD 7.8 要求课程详情展示元数据/资源链接/进度/完成状态，用户可更新自己的学习进度并标记完成，完成后个人中心培训进度同步。 | `mobile/src/api/*`、`mobile/src/api/mock/*`、`mobile/app/(tabs)/training.tsx`、`mobile/app/training/[id].tsx`、培训 API/页面测试。 | TDD 新增课程 API、列表和详情测试；targeted Jest 14 passed；`npm run typecheck` 通过。 | worker-1 |
| 2026-05-27 | 完成公司公告墙 list/detail/search/category/favorite mock contract。 | PRD 7.3 要求公告墙支持列表、详情、搜索、分类筛选、置顶标记和收藏，并展示附件、发布部门、有效期、发布时间和阅读量；过期公告在公告列表/筛选中可查询，草稿不对普通用户可见。 | `mobile/src/types/domain.ts`、`mobile/src/api/*`、`mobile/src/api/mock/*`、`mobile/app/modules/announcements.tsx`、`mobile/app/announcements/[id].tsx`、announcements API/页面测试。 | TDD 新增 announcements API、列表和详情测试；验证证据记录于团队任务。 | worker-1 |
| 2026-05-28 | 完成员工论坛热帖 list/detail/external-link mock contract。 | PRD 7.4 要求热帖列表、详情或外部链接跳转，展示作者/发布时间/最新回复/浏览/评论/点赞，并按热度或配置排序；MVP 仅聚合展示。 | `mobile/src/types/domain.ts`、`mobile/src/api/*`、`mobile/src/api/mock/*`、`mobile/app/modules/forum-hot.tsx`、`mobile/app/forum-hot/[id].tsx`、通知点击白名单和 forum-hot API/页面测试。 | TDD 新增 forum-hot API、列表、详情和通知路由测试；验证证据记录于团队任务。 | worker-1 |
| 2026-05-28 | 完成新人专区 content/list/detail/search/favorite 和 my-task mock contract。 | PRD 7.5 要求普通用户浏览已发布新人资料、搜索和收藏，并查看/完成自己的启用新人任务；禁用任务隐藏且按 `sort_order` 升序。 | `mobile/src/types/domain.ts`、`mobile/src/api/*`、`mobile/src/api/mock/*`、`mobile/app/modules/newcomer.tsx`、`mobile/app/newcomer/[id].tsx`、`mobile/app/me/newcomer-tasks/[id].tsx`、newcomer API/页面测试。 | TDD 新增 newcomer API、列表和详情测试；targeted Jest 9 passed；`npm run typecheck` 通过；full Jest 56 个测试套件 173 个测试通过。 | worker-1 |

## 11. 状态维护规则

- 完成任何新工作后，更新“已完成事项”。
- 新增或确认关键技术/产品决策后，更新“已确定决策”。
- 解决问题后，将问题从“未解决问题”移到“已解决问题”。
- 发现新风险后，更新“当前风险”。
- 下一步计划变化后，更新“下一步”。
- 架构调整后，更新“架构变更记录”，并同步修改 `mobile/docs/mobile-prd-implementation-guide.md`。
- 新增或变更业务需求时，先向用户确认 PRD 修改范围，再更新 `docs/prd/` 当前事实来源，并在本文档记录原因。
