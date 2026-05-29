# A P01 Allowed Scope

席位：A - 今日公司简报 / 公司公告墙基础数据形态和 mock 边界

## 可以修改

必须从 B 已推送的 Web shell 基线开始。

优先限制在以下范围：

- `ProjectM-source-code/frontend/src/` 中 B 明确放行的 module foundation / mock / type 接入目录。
- 今日公司简报和公司公告墙相关的基础类型、mock 边界、只读占位接入。
- 只服务 P01 shell 和后续 P02/P03/P04 衔接的轻量说明文档。
- 如 B 建立了明确挂载点，可接入简报/公告占位卡片，但不得做完整业务页。

## 禁止修改

- 不改后端 API 合同。
- 不改数据库 schema 或迁移。
- 不做完整简报/公告业务模块。
- 不做 Admin 写入。
- 不改 App shell。
- 不改 D 的 Docker / 后端运行基线。
- 不引入第三种角色。
- 不实现浏览历史、最近浏览、访问轨迹。
- 不提交真实 `.env` 或密钥。

## 冲突处理

如果需要改 B 的 shell 合同、D 的 API envelope 或数据库事实，停止并回报，不要自行扩范围。
