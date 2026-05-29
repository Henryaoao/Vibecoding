# `/api/v1/admin/*` Backend Authorization Contract

席位：D
阶段：P01

## 确认结论

后续任何 `/api/v1/admin/*` 后端路由都必须由后端执行 `super_user` 授权保护。前端隐藏 Admin 入口、移动端不暴露 Admin 页面或客户端传入角色都不能替代后端鉴权。

## 必须满足

- 后端在进入 Admin handler 之前读取并校验 `projectm_session`。
- 后端必须从可信用户存储读取当前用户角色，确认角色为 `super_user` 后才允许访问 `/api/v1/admin/*`。
- 未登录请求返回 `401` 级别的 API envelope；已登录但非 `super_user` 请求返回 `403` 级别的 API envelope。
- 角色集合保持仅 `user` 与 `super_user`，不得新增第三种应用角色。
- Admin 写入业务和完整模块 Admin API 不在 D P01 范围内，留给后续对应席位实现。

## 当前 D P01 边界

D P01 只确认运行基线与授权合同，不新增 Admin 写入业务。当前后端已经具备：

- `projectm_session` 签发/校验边界。
- API envelope / error shape。
- `CurrentUser.RoleCode` 字段和用户表 `role_code` 来源。
- 健康检查与基础员工端受保护路由。

后续实现 `/api/v1/admin/*` 时，应在上述基础上增加后端 `super_user` guard，并为 `user` 访问 Admin 命名空间失败补充测试。
