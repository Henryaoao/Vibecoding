# B P01 Allowed Scope

席位：B - Web shell、模块挂载点、设计系统基础、通用状态组件

## 可以修改

必须从 D 已推送的平台基线开始。

优先限制在以下范围：

- `ProjectM-source-code/frontend/src/main.tsx`
- `ProjectM-source-code/frontend/src/pages/`
- `ProjectM-source-code/frontend/src/components/`
- `ProjectM-source-code/frontend/src/services/`
- `ProjectM-source-code/frontend/src/types/`
- `ProjectM-source-code/frontend/src/styles.css`
- Web shell 需要的轻量文档或 README

## 允许内容

- 员工门户 shell。
- 七个 MVP 模块挂载点或占位区域。
- `user` / `super_user` 的前端入口展示边界。
- loading / empty / error / unauthorized / retry 状态组件。
- Admin Console 壳层入口，但不做 Admin 写入能力。
- A/C 后续可接入的目录、类型和 mock 约定。

## 禁止修改

- 不改后端授权事实。
- 不改数据库 schema。
- 不做完整业务模块页面。
- 不做 Admin 写入。
- 不把前端路由保护当成权限事实。
- 不实现浏览历史、最近浏览、访问轨迹。
- 不提交真实 `.env` 或密钥。

## 冲突处理

如果 Web shell 需要新增或改变 API envelope、cookie 名称、后端认证合同，停止并回报给 D/合并负责人，不要自行改后端合同。
