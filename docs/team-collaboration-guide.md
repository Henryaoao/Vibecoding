# ProjectM 三人全栈模块协作指南

生成时间：2026-05-28
分支：`main`

## 本轮定位

三个人是真人全栈开发者，按业务模块并行开发，不使用 `omx team` 作为主协作方式。

本轮忽略 App：

- 不开发 `mobile/`
- 不恢复 `mobile/docs/parked/`
- 不处理移动端 Admin、通知、收藏、下载记录等搁置能力

本轮目标是在现有 `ProjectM-source-code/` full stack demo 上，把 Web + Go API + PostgreSQL 的 MVP 模块继续做实。

明确忽略：

- `docs/projectm-task-management/`
- `docs/projectm-task-management-*-backup-*`
- `mobile/`
- `mobile/docs/parked/`

## 当前代码基线

现有 runnable demo 在 `ProjectM-source-code/`：

- 后端：`ProjectM-source-code/backend/`
- Web：`ProjectM-source-code/frontend/`
- 数据库：`ProjectM-source-code/database/`
- 当前 API：
  - `GET /healthz`
  - `GET /api/v1/home`
  - `GET /api/v1/content?section=...`
- 当前 Web 页面集中在 `ProjectM-source-code/frontend/src/pages/PortalPage.tsx`
- 当前数据库已有七个 MVP 模块相关表和 seed 数据

现有 demo 更像“七模块聚合读取页”，还不是完整模块化产品。三人协作应按模块切片推进，而不是按后端/Web/App 技术层拆开。

## 全局红线

- 角色只能是 `user` 和 `super_user`。
- 不得引入 `content_admin`、`department_admin`、`system_admin` 或第三种应用角色。
- `/api/v1/admin/*` 必须要求 `super_user`。
- App 不在本轮范围内。
- 不实现浏览历史、`recent_views`、页面访问轨迹或等价被动行为追踪。
- 财经轻资讯不得包含股票推荐、买卖建议、个股预测或收益承诺。
- 不提交 `.env` 或真实密钥。

## 协作方式

每个人都是全栈 owner，负责一组业务模块的“纵向切片”。不要把三个人拆成后端、Web、QA 或文档角色。

每个人都要覆盖自己模块组的：

- 数据库确认或小迁移
- Go model / repository / service / controller
- Web service client / types / 页面模块 UI
- 模块级 smoke 和测试
- 必要的 PRD/合同登记同步

每个人最终交付的是“这个模块组在 Web + Go API + PostgreSQL 上能跑起来”，不是只交付某一层代码。

为了减少冲突，三个人不要同时大改同一个 shared 文件。需要 shared 变更时，按下面规则协作。

### Shared 文件协调

这些 shared 文件容易冲突，先约定临时 owner。这里的 owner 不是技术分工，只是为了减少多人同时编辑同一文件：

| 文件 | Owner | 规则 |
| --- | --- | --- |
| `ProjectM-source-code/backend/internal/model/content.go` | A 先改，B/C 小改前先同步 | 新 section、共享类型、label/order 统一在这里协调 |
| `ProjectM-source-code/backend/internal/controller/portal.go` | A 先改 | 新路由尽量用每人自己的 controller 文件，最后统一注册 |
| `ProjectM-source-code/backend/internal/repository/content_repository.go` | A 先改 | 通用 home/content 聚合保持稳定；模块详情查询优先拆新 repository 文件 |
| `ProjectM-source-code/frontend/src/pages/PortalPage.tsx` | B 先拆骨架 | B 拆出模块挂载点后，A/C 只接自己的模块组件 |
| `ProjectM-source-code/frontend/src/types/portal.ts` | B 先改 | 共享类型先保持兼容；模块详情类型可拆到独立文件 |
| `ProjectM-source-code/frontend/src/services/portal.ts` | B 先改 | 通用 API 保持兼容；模块 API 可拆到独立 service 文件 |
| `ProjectM-source-code/frontend/src/styles.css` | B 先做 layout token | A/C 添加模块 class 时避免重写全局布局 |
| `ProjectM-source-code/database/init/001_projectm_schema.sql` | A 先改 | 本轮尽量避免大改 init；新变化优先 migration |

推荐每人新增自己的模块文件，减少抢文件：

```text
backend/internal/controller/<module>.go
backend/internal/repository/<module>_repository.go
backend/internal/service/<module>.go
frontend/src/services/<module>.ts
frontend/src/types/<module>.ts
frontend/src/components/modules/<ModuleName>.tsx
```

## 模块分组

### A：信息发布核心组（全栈）

模块：

- 今日公司简报
- 公司公告墙

为什么这样分：这两个模块都是发布类内容，生命周期和 Web Admin Console 管理方式相近，适合一个全栈 owner 做纵向切片。

PRD：

- `docs/prd/phases/modules/today-briefing/backend-prd.md`
- `docs/prd/phases/modules/today-briefing/web-frontend-prd.md`
- `docs/prd/phases/modules/announcements/backend-prd.md`
- `docs/prd/phases/modules/announcements/web-frontend-prd.md`

代码范围：

- `ProjectM-source-code/backend/internal/*`
- `ProjectM-source-code/frontend/src/services/briefs.ts`
- `ProjectM-source-code/frontend/src/services/announcements.ts`
- `ProjectM-source-code/frontend/src/types/briefs.ts`
- `ProjectM-source-code/frontend/src/types/announcements.ts`
- `ProjectM-source-code/frontend/src/components/modules/BriefsModule.tsx`
- `ProjectM-source-code/frontend/src/components/modules/AnnouncementsModule.tsx`
- 需要时新增 migration

Todo：

1. 保持现有 `/api/v1/home` 和 `/api/v1/content?section=briefs|announcements` 不破坏。
2. 新增员工端详情 API：
   - `GET /api/v1/briefs`
   - `GET /api/v1/briefs/{id}`
   - `GET /api/v1/announcements`
   - `GET /api/v1/announcements/{id}`
3. 公告支持搜索、分类筛选、置顶优先、有效期过滤。
4. 简报支持当日简报、历史列表、详情。
5. Web 侧做两个模块的列表 + 详情体验，可以先用详情抽屉或详情面板，不必引入复杂路由。
6. 为 `super_user` 管理写入预留 `/api/v1/admin/briefs` 和 `/api/v1/admin/announcements` 的路由结构；第一轮可以先实现公告/简报的只读管理列表，写入可作为第二轮。
7. 保持 `user` 无法访问 `/api/v1/admin/*`。

完成标准：

- 简报、公告都有员工端列表和详情。
- 公告筛选/search 可用。
- 无草稿、归档、过期公告泄露给员工端。
- Web 首页仍能显示七模块聚合。
- 普通 `user` 不能访问 admin 路径。

验证：

```bash
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "content_admin|department_admin|system_admin|recent_views|view history|浏览历史" ProjectM-source-code
```

### B：知识资料与学习组（全栈）

模块：

- 文档中心
- 培训中心

为什么这样分：这两个模块都涉及资料、材料、权限、下载/打开或学习进度，Web 体验和后端合同有共性。B 仍然是全栈 owner，只是额外承担第一轮 Web shell 挂载点拆分。

PRD：

- `docs/prd/phases/modules/document-center/backend-prd.md`
- `docs/prd/phases/modules/document-center/web-frontend-prd.md`
- `docs/prd/phases/modules/training-center/backend-prd.md`
- `docs/prd/phases/modules/training-center/web-frontend-prd.md`

代码范围：

- `ProjectM-source-code/backend/internal/*`
- `ProjectM-source-code/frontend/src/services/documents.ts`
- `ProjectM-source-code/frontend/src/services/training.ts`
- `ProjectM-source-code/frontend/src/types/documents.ts`
- `ProjectM-source-code/frontend/src/types/training.ts`
- `ProjectM-source-code/frontend/src/components/modules/DocumentsModule.tsx`
- `ProjectM-source-code/frontend/src/components/modules/TrainingModule.tsx`
- `ProjectM-source-code/frontend/src/styles.css` 的模块样式区
- 需要时新增 migration

Todo：

1. 先拆 Web 模块挂载点，给 A/C 留出可插入各自模块组件的位置。
2. 新增员工端 API：
   - `GET /api/v1/documents`
   - `GET /api/v1/documents/{id}`
   - `POST /api/v1/documents/{id}/preview-url` 或明确 stub
   - `GET /api/v1/training`
   - `GET /api/v1/training/{id}`
3. 文档支持搜索、分类、标签、文件类型筛选。
4. 无权限文档不得泄露标题、分类、标签、文件名、MIME type、URL 或下载地址。
5. 培训支持课程列表、详情、材料入口；本人进度更新可先设计 API 形状，第一轮不强求完成写入。
6. Web 侧做文档列表/筛选/详情和培训列表/详情。
7. 为 Web Admin Console 预留文档/课程管理入口，但不要用纯前端假状态冒充后端授权。

完成标准：

- 文档、培训都有员工端列表和详情。
- 文档权限非披露有后端测试或明确验证。
- Web 有文档筛选和培训详情。
- 不实现下载历史或浏览历史。

验证：

```bash
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "recent_views|view history|浏览历史|下载记录|content_admin|department_admin|system_admin" ProjectM-source-code
```

### C：社区与成长内容组（全栈）

模块：

- 员工论坛热帖
- 新人专区
- 财经轻资讯

为什么这样分：这三个模块偏内容消费和轻互动，第一轮可以主打员工端读取体验。C 仍然全栈负责数据库/API/Web，财经合规边界由 C 重点把关。

PRD：

- `docs/prd/phases/modules/forum-hot-posts/backend-prd.md`
- `docs/prd/phases/modules/forum-hot-posts/web-frontend-prd.md`
- `docs/prd/phases/modules/newcomer-zone/backend-prd.md`
- `docs/prd/phases/modules/newcomer-zone/web-frontend-prd.md`
- `docs/prd/phases/modules/finance-light-news/backend-prd.md`
- `docs/prd/phases/modules/finance-light-news/web-frontend-prd.md`

代码范围：

- `ProjectM-source-code/backend/internal/*`
- `ProjectM-source-code/frontend/src/services/forum.ts`
- `ProjectM-source-code/frontend/src/services/newcomer.ts`
- `ProjectM-source-code/frontend/src/services/finance.ts`
- `ProjectM-source-code/frontend/src/types/forum.ts`
- `ProjectM-source-code/frontend/src/types/newcomer.ts`
- `ProjectM-source-code/frontend/src/types/finance.ts`
- `ProjectM-source-code/frontend/src/components/modules/ForumModule.tsx`
- `ProjectM-source-code/frontend/src/components/modules/NewcomerModule.tsx`
- `ProjectM-source-code/frontend/src/components/modules/FinanceModule.tsx`
- 需要时新增 migration

Todo：

1. 新增员工端 API：
   - `GET /api/v1/forum-hot`
   - `GET /api/v1/forum-hot/{id}`
   - `GET /api/v1/newcomer`
   - `GET /api/v1/newcomer/{id}`
   - `GET /api/v1/finance`
   - `GET /api/v1/finance/{id}`
2. 热帖按热度和发布时间排序，员工端只读展示；不要自行扩大发帖、私信、举报或复杂互动。
3. 新人专区支持资料列表/详情；本人任务更新可先设计 API 形状，第一轮不强求完成写入。
4. 财经轻资讯支持列表/详情/标签展示，并在列表和详情都展示非投资建议边界。
5. 财经内容和 UI 文案不得出现股票推荐、买卖建议、个股预测或收益承诺。
6. Web 侧做三个模块的列表和详情体验。
7. Admin 管理入口先预留，不抢 B 的 Web Admin 壳层；等 shared 壳层稳定后接入。

完成标准：

- 热帖、新人、财经都有员工端列表和详情。
- 财经合规提示明确存在。
- 热帖没有扩展出 PRD 外复杂互动。
- 新人任务不越权更新他人状态。
- 不引入浏览历史或阅读轨迹。

验证：

```bash
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "股票推荐|买卖建议|个股预测|收益承诺|recent_views|view history|浏览历史|content_admin|department_admin|system_admin" ProjectM-source-code
```

## 按轮次协作计划

### 轮次原则

- 每轮都从最新 `main` 或上一轮集成分支 rebase。
- 每轮每个人只做自己模块组的全栈纵向切片。
- 每轮结束都先本地验证，再提小 PR 或交给集成人合并。
- 同一轮内，除本表指定 owner 外，不碰 shared 文件。
- 每轮如果必须改 shared 文件，先在群里说清楚文件、改动目的和预计影响。

### R0：对齐与脚手架保护

目标：让三个人能并行，不抢核心文件。

输入：

- 当前 `main`
- `docs/prd/README.md`
- `docs/prd/projectm-overall-prd.md`
- `docs/prd/endpoints/web-prd.md`
- 各自模块的 backend/web PRD

本轮产物：

- 三组模块的 API 草案
- Web shell 挂载点
- 模块组件目录
- shared 文件 owner 确认

1. 三人都从 `main` 建分支：
   - A：`codex/modules-briefs-announcements`
   - B：`codex/modules-documents-training`
   - C：`codex/modules-forum-newcomer-finance`
2. 三人共同确认 shared 文件 owner。
3. A/B/C 各自列出本组 API 路径和响应草案，避免命名分叉。
4. B 先开一个很小的 Web shell PR，只做模块挂载点，不做文档/培训业务。

R0 分工：

| 人 | 做什么 | 可改文件 | 不碰文件 |
| --- | --- | --- | --- |
| A | 列出简报/公告 API 草案；检查 `company_briefs`、`announcements` 表是否足够；标注是否需要 migration | 新建 `docs/tmp-api-notes-a.md` 或自己分支 notes；只读 backend/frontend | `PortalPage.tsx`、`styles.css` |
| B | 拆 Web shell 和模块挂载点；创建 `frontend/src/components/modules/` 目录；提供模块注册结构 | `PortalPage.tsx`、`frontend/src/types/portal.ts`、`frontend/src/services/portal.ts`、`styles.css` | 后端业务文件 |
| C | 列出热帖/新人/财经 API 草案；检查 `forum_posts`、`newcomer_resources`、`finance_news` 表；列出财经合规字段/文案 | 新建 `docs/tmp-api-notes-c.md` 或自己分支 notes；只读 backend/frontend | `PortalPage.tsx`、`styles.css` |

R0 API 草案最少包含：

- 路径
- 查询参数
- 响应字段
- 401/403/404/400 错误形态
- 是否需要分页
- 是否需要搜索/筛选
- 是否需要更新 `contract-register.md`

R0 Web shell 最少包含：

- `PortalPage.tsx` 仍能显示首页和七模块入口
- 每个 section 能映射到一个模块组件
- 没有模块组件时有 fallback
- `frontend/src/components/modules/` 可让 A/C 直接添加组件
- 不引入新路由库或重写整个 app

R0 合并顺序：

1. 先合 B 的 Web shell 小 PR。
2. A/C rebase 到包含 Web shell 的最新分支。
3. notes 可以不合入主线；如果要合，放到明确临时文档并在后续删除或吸收到正式合同。

R0 验证：

```bash
npm --prefix ProjectM-source-code/frontend run build
```

R0 禁止事项：

- A/C 不改 Web shell。
- B 不改后端业务查询。
- 不写 Admin Console。
- 不改数据库 schema。
- 不把临时 notes 当长期 PRD。

R0 交接信息：

- B 给 A/C：模块组件如何挂载、需要导出什么 props、哪里注册 section。
- A/C 给 B：各自模块需要的列表/详情 UI 状态和筛选项。

### R1：员工端读取 API

目标：每组模块先有后端员工端列表/详情 API，但不抢 Web 页面。

输入：

- R0 API 草案
- 当前数据库 schema
- 各自模块 backend PRD

本轮产物：

- 各模块员工端列表 API
- 各模块员工端详情 API
- 后端测试
- 必要的最小 migration
- API 字段交接说明

R1 统一要求：

- 保留 `/api/v1/home`
- 保留 `/api/v1/content?section=...`
- 新增本组模块列表/详情 API
- 员工端只返回已发布、可见、有权限内容
- 后端测试优先
- 不做 Admin 写入
- 不大改 `content_repository.go`；详情查询优先放进各自模块 repository

R1 分工：

| 人 | 做什么 | 可改文件 | 不碰文件 |
| --- | --- | --- | --- |
| A | `GET /api/v1/briefs`、`/briefs/{id}`、`/announcements`、`/announcements/{id}`；公告搜索/分类；简报当日/历史语义 | A 自己的 controller/service/repository/model/test 文件；必要时小改 route register | `frontend/src/`，除非只加空 service 类型 |
| B | `GET /api/v1/documents`、`/documents/{id}`、`/training`、`/training/{id}`；文档筛选和非披露；培训材料字段 | B 自己的 controller/service/repository/model/test 文件 | A/C 模块文件、Web 页面 |
| C | `GET /api/v1/forum-hot`、`/forum-hot/{id}`、`/newcomer`、`/newcomer/{id}`、`/finance`、`/finance/{id}`；财经免责声明字段 | C 自己的 controller/service/repository/model/test 文件 | A/B 模块文件、Web 页面 |

R1 每人测试最少覆盖：

- 列表成功
- 详情成功
- 不存在资源返回 404
- 未登录或无效身份返回 401
- 无权限资源返回 403 或 404，按模块 PRD/安全非披露选择
- 草稿/归档/删除内容不出现在员工端列表
- 搜索/筛选参数不会 SQL 注入或绕过状态过滤

R1 各组额外测试：

- A：公告过期不出现在默认员工列表，置顶排序在前。
- B：无权限文档不泄露文件名、MIME type、URL、标签和分类。
- C：财经响应包含免责声明；热帖只读；新人资源只返回启用/发布内容。

R1 合并顺序：

1. A、B、C 可并行 PR。
2. 若都改 `main.go` 或 route register，最后由一个人做集成 commit。
3. 合并后统一跑 Go tests。

R1 验证：

```bash
(cd ProjectM-source-code/backend && go test ./...)
rg -n "content_admin|department_admin|system_admin|recent_views|view history|浏览历史" ProjectM-source-code/backend ProjectM-source-code/database
```

R1 禁止事项：

- 不做 Web UI。
- 不做 Admin 写入。
- 不修改其他人的模块 API。
- 不为了端侧方便引入浏览历史、阅读量写入或被动追踪。

R1 交接信息：

- 每人输出 API 路径、参数、响应示例、错误码。
- 标出 Web 需要展示的字段。
- 标出暂不实现但已预留的字段。

### R2：Web 员工端模块接入

目标：每组模块接入自己的 Web service/types/component，页面挂载到 B 已拆好的 shell。

输入：

- R1 API
- B 的 Web shell 挂载点
- 各自模块 web-frontend PRD

本轮产物：

- 各模块 Web service
- 各模块 TypeScript type
- 各模块列表组件
- 各模块详情组件或详情面板
- 加载、空状态、错误、重试状态

统一要求：

- `PortalPage.tsx` 只负责 shell、导航和模块挂载
- 每组模块有自己的组件、service、types
- 每个模块至少有列表和详情
- 加载、空状态、错误、重试要统一
- 不在 R2 做 Admin Console 写入

R2 分工：

| 人 | 做什么 | 可改文件 | 不碰文件 |
| --- | --- | --- | --- |
| A | 简报/公告 Web service/types/components；公告搜索/分类 UI；详情面板 | `frontend/src/services/briefs.ts`、`announcements.ts`、对应 types/components/modules | B/C 模块组件、全局 shell 大改 |
| B | 文档/培训 Web service/types/components；文档筛选 UI；培训详情 | `frontend/src/services/documents.ts`、`training.ts`、对应 types/components/modules；必要的小 shell 接线 | A/C 模块组件 |
| C | 热帖/新人/财经 Web service/types/components；财经合规提示 | `frontend/src/services/forum.ts`、`newcomer.ts`、`finance.ts`、对应 types/components/modules | A/B 模块组件、财经合规红线外文案 |

R2 每人 UI 最少包含：

- 列表加载状态
- 空列表状态
- 错误状态和重试按钮
- 详情打开/关闭或详情区域
- API 字段缺失时的安全 fallback
- 不使用浏览历史或最近浏览

R2 各组额外要求：

- A：公告筛选/search UI 不影响简报；简报突出当日/历史。
- B：文档无权限状态不显示敏感元数据；培训材料入口可以先是安全占位。
- C：财经列表和详情都有非投资建议提示；热帖不出现发帖/私信/举报入口。

R2 合并顺序：

1. 先合 B 的 shell 接线更新。
2. A/C rebase 后接自己的模块。
3. 冲突集中在 `PortalPage.tsx` 时，以 B 的 shell 结构为准，只保留模块挂载注册。

R2 验证：

```bash
npm --prefix ProjectM-source-code/frontend run build
rg -n "content_admin|department_admin|system_admin|recent_views|view history|浏览历史|股票推荐|买卖建议|个股预测|收益承诺" ProjectM-source-code/frontend
```

R2 禁止事项：

- 不做 Admin 写入。
- 不大改 Web 视觉体系。
- 不引入新状态管理库。
- 不直接在组件里硬编码后端权限事实。

R2 交接信息：

- 每人给出模块页面入口、service 方法、关键状态截图或描述。
- 若发现 API 字段不足，记录到合同待办，不在 Web 临时伪造。

### R3：Admin 只读地基

目标：先做 Admin Console 壳层和各模块管理列表，不做复杂写入，避免三个人抢状态机。

输入：

- R1/R2 稳定的员工端模块
- 权限与 Admin 指南
- web-shell PRD

本轮产物：

- Admin shell
- `user` 访问 Admin 的 403 状态
- `super_user` 可见 Admin 导航
- 各模块只读管理列表
- 管理列表 API 或安全 stub

统一要求：

- `/api/v1/admin/*` 必须要求 `super_user`
- `user` 必须 403
- 第一轮只读管理列表优先
- 管理写入第二轮再做，除非当前模块已经稳定且不会抢 shared 状态机

R3 分工：

| 人 | 做什么 | 可改文件 | 不碰文件 |
| --- | --- | --- | --- |
| A | 简报/公告 admin list API + Web 管理列表入口 | A 模块 admin controller/service/component | B/C admin 模块 |
| B | Admin shell、403、导航；文档/培训 admin list | Admin shell 文件、B 模块 admin 文件 | A/C 模块业务 |
| C | 热帖/新人/财经 admin list API + Web 管理列表入口；财经合规标签展示 | C 模块 admin 文件 | A/B 模块业务 |

R3 每人最少实现：

- 管理列表读取
- `user` 403 测试或验证
- `super_user` 可读验证
- 管理列表空状态和错误状态
- 管理入口不暴露给普通员工体验

R3 各组额外要求：

- A：管理列表能区分草稿/已发布/归档或等价状态。
- B：Admin shell 不包含 App 管理暗示；文档管理不展示真实密钥或敏感正文。
- C：财经管理列表展示合规状态或免责声明存在性。

R3 合并顺序：

1. B 的 Admin shell 先合。
2. A/C rebase 后接自己的 admin list。
3. 若 `/api/v1/admin/*` middleware 有冲突，由后端 route 集成人统一处理。

R3 验证：

```bash
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "content_admin|department_admin|system_admin|recent_views|view history|浏览历史|股票推荐|买卖建议|个股预测|收益承诺" ProjectM-source-code
```

R3 禁止事项：

- 不做批量操作。
- 不做删除不可恢复动作。
- 不做复杂状态机写入。
- 不让 App 管理写入进入范围。

R3 交接信息：

- 每人列出 admin list endpoint。
- 标出 R4 准备实现哪些写入动作。
- 标出状态流转需要后端校验的地方。

### R4：写入动作和集成回归

目标：在只读链路稳定后，逐模块补必要管理写入和最终回归。

输入：

- R3 Admin 只读列表
- 各模块生命周期 PRD
- 当前集成分支

本轮产物：

- 每组模块 1 到 2 个最小管理写入闭环
- 后端状态流转校验
- Web 表单或确认动作
- 管理审计最小记录
- 全栈回归结果

R4 分工：

| 人 | 做什么 | 可改文件 | 不碰文件 |
| --- | --- | --- | --- |
| A | 简报/公告创建、编辑、发布、归档、下线中的最小闭环 | A 模块 admin API/UI | B/C 模块 |
| B | 文档/培训创建、编辑、发布、归档、下线或材料入口最小闭环 | B 模块 admin API/UI | A/C 模块 |
| C | 热帖治理、新人资料状态、财经发布/归档/合规提示最小闭环 | C 模块 admin API/UI | A/B 模块 |

R4 每人最少实现：

- 一个创建或编辑动作
- 一个发布/归档/下线或启用/禁用动作
- 前端二次确认或明确提交状态
- 后端权限校验
- 状态冲突或参数错误处理
- 审计记录不包含密钥或敏感正文载荷

R4 各组建议最小闭环：

- A：公告创建草稿 -> 发布 -> 归档；简报可先只做编辑/发布。
- B：文档元数据创建/编辑 -> 发布/归档；培训课程创建/编辑 -> 发布。
- C：热帖可见性治理；新人资料启用/禁用；财经草稿发布前必须有免责声明/合规提示。

R4 合并顺序：

1. B 的 shared shell 或 Admin shell 修正先合。
2. A 的简报/公告纵向切片
3. B 的文档/培训纵向切片
4. C 的热帖/新人/财经纵向切片
5. 最后一轮统一修冲突、跑 build/test/smoke

R4 验证：

```bash
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
docker compose config --services
rg -n "content_admin|department_admin|system_admin|recent_views|view history|浏览历史|股票推荐|买卖建议|个股预测|收益承诺" ProjectM-source-code docs/prd
```

R4 禁止事项：

- 不做批量删除。
- 不上传真实文件或真实密钥。
- 不绕过后端授权只改前端状态。
- 不把财经内容写成投资建议。

R4 交接信息：

- 每人列出已完成写入动作。
- 每人列出未完成的管理动作。
- 每人列出已跑验证和未跑验证。

## 冲突防线

- 不在同一轮多人同时重构 `PortalPage.tsx`。
- 不在同一轮多人同时改同一张数据库表结构；必须改时用 migration，不直接大改 init。
- 不在 R1/R2 做 Admin 写入状态机。
- 不把 App、mobile mock、parked 功能带入 Web/Go 本轮。
- 不为了解决 UI 需要临时发明后端字段；字段变化先记到合同。
- 每人新增自己的模块文件，shared 文件只做注册和挂载。

## 三段可复制给 Codex 的提示词

### 给 A：简报 + 公告全栈

```text
你是全栈 owner，负责 ProjectM 的 今日公司简报 + 公司公告墙 两个模块，按纵向切片开发 PostgreSQL + Go API + Web。本轮忽略 App，不读取或修改 mobile/、mobile/docs/parked/、docs/projectm-task-management/ 或 task-management backup。

先阅读 AGENTS.md、docs/prd/README.md、docs/prd/projectm-overall-prd.md、docs/prd/endpoints/web-prd.md、docs/prd/references/permissions-and-admin-guide.md、docs/prd/phases/foundation/api-contract-foundation-prd.md、docs/prd/phases/foundation/web-shell-prd.md、docs/prd/phases/modules/contract-register.md、today-briefing 和 announcements 的 backend/web PRD。

目标：在不破坏现有 /api/v1/home 和 /api/v1/content?section=... 的前提下，实现简报和公告的员工端列表/详情 API 与 Web 模块 UI。公告支持搜索、分类筛选、置顶优先和有效期过滤；简报支持当日简报、历史列表、详情。为 /api/v1/admin/briefs 和 /api/v1/admin/announcements 预留 super_user 管理路由结构，但第一轮写入可先不做。

按 docs/three-person-vibe-coding-todo.md 的 R0-R4 轮次执行：R1 只做员工端读取 API，R2 接 Web 员工端，R3 做 Admin 只读地基，R4 再做管理写入。不要越轮抢 shared 文件或提前做复杂 Admin 状态机。

尽量新增独立文件：backend/internal/controller/briefs.go、announcements.go，repository/service 对应文件，frontend/src/services/briefs.ts、announcements.ts，frontend/src/types/briefs.ts、announcements.ts，frontend/src/components/modules/BriefsModule.tsx、AnnouncementsModule.tsx。

红线：角色只能 user/super_user；/api/v1/admin/* 必须 super_user；不得引入浏览历史、recent_views、页面访问轨迹；不得改 mobile；不得提交 .env。

完成后运行：
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "content_admin|department_admin|system_admin|recent_views|view history|浏览历史" ProjectM-source-code

最后汇报 API 路径、响应字段、测试结果、Web 接入点、是否改了 shared 文件，以及需要其他两人注意的冲突点。
```

### 给 B：文档 + 培训全栈 + Web Shell

```text
你是全栈 owner，负责 ProjectM 的 文档中心 + 培训中心 两个模块，按纵向切片开发 PostgreSQL + Go API + Web；同时先做 Web 模块挂载点拆分，方便三个人按模块并行接入。本轮忽略 App，不读取或修改 mobile/、mobile/docs/parked/、docs/projectm-task-management/ 或 task-management backup。

先阅读 AGENTS.md、docs/prd/README.md、docs/prd/projectm-overall-prd.md、docs/prd/endpoints/web-prd.md、docs/prd/references/permissions-and-admin-guide.md、docs/prd/phases/foundation/api-contract-foundation-prd.md、docs/prd/phases/foundation/web-shell-prd.md、docs/prd/phases/modules/contract-register.md、document-center 和 training-center 的 backend/web PRD。

目标：把 ProjectM-source-code/frontend/src/pages/PortalPage.tsx 拆成 shell + 模块挂载点，保持现有 demo 可跑；实现文档和培训的员工端列表/详情 API 与 Web 模块 UI。文档支持搜索、分类、标签、文件类型筛选；无权限文档不得泄露标题、分类、标签、文件名、MIME type、URL 或下载地址。培训支持课程列表、详情和材料入口。本人学习进度更新可先设计 API 形状，第一轮不强求完成写入。

按 docs/three-person-vibe-coding-todo.md 的 R0-R4 轮次执行：R0 先做很小的 Web shell 挂载点，R1 只做员工端读取 API，R2 接 Web 员工端，R3 做 Admin 只读地基，R4 再做管理写入。不要越轮抢 shared 文件或提前做复杂 Admin 状态机。

尽量新增独立文件：backend/internal/controller/documents.go、training.go，repository/service 对应文件，frontend/src/services/documents.ts、training.ts，frontend/src/types/documents.ts、training.ts，frontend/src/components/modules/DocumentsModule.tsx、TrainingModule.tsx。

你是 shared Web shell owner。若修改 PortalPage.tsx、frontend/src/types/portal.ts、frontend/src/services/portal.ts、styles.css，请保持兼容并给 A/C 留清晰挂载点。

红线：角色只能 user/super_user；/api/v1/admin/* 必须 super_user；不得实现下载历史、浏览历史、recent_views；不得改 mobile；不得提交 .env。

完成后运行：
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "recent_views|view history|浏览历史|下载记录|content_admin|department_admin|system_admin" ProjectM-source-code

最后汇报 Web shell 拆分方式、模块挂载点、API 路径、权限非披露验证、测试结果，以及 A/C 应如何接入自己的模块组件。
```

### 给 C：热帖 + 新人 + 财经全栈

```text
你是全栈 owner，负责 ProjectM 的 员工论坛热帖 + 新人专区 + 财经轻资讯 三个模块，按纵向切片开发 PostgreSQL + Go API + Web。本轮忽略 App，不读取或修改 mobile/、mobile/docs/parked/、docs/projectm-task-management/ 或 task-management backup。

先阅读 AGENTS.md、docs/prd/README.md、docs/prd/projectm-overall-prd.md、docs/prd/endpoints/web-prd.md、docs/prd/references/permissions-and-admin-guide.md、docs/prd/phases/foundation/api-contract-foundation-prd.md、docs/prd/phases/foundation/web-shell-prd.md、docs/prd/phases/modules/contract-register.md、forum-hot-posts、newcomer-zone、finance-light-news 的 backend/web PRD。

目标：实现热帖、新人、财经的员工端列表/详情 API 与 Web 模块 UI。热帖按热度和发布时间排序，第一轮只读展示，不扩展发帖、私信、举报或复杂互动。新人专区支持资料列表/详情；本人任务更新可先设计 API 形状，第一轮不强求完成写入。财经轻资讯支持列表/详情/标签展示，并在列表和详情都展示非投资建议边界。

按 docs/three-person-vibe-coding-todo.md 的 R0-R4 轮次执行：R1 只做员工端读取 API，R2 接 Web 员工端，R3 做 Admin 只读地基，R4 再做管理写入。不要越轮抢 shared 文件或提前做复杂 Admin 状态机。

尽量新增独立文件：backend/internal/controller/forum.go、newcomer.go、finance.go，repository/service 对应文件，frontend/src/services/forum.ts、newcomer.ts、finance.ts，frontend/src/types/forum.ts、newcomer.ts、finance.ts，frontend/src/components/modules/ForumModule.tsx、NewcomerModule.tsx、FinanceModule.tsx。

红线：角色只能 user/super_user；/api/v1/admin/* 必须 super_user；不得引入浏览历史、recent_views、页面访问轨迹；财经不得出现股票推荐、买卖建议、个股预测或收益承诺；不得改 mobile；不得提交 .env。

完成后运行：
(cd ProjectM-source-code/backend && go test ./...)
npm --prefix ProjectM-source-code/frontend run build
rg -n "股票推荐|买卖建议|个股预测|收益承诺|recent_views|view history|浏览历史|content_admin|department_admin|system_admin" ProjectM-source-code

最后汇报 API 路径、响应字段、财经合规检查、测试结果、Web 接入点、是否改了 shared 文件，以及需要其他两人注意的冲突点。
```
