# Files

文件预览、preview URL、下载和外部应用打开能力的移动端封装位置。

当前边界：

- 文档详情只在有权限文档上请求短期 preview/download 元数据；无权限文档不得请求或展示文件名、mime type、preview URL 或 download URL。
- `preview.ts` 保留可注入 file capabilities，方便 Jest 覆盖系统预览、下载进度、失败重试和降级行为。
- 默认真实文件 provider 的设备级保存/分享能力需要在 development / preview build 中做 iOS/Android smoke；不要用 Jest 或 mock URL 结果声明真机/后端文件服务已验证。
