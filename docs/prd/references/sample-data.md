# ProjectM 样例数据参考

## 1. 目的与状态

本文提供 ProjectM PRD 与实现阶段可共用的样例内容语义。样例用于对齐业务含义，不是最终迁移 SQL，也不是测试用例。

JSON 示例中的字段名保留英文代码风格；中文正文代表样例展示内容。

## 2. 样例角色与用户

```json
[
  {
    "id": "user-employee-001",
    "displayName": "林一凡",
    "role": "user",
    "department": "产品部"
  },
  {
    "id": "user-super-001",
    "displayName": "周管理员",
    "role": "super_user",
    "department": "运营部"
  }
]
```

## 3. 七个模块样例

### 3.1 今日公司简报

```json
{
  "id": "briefing-2026-05-27",
  "title": "5 月 27 日公司简报",
  "summary": "今日重点包括产品发布准备、培训提醒和文档更新。",
  "status": "published",
  "effectiveDate": "2026-05-27",
  "priority": 10
}
```

### 3.2 公司公告墙

```json
{
  "id": "announcement-office-hours",
  "title": "端午节办公安排通知",
  "category": "行政通知",
  "pinned": true,
  "status": "published",
  "validUntil": "2026-06-30"
}
```

### 3.3 员工论坛热帖

```json
{
  "id": "forum-post-product-demo",
  "title": "本周产品演示问题收集",
  "hotScore": 87,
  "commentCount": 24,
  "visibility": "visible"
}
```

### 3.4 新人专区

```json
{
  "id": "newcomer-task-security-training",
  "title": "完成信息安全入门培训",
  "taskType": "training",
  "dueOffsetDays": 7,
  "status": "published"
}
```

### 3.5 财经轻资讯

```json
{
  "id": "finance-macro-brief-001",
  "title": "一文看懂近期宏观利率变化",
  "category": "宏观知识",
  "disclaimer": "本文仅用于内部知识分享，不构成投资建议。",
  "complianceChecked": true,
  "status": "published"
}
```

### 3.6 文档中心

```json
{
  "id": "document-expense-policy",
  "title": "差旅与报销制度",
  "category": "制度文件",
  "version": "v1.0",
  "accessLevel": "internal",
  "status": "published"
}
```

### 3.7 培训中心

```json
{
  "id": "training-product-onboarding",
  "title": "产品基础认知课程",
  "courseType": "onboarding",
  "estimatedMinutes": 45,
  "status": "published"
}
```

## 4. 内容状态参考

阶段 PRD 和实现阶段可以基于以下状态收敛具体枚举：

- `draft`：草稿。
- `scheduled`：已排期。
- `published`：已发布。
- `archived`：已归档。
- `hidden`：已隐藏或治理处理。
- `disabled`：已停用。

具体枚举应由对应数据库和后端阶段 PRD 确认，不要在端侧 PRD 中自行发明。

## 5. 样例使用规则

- 样例内容可以用于本地演示、文档说明和假数据准备。
- 样例不应被当成生产数据。
- 样例不得包含真实员工隐私、密钥、客户信息或财务敏感数据。
- 财经样例必须始终包含非投资建议提示。
- 样例不得引入旧角色名或浏览历史字段。

## 6. Admin 仪表盘样例

```json
{
  "pendingDrafts": 3,
  "scheduledItems": 2,
  "documentsToReview": 1,
  "trainingCoursesPublished": 8,
  "latestAuditEvent": "周管理员发布了端午节办公安排通知"
}
```

## 7. 空状态样例

| 场景 | 建议含义 |
| --- | --- |
| 员工列表无内容 | 当前没有可见内容。 |
| 管理列表无内容 | 暂无记录，`super_user` 可创建第一条内容。 |
| 搜索无结果 | 没有匹配搜索条件的内容。 |
| 无权限 | 当前账户无权访问该资源。 |
| 会话过期 | 请重新登录后继续。 |
