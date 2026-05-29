# C P01 Allowed Scope

席位：C - App shell、热帖/新人/财经基础字段和合规展示边界

## 可以修改

必须从 B 已推送的 Web shell 基线开始。

优先限制在以下范围：

- `mobile/src/navigation/`
- `mobile/src/auth/`
- `mobile/src/api/`
- `mobile/src/components/`
- `mobile/src/types/`
- `mobile/src/screens/` 中与 shell、状态或占位边界有关的最小改动
- 热帖、新人、财经相关的基础 mock 字段和合规展示边界
- 必要的轻量说明文档

## 允许内容

- App 未登录、会话过期、无权限、离线、弱网、重试、空状态和错误状态的 shell 边界。
- 热帖、新人、财经的基础字段和 mock 边界。
- 财经轻资讯的非投资建议提示边界。

## 禁止修改

- 不做移动端 Admin Console。
- 不做移动端管理写入。
- 不改后端 API 合同。
- 不改数据库 schema。
- 不做完整模块体验。
- 不缓存敏感文档。
- 不实现浏览历史、最近浏览、访问轨迹。
- 财经轻资讯不得出现投资建议、买卖建议、个股预测或收益承诺。
- 不提交真实 `.env` 或密钥。

## 冲突处理

如果 App 需要新增后端合同或数据库字段，停止并回报，不要在 P01 内扩到 P02/P03。
