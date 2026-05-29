# ProjectM Diagrams

This document uses Mermaid diagrams so the PRD, database, Docker setup, and
agent workflow can be reviewed visually in Markdown-supported tools.

Scope note: these diagrams are a visual companion to the ProjectM planning
documents and the current `ProjectM-source-code` PostgreSQL/Docker baseline. They do
not claim that the React frontend or Go backend implementation is complete.

## 1. System Overview

```mermaid
flowchart LR
  User["普通用户 user"] --> Portal["ProjectM 内部门户"]
  SuperUser["超级用户 super_user"] --> Admin["后台管理"]

  Portal --> Brief["今日公司简报"]
  Portal --> Announcements["公司公告墙"]
  Portal --> Forum["员工论坛热帖"]
  Portal --> Newcomer["新人专区"]
  Portal --> Finance["财经轻资讯"]
  Portal --> Documents["文档中心"]
  Portal --> Training["培训中心"]

  Admin --> ContentOps["内容发布与维护"]
  ContentOps --> Brief
  ContentOps --> Announcements
  ContentOps --> ForumGovernance["论坛热帖与内容治理"]
  ForumGovernance --> Forum
  ContentOps --> Newcomer
  ContentOps --> Finance
  ContentOps --> Documents
  ContentOps --> Training

  Portal --> API["Go REST API"]
  Admin --> API
  API --> PostgreSQL[("PostgreSQL projectm")]
```

## 2. Role Permissions

```mermaid
flowchart TB
  User["user 普通用户"]
  SuperUser["super_user 超级用户"]

  User --> ReadHome["查看首页模块"]
  User --> ReadAnnouncements["查看公告"]
  User --> ForumReadWrite["浏览论坛与发帖"]
  User --> ReadDocs["查看文档与培训"]
  User --> ReadFinance["查看财经轻资讯"]

  SuperUser --> AllUserActions["拥有普通用户能力"]
  SuperUser --> AdminConsole["进入后台管理"]
  SuperUser --> PublishContent["创建、编辑、发布、归档内容"]
  SuperUser --> PinContent["置顶公告与管理首页展示"]
  SuperUser --> ModerateForum["隐藏或归档论坛内容"]
  SuperUser --> ManageUsers["管理用户状态与角色"]
  SuperUser --> AuditLogs["查看审计日志"]

  AdminConsole --> PublishContent
  AdminConsole --> ManageUsers
  AdminConsole --> AuditLogs
```

## 3. Homepage Modules

```mermaid
flowchart LR
  Home["首页"]

  Home --> DailyBrief["今日公司简报"]
  DailyBrief --> TodayNotice["今日公告"]
  DailyBrief --> TodayEvent["今日活动"]
  DailyBrief --> Weather["天气提醒"]
  DailyBrief --> HotPost["热门帖子"]
  DailyBrief --> FinanceLine["财经一句话"]
  DailyBrief --> Birthday["生日提醒"]

  Home --> NoticeWall["公司公告墙"]
  NoticeWall --> Holiday["节假日安排"]
  NoticeWall --> Office["办公区通知"]
  NoticeWall --> Benefit["福利通知"]
  NoticeWall --> EventNotice["活动通知"]

  Home --> ForumHot["员工论坛热帖"]
  ForumHot --> HotThreads["热门帖子"]
  ForumHot --> LatestReplies["最新回复"]
  ForumHot --> WeeklyTopic["每周讨论话题"]

  Home --> Newcomer["新人专区"]
  Newcomer --> Guide["新人指南"]
  Newcomer --> Map["办公区地图"]
  Newcomer --> Systems["常用系统说明"]
  Newcomer --> FAQ["常见问题"]

  Home --> Finance["财经轻资讯"]
  Finance --> MorningRead["财经早知道"]
  Finance --> Calendar["财经日历"]
  Finance --> AntiFraud["反诈提醒"]

  Home --> Docs["文档中心"]
  Home --> Training["培训中心"]
```

## 4. Database ERD

### 4.1 Table Responsibility Map

This diagram explains what each database table is responsible for before showing
the field-level ERD.

```mermaid
flowchart TB
  Users["users\n用户账号、角色、头像、账号状态\n权限判断的核心表"]
  Briefs["company_briefs\n今日公司简报\n首页顶部每日汇总内容"]
  Announcements["announcements\n公司公告墙\n节假日、办公区、福利、活动通知"]
  Forum["forum_posts\n员工论坛帖子\n标题、正文、浏览量、热度分"]
  Comments["forum_comments\n帖子评论与楼中楼回复\n记录谁评论、回复哪条评论"]
  Reactions["forum_reactions\n帖子/评论点赞来源\n避免只有计数没有来源"]
  Newcomer["newcomer_resources\n新人专区\n新人指南、地图、系统说明、FAQ"]
  Finance["finance_news\n财经轻资讯\n内部编辑发布的轻量财经内容"]
  Documents["documents\n文档中心\n制度、流程、模板、文件链接"]
  Downloads["document_downloads\n文档下载记录\n支持下载统计和审计追踪"]
  Training["training_courses\n培训中心\n课程内容、时长、封面图、发布状态"]
  Progress["training_course_progress\n培训学习进度\n记录每个用户每门课的完成状态"]
  Audit["audit_logs\n审计日志\n记录后台关键操作和目标资源"]

  Users -->|"created_by_user_id"| Briefs
  Users -->|"created_by_user_id"| Announcements
  Users -->|"author_user_id"| Forum
  Users -->|"author_user_id"| Comments
  Users -->|"user_id"| Reactions
  Users -->|"created_by_user_id"| Newcomer
  Users -->|"created_by_user_id"| Finance
  Users -->|"created_by_user_id"| Documents
  Users -->|"user_id"| Downloads
  Users -->|"created_by_user_id"| Training
  Users -->|"user_id"| Progress
  Users -->|"actor_user_id"| Audit
  Forum -->|"forum_post_id"| Comments
  Comments -->|"parent_comment_id"| Comments
  Forum -->|"target_resource_id"| Reactions
  Comments -->|"target_resource_id"| Reactions
  Documents -->|"document_id"| Downloads
  Training -->|"course_id"| Progress
```

### 4.2 Field-Level ERD

```mermaid
erDiagram
  users ||--o{ company_briefs : created_by_user_id
  users ||--o{ announcements : created_by_user_id
  users ||--o{ forum_posts : author_user_id
  users ||--o{ forum_comments : author_user_id
  users ||--o{ forum_reactions : user_id
  users ||--o{ newcomer_resources : created_by_user_id
  users ||--o{ finance_news : created_by_user_id
  users ||--o{ documents : created_by_user_id
  users ||--o{ document_downloads : user_id
  users ||--o{ training_courses : created_by_user_id
  users ||--o{ training_course_progress : user_id
  users ||--o{ audit_logs : actor_user_id
  forum_posts ||--o{ forum_comments : forum_post_id
  forum_comments ||--o{ forum_comments : parent_comment_id
  documents ||--o{ document_downloads : document_id
  training_courses ||--o{ training_course_progress : course_id

  users {
    varchar user_id PK
    varchar email
    varchar display_name
    varchar avatar_url
    enum role_code
    varchar department
    varchar title
    enum account_status
    timestamp created_at
    timestamp updated_at
  }

  company_briefs {
    varchar brief_id PK
    date brief_date
    varchar title
    text summary
    varchar cover_image_url
    varchar weather_note
    varchar finance_one_liner
    varchar birthday_note
    enum publication_status
    varchar created_by_user_id FK
    timestamp published_at
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  announcements {
    varchar announcement_id PK
    varchar title
    enum announcement_category
    text summary
    varchar cover_image_url
    varchar attachment_image_url
    mediumtext content_body
    boolean is_pinned
    enum publication_status
    varchar created_by_user_id FK
    timestamp published_at
    timestamp expires_at
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  forum_posts {
    varchar forum_post_id PK
    varchar title
    varchar author_user_id FK
    varchar forum_category
    varchar image_url
    mediumtext content_body
    int reply_count
    int view_count
    int like_count
    decimal hot_score
    enum visibility_status
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  forum_comments {
    varchar comment_id PK
    varchar forum_post_id FK
    varchar parent_comment_id FK
    varchar author_user_id FK
    mediumtext content_body
    varchar image_url
    int reply_count
    int like_count
    enum visibility_status
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  forum_reactions {
    varchar reaction_id PK
    enum target_resource_type
    varchar target_resource_id
    varchar user_id FK
    enum reaction_type
    timestamp created_at
  }

  newcomer_resources {
    varchar newcomer_resource_id PK
    varchar title
    enum newcomer_resource_type
    text summary
    varchar cover_image_url
    mediumtext newcomer_content
    int sort_order
    enum publication_status
    varchar created_by_user_id FK
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  finance_news {
    varchar finance_news_id PK
    varchar title
    varchar source_name
    json tag_names_json
    text summary
    varchar thumbnail_image_url
    mediumtext content_body
    date publish_date
    enum publication_status
    varchar created_by_user_id FK
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  documents {
    varchar document_id PK
    varchar title
    varchar document_category
    text summary
    varchar cover_image_url
    varchar file_url
    mediumtext document_content
    enum publication_status
    varchar created_by_user_id FK
    int download_count
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  document_downloads {
    varchar download_id PK
    varchar document_id FK
    varchar user_id FK
    timestamp downloaded_at
  }

  training_courses {
    varchar course_id PK
    varchar title
    varchar course_category
    text summary
    varchar cover_image_url
    mediumtext course_content
    int duration_minutes
    enum publication_status
    varchar created_by_user_id FK
    timestamp created_at
    timestamp updated_at
    timestamp deleted_at
  }

  training_course_progress {
    varchar progress_id PK
    varchar course_id FK
    varchar user_id FK
    int progress_percent
    enum progress_status
    timestamp started_at
    timestamp completed_at
    timestamp created_at
    timestamp updated_at
  }

  audit_logs {
    varchar audit_log_id PK
    varchar actor_user_id FK
    varchar action_name
    varchar target_resource_type
    varchar target_resource_id
    json metadata_json
    timestamp created_at
  }
```

### 4.3 Table Function Notes

| Table | Business Function | Main User | Important Notes |
| --- | --- | --- | --- |
| `users` | Stores employee accounts, display names, avatars, role code, department, title, and account status. | `user`, `super_user` | Only two roles are allowed: `user` and `super_user`. Backend authorization should check `role_code`. |
| `company_briefs` | Stores the daily company brief shown at the top of the homepage. | `super_user` creates, all users read | One brief per day through `brief_date`; includes weather, finance one-liner, birthday note, and cover image. |
| `announcements` | Stores company notices such as holidays, office notices, benefits, and events. | `super_user` creates, all users read | Supports pinned notices, cover image, attachment image, and publish/archive workflow. |
| `forum_posts` | Stores forum posts used by the homepage hot-post module. | `user` can author, `super_user` moderates | Uses `reply_count`, `view_count`, `like_count`, and `hot_score`; counts are cache fields, not the source of truth. |
| `forum_comments` | Stores comments and nested replies for forum posts. | `user` comments, `super_user` moderates | `parent_comment_id` supports one-level or nested reply UI; `author_user_id` records who commented. |
| `forum_reactions` | Stores likes for posts and comments. | `user` reacts, `super_user` audits if needed | Unique constraint prevents the same user from liking the same target repeatedly. |
| `newcomer_resources` | Stores default newcomer content such as guides, maps, system instructions, food tips, FAQ, and intro wall items. | `super_user` manages, newcomers read | Uses `sort_order` to control display order; old employees may hide the module later. |
| `finance_news` | Stores internally edited finance light-news content. | `super_user` creates, all users read | No external auto-scraping in MVP; no investment advice, stock recommendation, or return promise. |
| `documents` | Stores document-center entries, summaries, file URLs, and optional content text. | `super_user` manages, all users read | `file_url` is reserved for PDFs, templates, policies, and downloadable files. |
| `document_downloads` | Stores explicit document download events. | `user` downloads, `super_user` audits | This is an action log, not passive browsing history. |
| `training_courses` | Stores training-center courses, summaries, cover image, content, duration, and publish status. | `super_user` manages, all users read | Can support onboarding training and security training before a full LMS is built. |
| `training_course_progress` | Stores each user's progress for each training course. | `user` studies, `super_user` reviews completion | Unique `(user_id, course_id)` avoids duplicate progress records. |
| `audit_logs` | Stores key admin actions for traceability. | `super_user` reviews | Records actor, action, target resource type, target ID, and metadata JSON. |

ID convention:

- Business tables use semantic string primary keys instead of auto-incrementing numeric IDs.
- Format: `<PREFIX>_<ULID-like suffix>`, for example `TRN_01JPM000000000000000001A`.
- Prefix examples: `USR`, `BRF`, `ANN`, `FPO`, `FCM`, `FRE`, `NWR`, `FIN`, `DOC`, `DLD`, `TRN`, `TCP`, `AUD`.

## 5. Semantic ID Design

```mermaid
flowchart LR
  Request["Create request"] --> Handler["REST handler"]
  Handler --> Service["Service layer"]
  Service --> IDGen["internal/idgen"]
  IDGen --> Prefix["Resource prefix"]
  IDGen --> Suffix["ULID-style sortable suffix"]
  Prefix --> ID["DOC_01JPM..."]
  Suffix --> ID
  ID --> Repo["Repository insert"]
  Repo --> PostgreSQL[("PostgreSQL varchar PK")]

  ClientID["Client supplied ID"] -. rejected .-> Handler
```

## 6. Docker Runtime

```mermaid
flowchart LR
  Browser["Browser"] --> PMA["pgAdmin :5050"]
  PMA --> PostgreSQL["PostgreSQL :5432"]
  Compose["docker compose"] --> PMA
  Compose --> PostgreSQL
  InitSQL["ProjectM-source-code/database/init/001_projectm_schema.sql"] --> PostgreSQL
  InitMount["./database/init -> /docker-entrypoint-initdb.d:ro"] --> PostgreSQL
  Migrations["ProjectM-source-code/database/migrations/*.sql\nfuture migrations directory"] -. optional .-> PostgreSQL
  Volume[("postgres_data volume")] --> PostgreSQL

  PostgreSQL --> Charset["UTF8"]
```

## 7. Conceptual Agent Collaboration

```mermaid
flowchart TB
  Lead["Codex lead\nconceptual coordinator, not live tmux panes"] --> Planner["Planner"]
  Lead --> Product["Product / PRD Owner"]
  Lead --> Architect["Architect"]
  Lead --> DBA["Database Specialist"]
  Lead --> DevOps["DevOps"]
  Lead --> QA["QA / Verifier"]
  Lead --> Writer["Writer"]

  Planner --> Scope["Scope and milestones"]
  Product --> Requirements["Functional and non-functional requirements"]
  Architect --> API["Go REST API boundaries"]
  DBA --> Schema["PostgreSQL schema and seed data"]
  DevOps --> Docker["Docker Compose and pgAdmin"]
  QA --> Checks["Validation checklist"]
  Writer --> Docs["Final Markdown documents"]

  Scope --> Review["Multi-expert review"]
  Requirements --> Review
  API --> Review
  Schema --> Review
  Docker --> Review
  Checks --> Review
  Docs --> Review

  Review --> Prd["docs/prd/projectm-overall-prd.md"]
  Review --> Permissions["docs/prd/references/permissions-and-admin-guide.md"]
  Review --> SampleData["docs/prd/references/sample-data.md"]
  Review --> SourceCode["ProjectM-source-code/"]
```

## 8. Admin Content Publishing Flow

```mermaid
sequenceDiagram
  actor Admin as super_user
  participant UI as Admin Console
  participant API as Go REST API
  participant DB as PostgreSQL
  participant Audit as audit_logs

  Admin->>UI: Create or edit content
  UI->>API: Submit draft
  API->>API: Validate backend role_code = super_user
  alt Not super_user
    API-->>UI: 403 Forbidden
    API->>Audit: Record rejected admin action
  else Validation failed
    API-->>UI: 400 Validation error
  else Draft accepted
    alt Draft save failed
      API-->>UI: Error with no portal visibility change
      API->>Audit: Record failed create/update action
    else Draft saved
      API->>DB: Save draft with semantic ID and publication_status = draft
      API->>Audit: Record create/update action
      API-->>UI: Draft saved
    end
  end

  Admin->>UI: Publish draft
  UI->>API: Publish request
  API->>API: Validate backend role_code = super_user
  alt Not super_user
    API-->>UI: 403 Forbidden
    API->>Audit: Record rejected publish action
  else Save or publish failed
    API-->>UI: Error with no portal visibility change
    API->>Audit: Record failed publish action
  else Published
    API->>DB: Set publication_status = published and published_at
    API->>Audit: Record publish action
    DB-->>UI: Published content appears in portal
  end

  Admin->>UI: Archive published content
  UI->>API: Archive request
  API->>API: Validate backend role_code = super_user
  alt Not super_user
    API-->>UI: 403 Forbidden
    API->>Audit: Record rejected archive action
  else Archive failed
    API-->>UI: Error with previous status preserved
    API->>Audit: Record failed archive action
  else Archived
    API->>DB: Set publication_status = archived
    API->>Audit: Record archive action
    DB-->>UI: Archived content removed from normal portal lists
  end
```
