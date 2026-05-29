# Notifications

推送权限、Expo push token 注册、通知点击路由和通知偏好设置的封装位置。真实 `expo-notifications` 能力保持懒加载：push token 注册和通知点击 response listener 默认使用 Expo provider，测试可注入 provider，非原生/Jest 环境不会在模块加载时 require native 模块。通知点击只会经过 `clickRouting` 白名单路由，不接收外部 URL、Admin 路径或路径穿越。

本仓库当前只声明代码级 listener readiness；未声明已完成 iOS / Android 真机通知点击 smoke。
