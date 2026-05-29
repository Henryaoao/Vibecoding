# ProjectM 移动端粉色像素风视觉与原型参考

## 1. 文档状态

- 状态：当前移动端 UI / 视觉 / 布局参考。
- 来源：仓库统一 UI 参考目录 `ui reference/pink pixel art/`。
- 重点范围：`09-mobile-home.png` 到 `16-mobile-training.png` 为移动端原型页；`01-home.png` 到 `08-training.png` 为 Web 同风格参考页。
- 使用规则：后续移动端页面开发的样式、布局、视觉层级和组件质感，优先参考本文档和参考图；需求范围仍以 `docs/prd/` 与 `mobile/docs/mobile-prd-implementation-guide.md` 为准。

本文档只规定视觉和交互表达，不新增产品需求，不恢复已搁置功能。

## 2. 参考图索引

| 文件 | 对应页面 | 用途 |
| --- | --- | --- |
| `../../ui reference/pink pixel art/09-mobile-home.png` | 首页 / 今日公司简报入口 | 移动端整体壳层、hero 区、卡片层级参考 |
| `../../ui reference/pink pixel art/10-mobile-briefs.png` | 今日公司简报列表 | 模块列表、计数条、主卡片按钮参考 |
| `../../ui reference/pink pixel art/11-mobile-announcements.png` | 公司公告墙 | 公告模块视觉和卡片复用参考 |
| `../../ui reference/pink pixel art/12-mobile-forum.png` | 员工论坛热帖 | 热帖模块视觉和标签按钮参考 |
| `../../ui reference/pink pixel art/13-mobile-newcomer.png` | 新人专区 | 新人模块视觉和内容卡片参考 |
| `../../ui reference/pink pixel art/14-mobile-finance.png` | 财经轻资讯 | 合规标签、免责声明按钮和财经卡片参考 |
| `../../ui reference/pink pixel art/15-mobile-documents.png` | 文档中心 | 文档下载 CTA、文档卡片参考 |
| `../../ui reference/pink pixel art/16-mobile-training.png` | 培训中心 | 培训继续学习 CTA、课程卡片参考 |
| `../../ui reference/pink pixel art/01-home.png` 到 `08-training.png` | Web 端同风格原型 | 仅用于跨端视觉一致性参考；移动端布局仍以 09 到 16 为准 |
| `../../ui reference/pink pixel art/ui-reference.html` | 统一参考索引 | 快速浏览 Web / Mobile 全量视觉参考 |
| `../../ui reference/pink pixel art/pink-pixel-art-image-compilation.pdf` | 汇总 PDF | 原型图整包归档 |

## 3. 可复用源包内容

`ui reference/pink pixel art/` 不只是截图目录，也是当前粉色像素风的完整视觉源包。后续做 UI 任务时按以下顺序读取：

1. 先看 `ui-reference.html`，确认页面清单和 Web / Mobile 对应关系。
2. 移动端页面优先看 `09-mobile-home.png` 到 `16-mobile-training.png`。
3. 需要抽象 token、布局、状态和组件行为时读取 `code/projectm-ui-style-03-pink-pixel-art/src/styles.css`。
4. 需要理解卡片、模块、状态、loading、导航结构时读取：
   - `code/projectm-ui-style-03-pink-pixel-art/src/pages/PortalPage.tsx`
   - `code/projectm-ui-style-03-pink-pixel-art/src/components/ContentCard.tsx`
   - `code/projectm-ui-style-03-pink-pixel-art/src/components/FocusCard.tsx`
   - `code/projectm-ui-style-03-pink-pixel-art/src/components/Panel.tsx`
   - `code/projectm-ui-style-03-pink-pixel-art/src/components/StatePanel.tsx`
   - `code/projectm-ui-style-03-pink-pixel-art/src/components/LoadingScene.tsx`
5. `STYLE-README.md` 只作快速摘要，不能替代截图和 CSS。

可直接继承的设计资产：

- 色彩 token：`--ink`、`--outline`、`--shadow`、`--wall`、`--floor`、`--panel`、`--panel-2`、`--panel-3`、`--field`、`--rose`、`--blue`、`--mint`、`--gold`、`--danger`。
- 背景结构：粉色墙面、浅紫地面、网格线、棋盘格地面、轻扫描线。
- 组件质感：4 px 粗描边、0 圆角、4 到 7 px 硬阴影、像素块装饰。
- 交互反馈：点击后元素下沉，阴影缩短；loading 使用像素跳动或阶梯扫描。
- 内容结构：首页 focus cards、模块 grid、内容 cards、meta tags、finance disclaimer、empty/error/loading state。

不能直接照搬的部分：

- Web 侧 `aside` 折叠菜单、Admin entry、theme toggle 和 `SYNC DATA` 只是参考包里的 Web 交互，不代表当前移动端需求。
- `Press Start 2P` 可作为英文或短标签灵感；移动端中文正文不应依赖像素字体。
- CSS pseudo-element 装饰在 React Native 中应转成小组件或背景层，不要堆过多绝对定位影响性能。

## 4. 总体风格

视觉关键词：

- 粉色像素风。
- 复古 RPG / 内部门户混合质感。
- 低圆角或无圆角矩形。
- 粗描边、硬阴影、像素小装饰。
- 奶油底色、粉色条纹区、淡紫棋盘格背景。
- 内容卡片像“任务面板”，按钮像“游戏菜单项”。

禁止偏离：

- 不要改成现代极简白卡片风。
- 不要使用大圆角胶囊按钮。
- 不要用大面积渐变、玻璃拟态、毛玻璃、霓虹光效或装饰性光斑。
- 不要把页面做成营销 landing page。
- 不要使用 emoji 作为图标；需要图标时使用项目现有图标/像素块表达。

## 5. 色彩规范

从参考图抽象出的 token 方向：

| 用途 | 建议色值 | 说明 |
| --- | --- | --- |
| 页面底色 | `#f7efe8` | 奶油纸张底，用于全局背景 |
| 主粉色区 | `#f3bfd2` | hero / 模块头部条纹底色 |
| 浅粉色 | `#f7dbe5` | 卡片顶部边、轻量强调 |
| 淡紫色 | `#d8c8ef` | 次级按钮、分隔带、棋盘格 |
| 黄色强调 | `#f7c957` | 主 CTA、像素点、状态高亮 |
| 深紫描边 | `#5a4a6f` | 边框、阴影、主文字 |
| 正文深色 | `#2e2940` | 标题和正文主色 |
| 辅助红粉 | `#cc5b83` | 面包屑、小标题、模块标签 |
| 卡片底色 | `#fff8ed` | 内容卡片底 |

参考 CSS 中的 token 对应：

| CSS token | RN token 建议 | 用途 |
| --- | --- | --- |
| `--ink` / `--ink-deep` | `colors.ink` / `colors.inkDeep` | 主文字、标题、图标前景 |
| `--outline` | `colors.outline` | 所有像素边框 |
| `--shadow` | `colors.pixelShadow` | 硬阴影色 |
| `--wall` / `--wall-2` / `--wall-3` | `colors.wall` / `colors.wallAlt` / `colors.wallStripe` | 页面背景和 hero 条纹 |
| `--floor` / `--floor-2` / `--floor-3` | `colors.floor` / `colors.floorTileA` / `colors.floorTileB` | 底部棋盘格和分区背景 |
| `--panel` / `--panel-2` / `--panel-3` | `colors.panel` / `colors.panelPink` / `colors.panelLavender` | 卡片、标题条、次级按钮 |
| `--field` | `colors.field` | tag、输入区、轻面板 |
| `--rose` / `--rose-deep` | `colors.rose` / `colors.roseDeep` | 模块强调、eyebrow、状态标签 |
| `--blue` / `--mint` / `--gold` | `colors.blue` / `colors.mint` / `colors.gold` | 模块色、CTA、像素装饰 |
| `--danger` | `colors.danger` | 错误状态 |

使用规则：

- 所有色值应进入 theme token，不要在组件内散落 raw hex。
- 主视觉以粉色、奶油色和深紫描边为核心。
- 黄色只用于主操作、计数强调和小像素装饰，不要铺满页面。
- 功能状态色必须配合文字，不得只靠颜色表达。
- 财经轻资讯的“非投资建议”标识可以使用黄色强调，但文案必须清晰。

## 6. 字体与文字层级

参考图使用像素/复古显示字体表达品牌，但正文仍需要可读。

建议：

- 标题可使用当前项目可用的粗体系统字，必要时后续再引入像素风标题字体。
- 正文优先使用系统字体，保证中文可读性。
- 英文小字如 `PROJECTM / EMPLOYEE DASHBOARD` 可使用等宽或像素风字重。
- 不要为了像素风牺牲中文阅读；正文最小字号保持移动端可读。

层级建议：

| 层级 | 用途 | 建议 |
| --- | --- | --- |
| Eyebrow | `PROJECTM / EMPLOYEE DASHBOARD`、模块小标题 | 小号、粉红色、全大写英文或轻量中文 |
| H1 | 页面主标题 | 大号、深紫、粗体 |
| H2 | 卡片标题 | 中大号、深紫、粗体 |
| Body | 描述文字 | 深紫或灰紫，行高充足 |
| Meta | 日期、标签、数量 | 小号、描边标签或计数条 |
| CTA | 查看详情、下载文档、继续学习 | 粗体、居中、可触达 |

## 7. 布局规范

移动端页面结构统一为：

1. 顶部留出安全区。
2. 左上角汉堡菜单按钮或返回按钮，使用像素描边方块。
3. 粉色条纹 hero 面板，包含 eyebrow、页面标题、说明文字和若干状态/操作条。
4. 模块计数条，如“模块名 · 6 条”。
5. 纵向内容卡片列表。
6. 卡片之间使用棋盘格/浅色背景分隔。

布局细节：

- 页面主内容宽度应贴近移动端屏幕，但保留 16 到 20 px 外边距。
- 页面背景可采用上浅下深的分区：顶部奶油底承接状态栏，中段粉色 hero，列表区使用浅棋盘格或淡色块，避免整屏单一白底。
- 移动端首屏优先展示当前模块标题、说明、状态条和第一张内容卡片；不要把欢迎文案或装饰图占满首屏。
- Web 与 Mobile 的模块顺序、色彩 token、卡片状态词应保持一致；布局密度、导航和触控尺寸按移动端单列优先。
- Hero 面板和卡片使用 4 px 左右深紫描边。
- 阴影使用硬阴影，偏移 4 到 8 px，不使用柔和 blur shadow。
- 卡片高度允许随内容增长，但列表中的同类卡片内部结构要一致。
- 卡片右上角可放状态小按钮，如“置顶”“发布”。
- 卡片底部右侧可放 2x2 或 2x3 小像素色块装饰。
- 页面以垂直滚动为主，不做横向滑动主交互。
- 左上角菜单按钮、菜单列表和顶部操作区不能遮挡内容；滚动容器顶部预留菜单安全距离，底部只保留系统安全区。

参考 CSS 到 RN 的布局翻译：

| Web 源模式 | 移动端 RN 做法 |
| --- | --- |
| `.shell` 双栏 + sticky side | 不照搬；移动端用左上角菜单列表 + Stack 路由 |
| `.hero-panel` | 每个模块页顶部 `PixelHero`，单列内容，操作条可换行 |
| `.focus-grid` / `.content-grid` | 移动端统一单列；首页可用 1 张主 focus card + 2 张次级卡 |
| `.module-grid` | 移动端用两列或单列模块入口；小屏小于 360 px 时单列 |
| `.panel-title` | `PixelSectionHeader`，左右黄色像素点，标题可换行 |
| `.card.primary` | 首页今日简报主卡，宽度 100%，高度随内容增长 |
| `.meta` flex wrap | RN 使用 `flexDirection: row` + `flexWrap: wrap`，tag 间距固定 8 px |
| `.loading-scene` | RN 使用 skeleton card 和像素点 loading，尊重 reduced motion |

## 8. 组件规范

### 8.1 Hero 面板

Hero 面板用于每个模块页顶部：

- 背景：粉色条纹。
- 边框：深紫粗描边。
- 阴影：硬阴影。
- 内容：eyebrow、H1、说明文字。
- 操作条：Cloud、像素图标条、`SYNC DATA` 可作为视觉 motif，但当前不代表真实推送或同步需求。

注意：`SYNC DATA` 是视觉参考，不代表要新增同步功能。

### 8.2 内容卡片

卡片用于列表项：

- 背景：奶油色。
- 顶部或左边可使用粉色/青色/黄色细边区分模块。
- 标题格式可参考“模块名 · 粉色样例 1”。
- 正文一到两行，避免过长。
- 标签使用小描边按钮，如日期、`CBCX`、`ProjectM`。
- 主 CTA 放在卡片下部左侧或内容下方，如“查看详情”“下载文档”“继续学习”。
- 右上角状态按钮用于“置顶”“发布”等只读状态展示；当前 App 不做管理写入。

### 8.3 按钮

按钮类型：

- 主按钮：黄色底、深紫描边、硬阴影。
- 次按钮：淡紫底、深紫描边。
- 轻按钮：奶油底、深紫描边。
- 危险或错误按钮不应大面积使用红色，优先深紫边框加明确文字。

按钮规则：

- 触控目标至少 44 px 高。
- 按下态使用 2 到 4 px 下沉或阴影缩短。
- loading 态要禁用重复点击。
- 文案短而明确，不使用只有图标的关键操作。

### 8.4 标签与计数条

计数条样式：

- 淡粉或奶油底。
- 左右黄色像素点装饰。
- 文案格式：“模块名 · 6 条”。
- 作为列表前的 section header。

标签样式：

- 小矩形描边。
- 可用于日期、来源、ProjectM、模块分类。
- 不要做成圆角 pill。

### 8.5 状态与 loading

从参考包可继承状态表达，但需要移动端化：

- `Cloud / Offline` 可转成 API 状态提示或错误 banner；不要解释成推送、同步或离线功能。
- Loading 使用 3 个像素点或 skeleton 卡片，动画短、可关闭或尊重系统 reduced motion。
- Empty state 使用同样的描边面板，不使用大插画。
- Error state 使用 `danger` 边框和明确文案，保留 retry 按钮。

## 9. 模块特定参考

| 模块 | 视觉重点 |
| --- | --- |
| 今日公司简报 | 首页第一优先级；hero 下方第一张卡片应显著展示今日简报。 |
| 公司公告墙 | 保持公告正式感，卡片状态“置顶/发布”清晰。 |
| 员工论坛热帖 | 允许更轻快，突出热度、讨论和协作感，但不新增发帖管理。 |
| 新人专区 | 可更温和，CTA 指向新人资料或任务详情。 |
| 财经轻资讯 | 必须出现“非投资建议”或等价合规标识，且位置醒目。 |
| 文档中心 | CTA 优先为“下载文档”或“查看详情”，文档权限状态必须清晰。 |
| 培训中心 | CTA 可为“继续学习”，展示进度时要清楚但不拥挤。 |

## 10. 与当前 PRD 的边界

参考图中如果出现以下内容，不代表当前要实现：

- Admin Console。
- 推送通知。
- 通知偏好。
- 收藏。
- 个人下载记录。
- 新的同步系统或离线同步能力。

这些能力已在当前移动端范围中搁置。视觉上可以保留像素按钮、计数条和状态条，但不能把它们解释为新增功能。

## 11. 实现建议

- 在 `mobile/src/theme/` 中补充像素风 color、spacing、border、shadow token。
- 组件优先抽象为 `PixelPanel`、`PixelCard`、`PixelButton`、`PixelTag`、`PixelSectionHeader`。
- 可增加 `PixelHero`、`PixelMetaRow`、`PixelLoadingScene`、`PixelEmptyState`，分别对应参考包的 `hero-panel`、`meta`、`loading-scene`、`empty`。
- 背景层建议做成 `PixelPageBackground`，用 RN View 分区和小 tile 组件模拟墙面 / 地面 / 棋盘格，不依赖 Web CSS gradient。
- 硬阴影统一封装，iOS 使用 shadow props，Android 使用 elevation 不足时用偏移底层 View 模拟。
- `imageRendering: pixelated` 是 Web 特性；RN 中只对实际像素图资产使用固定尺寸和 nearest-like 资源策略，不要拉伸模糊。
- 优先把参考 CSS 抽象为 RN token 和组件 props，不要逐条翻译 CSS。
- 页面先改 active 员工门户模块，不动搁置区功能。
- 实现前先为关键组件写视觉结构测试或可观察行为测试。
- 所有页面保留 401、403、loading、error、empty、retry 状态。
- 真机检查时重点看中文换行、按钮触控面积、卡片阴影是否遮挡内容。

## 12. 验收要点

后续 UI 改动完成后至少检查：

- 页面是否明显接近粉色像素风参考，而不是普通白卡片风。
- 卡片、按钮、标签是否使用深紫描边和硬阴影。
- 圆角是否克制，不能出现大胶囊风。
- 主 CTA 是否足够清晰且触控面积达标。
- 长中文标题是否换行正常，不遮挡按钮或标签。
- 财经轻资讯是否保留非投资建议提示。
- 文档中心是否保留权限与下载/预览边界。
- 没有恢复已搁置功能。
