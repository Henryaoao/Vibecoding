import type {
  AdminAuditLogItem,
  AdminCategoryItem,
  AdminContentItem,
  AdminCourseItem,
  AdminDocumentItem,
  AdminNewcomerTaskItem,
  AdminPortalConfigColumn,
  AdminTagItem,
  AdminUserItem,
  AnnouncementDetail,
  CourseDetail,
  CourseItem,
  FinanceInfoDetail,
  ForumHotPostDetail,
  BriefDetail,
  BriefStatus,
  DocumentItem,
  HomeSummary,
  MeDownloadRecord,
  MeFavoriteItem,
  NewcomerContentDetail,
  ProfileSummary,
  Role,
  User
} from "@/types/domain";

export const mockUsers: Record<Role, User> = {
  user: {
    id: "u_1001",
    name: "林一鸣",
    email: "lin.yiming@example.com",
    department: "产品运营部",
    roles: ["user"]
  },
  super_user: {
    id: "u_9001",
    name: "陈思远",
    email: "chen.siyuan@example.com",
    department: "信息平台组",
    roles: ["user", "super_user"]
  }
};

export const mockHomeSummary: HomeSummary = {
  dailyBrief: {
    id: "brief_20260526",
    title: "今日公司简报",
    briefDate: "2026-05-26",
    highlights: [
      "办公区 18:00 后进行网络维护，请提前保存在线文档。",
      "新人训练营第 3 期报名截止到本周五。",
      "财务部发布 5 月报销材料提交提醒。"
    ]
  },
  modules: [
    { key: "briefs", title: "今日公司简报", subtitle: "当天重点信息", count: 3, enabled: true },
    { key: "announcements", title: "公司公告墙", subtitle: "重要通知与制度更新", count: 5, enabled: true },
    { key: "forum-hot", title: "员工论坛热帖", subtitle: "本周高热讨论", count: 4, enabled: true },
    { key: "newcomer", title: "新人专区", subtitle: "入职任务与材料", count: 6, enabled: true },
    { key: "finance", title: "财经轻资讯", subtitle: "仅供信息阅读，不构成投资建议", count: 3, enabled: true },
    { key: "documents", title: "文档中心", subtitle: "制度、模板和流程", count: 12, enabled: true },
    { key: "training", title: "培训中心", subtitle: "必修与选修课程", count: 8, enabled: true }
  ]
};

export const mockDocuments: DocumentItem[] = [
  {
    id: "doc_1001",
    title: "员工手册 2026",
    category: "制度规范",
    tags: ["入职必读", "制度"],
    fileType: "pdf",
    sizeLabel: "2.4 MB",
    updatedAt: "2026-05-20",
    canPreview: true
  },
  {
    id: "doc_1002",
    title: "报销材料模板",
    category: "财务流程",
    tags: ["报销", "模板"],
    fileType: "xlsx",
    sizeLabel: "680 KB",
    updatedAt: "2026-05-18",
    canPreview: true
  },
  {
    id: "doc_1003",
    title: "信息安全入门指南",
    category: "安全合规",
    tags: ["安全合规", "入职必读"],
    fileType: "docx",
    sizeLabel: "1.1 MB",
    updatedAt: "2026-05-16",
    canPreview: false
  }
];

export const mockCourses: CourseDetail[] = [
  {
    id: "course_1001",
    title: "信息安全与账号保护",
    required: true,
    progressPercent: 80,
    completed: false,
    completedAt: null,
    summary: "保护账号、设备和内部系统的安全基础课。",
    description: "覆盖多因素认证、密码管理、钓鱼识别和移动办公安全要求。",
    category: "安全合规",
    resourceUrl: "https://mock.projectm.local/courses/course_1001"
  },
  {
    id: "course_1002",
    title: "新人产品业务导览",
    required: true,
    progressPercent: 45,
    completed: false,
    completedAt: null,
    summary: "帮助新人理解 ProjectM 产品模块和日常协作流程。",
    description: "介绍核心业务、移动门户模块、常见术语和跨团队协作方式。",
    category: "新人必修",
    resourceUrl: "https://mock.projectm.local/courses/course_1002"
  },
  {
    id: "course_1003",
    title: "高效协作基础课",
    required: false,
    progressPercent: 20,
    completed: false,
    completedAt: null,
    summary: "提升会议、文档和异步沟通效率的选修课程。",
    description: "通过任务拆解、会议纪要和文档模板实践建立团队协作习惯。",
    category: "协作能力",
    resourceUrl: "https://mock.projectm.local/courses/course_1003"
  }
];


export const mockFinanceInfo: FinanceInfoDetail[] = [
  {
    id: "finance_1001",
    title: "财经早知道：宏观日历提醒",
    summary: "整理本周重要宏观日历节点，帮助同事了解公开信息节奏。",
    source: "ProjectM 财经内容组",
    publishedAt: "2026-05-27",
    tags: ["财经早知道", "财经日历"],
    disclaimer: "本内容仅供内部资讯阅读和安全教育，不构成投资建议。",
    favorite: false,
    curatedByRole: "super_user",
    body: "本篇汇总公开发布的宏观日历、节假日安排和常见信息口径，便于同事在内部阅读时理解财经新闻中的时间线。内容由 super_user 人工确认，仅用于内部资讯阅读和安全教育。"
  },
  {
    id: "finance_1002",
    title: "指数概览：主要指数信息口径说明",
    summary: "介绍指数点位、涨跌幅和成交额等基础字段的阅读方式。",
    source: "ProjectM 财经内容组",
    publishedAt: "2026-05-26",
    tags: ["指数概览", "金融小知识"],
    disclaimer: "本内容仅供内部资讯阅读和安全教育，不构成投资建议。",
    favorite: false,
    curatedByRole: "super_user",
    body: "指数概览用于解释公开市场信息中的常见字段，例如点位、区间变化和成交额。本文只说明字段含义和阅读口径，不对任何标的或未来走势作判断。"
  },
  {
    id: "finance_1003",
    title: "反诈提醒：陌生链接与荐股群风险",
    summary: "提醒同事识别仿冒客服、陌生链接和诱导入群等常见风险。",
    source: "ProjectM 财经内容组",
    publishedAt: "2026-05-25",
    tags: ["反诈提醒"],
    disclaimer: "本内容仅供内部资讯阅读和安全教育，不构成投资建议。",
    favorite: false,
    curatedByRole: "super_user",
    body: "如收到陌生链接、仿冒客服消息或诱导入群话术，请先核验来源，不输入账号密码或验证码，并通过公司安全渠道反馈。内容由 super_user 人工确认，用于内部安全教育。"
  }
];


export const mockForumHotPosts: ForumHotPostDetail[] = [
  {
    id: "forum_hot_1001",
    title: "移动端门户模块建议集中帖",
    summary: "收集团队对移动端首页模块、通知入口和文档体验的改进建议。",
    body: "移动端只聚合展示热门讨论，方便员工快速了解高热话题。该帖集中收集团队对首页模块排序、通知入口和文档体验的建议，不提供发帖、评论、私信、举报或维护入口。",
    author: "张晨",
    publishedAt: "2026-05-27T08:45:00+08:00",
    latestReplyAt: "2026-05-27T11:20:00+08:00",
    viewCount: 640,
    commentCount: 36,
    likeCount: 52,
    hotnessScore: 852,
    linkType: "detail",
    status: "published"
  },
  {
    id: "forum_hot_1002",
    title: "每周讨论：AI 辅助需求评审经验",
    summary: "分享使用 AI 辅助梳理验收标准、风险清单和评审纪要的实践。",
    body: "本周讨论聚焦 AI 辅助需求评审经验，包含验收标准拆解、风险清单和评审纪要模板。内容由论坛聚合而来，仅作阅读展示。",
    author: "刘思琪",
    publishedAt: "2026-05-26T16:20:00+08:00",
    latestReplyAt: "2026-05-27T12:05:00+08:00",
    viewCount: 530,
    commentCount: 41,
    likeCount: 68,
    hotnessScore: 789,
    linkType: "detail",
    status: "published"
  },
  {
    id: "forum_hot_1003",
    title: "财务共享中心报销答疑汇总",
    summary: "外部论坛帖汇总 5 月报销材料、补交流程和常见问题。",
    body: "该热帖来自公司论坛报销答疑汇总，移动端优先通过安全外部链接打开；链接不可用时展示安全错误提示。",
    author: "财务共享中心",
    publishedAt: "2026-05-25T14:00:00+08:00",
    latestReplyAt: "2026-05-27T09:50:00+08:00",
    viewCount: 410,
    commentCount: 52,
    likeCount: 44,
    hotnessScore: 654,
    linkType: "external",
    externalUrl: "https://forum.projectm.local/topics/weekly-finance-ops",
    status: "published"
  },
  {
    id: "forum_hot_1004",
    title: "新人训练营资料推荐",
    summary: "新人同事推荐最有帮助的课程、文档和 FAQ。",
    body: "新人训练营资料推荐热帖聚合高频学习资料、课程入口和 FAQ，不包含移动端评论能力。",
    author: "新人训练营助教组",
    publishedAt: "2026-05-24T10:15:00+08:00",
    latestReplyAt: "2026-05-26T18:30:00+08:00",
    viewCount: 350,
    commentCount: 28,
    likeCount: 63,
    hotnessScore: 560,
    linkType: "detail",
    status: "published"
  },
  {
    id: "forum_hot_draft_1005",
    title: "草稿：论坛热帖维护说明",
    summary: "草稿热帖不应出现在普通用户聚合列表。",
    body: "仅用于后台维护验证。",
    author: "信息平台组",
    publishedAt: "",
    latestReplyAt: "",
    viewCount: 0,
    commentCount: 0,
    likeCount: 0,
    hotnessScore: 0,
    linkType: "detail",
    status: "draft"
  }
];


export type MockBriefDetail = BriefDetail & {
  status: BriefStatus;
  deletedAt: string | null;
};

export const mockBriefs: MockBriefDetail[] = [
  {
    id: "brief_20260526",
    title: "今日公司简报：网络维护提醒",
    summary: "办公区晚间网络维护，新人训练营报名与报销提醒同步。",
    body: "办公区网络维护安排在 18:00 后开始，预计持续 30 分钟。请提前保存在线文档，并避开维护窗口提交重要审批。新人训练营第 3 期报名截止到本周五，财务共享中心同步 5 月报销材料补充说明。",
    source: "ProjectM 信息平台组",
    publishedAt: "2026-05-26T08:30:00+08:00",
    department: "信息平台组",
    readCount: 186,
    briefDate: "2026-05-26",
    updatedAt: "2026-05-26T17:45:00+08:00",
    keyPoints: [
      "办公区 18:00 后进行网络维护，请提前保存在线文档。",
      "新人训练营第 3 期报名截止到本周五。",
      "财务部发布 5 月报销材料提交提醒。"
    ],
    favorite: false,
    isLatestFallback: true,
    status: "published",
    deletedAt: null
  },
  {
    id: "brief_20260525",
    title: "公司简报：行政服务提醒",
    summary: "行政部更新访客登记和会议室服务安排。",
    body: "行政部提醒各团队提前完成访客登记，会议室服务将优先保障跨部门评审和客户接待。园区餐饮服务时间保持不变，如遇临时调整将在公告墙同步。",
    source: "ProjectM 行政服务台",
    publishedAt: "2026-05-25T08:20:00+08:00",
    department: "行政部",
    readCount: 142,
    briefDate: "2026-05-25",
    updatedAt: "2026-05-25T16:10:00+08:00",
    keyPoints: [
      "访客登记需提前一天完成。",
      "会议室服务优先保障跨部门评审。",
      "园区餐饮服务时间保持不变。"
    ],
    favorite: false,
    isLatestFallback: false,
    status: "published",
    deletedAt: null
  },
  {
    id: "brief_draft_20260527",
    title: "草稿：今日公司简报",
    summary: "草稿简报不应出现在普通用户模块 API。",
    body: "这是一条草稿简报，仅用于验证普通用户列表和详情接口隐藏草稿。",
    source: "ProjectM 信息平台组",
    publishedAt: "",
    department: "信息平台组",
    readCount: 0,
    briefDate: "2026-05-27",
    updatedAt: "2026-05-27T09:00:00+08:00",
    keyPoints: ["草稿不可见", "等待发布", "不进入普通用户 API"],
    favorite: false,
    isLatestFallback: false,
    status: "draft",
    deletedAt: null
  },
  {
    id: "brief_archived_20260524",
    title: "归档：历史简报",
    summary: "归档简报不应出现在普通用户模块 API。",
    body: "这是一条归档简报。",
    source: "ProjectM 信息平台组",
    publishedAt: "2026-05-24T08:20:00+08:00",
    department: "信息平台组",
    readCount: 88,
    briefDate: "2026-05-24",
    updatedAt: "2026-05-24T18:00:00+08:00",
    keyPoints: ["归档不可见", "历史保留", "不进入普通用户 API"],
    favorite: false,
    isLatestFallback: false,
    status: "archived",
    deletedAt: null
  },
  {
    id: "brief_deleted_20260523",
    title: "软删除：历史简报",
    summary: "软删除简报不应出现在普通用户模块 API。",
    body: "这是一条软删除简报。",
    source: "ProjectM 信息平台组",
    publishedAt: "2026-05-23T08:20:00+08:00",
    department: "信息平台组",
    readCount: 67,
    briefDate: "2026-05-23",
    updatedAt: "2026-05-23T18:00:00+08:00",
    keyPoints: ["软删除不可见", "仅后台保留", "不进入普通用户 API"],
    favorite: false,
    isLatestFallback: false,
    status: "published",
    deletedAt: "2026-05-24T09:00:00+08:00"
  }
];

export const mockAnnouncements: AnnouncementDetail[] = [
  {
    id: "announcement_1001",
    title: "端午节办公区开放安排",
    summary: "假期开放时间和物业联系方式。",
    body: "端午节期间办公区 09:00-18:00 开放，请携带工卡。访客需提前一天在前台系统登记，物业值班电话将在公告附件中同步提供。",
    category: "办公通知",
    department: "行政部",
    validFrom: "2026-05-27",
    validUntil: "2026-06-10",
    publishedAt: "2026-05-27T09:20:00+08:00",
    readCount: 128,
    pinned: true,
    important: true,
    favorite: false,
    expired: false,
    attachments: [
      {
        id: "announcement_attachment_1001",
        fileName: "端午节办公区开放安排.pdf",
        sizeLabel: "156 KB",
        url: "https://mock.projectm.local/announcements/announcement_1001/holiday-office.pdf"
      }
    ]
  },
  {
    id: "announcement_1002",
    title: "福利体检预约通知",
    summary: "年度体检预约开放，请在福利平台选择时间。",
    body: "福利体检预约本周开放，员工可在福利平台选择就近体检中心。请在预约前确认个人信息，特殊情况可联系人力资源部调整。",
    category: "福利通知",
    department: "人力资源部",
    validFrom: "2026-05-25",
    validUntil: "2026-06-30",
    publishedAt: "2026-05-26T10:10:00+08:00",
    readCount: 96,
    pinned: false,
    important: false,
    favorite: false,
    expired: false,
    attachments: []
  },
  {
    id: "announcement_1003",
    title: "报销材料提交提醒",
    summary: "5 月报销材料提交窗口已结束，仍可查询历史公告。",
    body: "5 月报销材料提交窗口已结束。财务共享中心保留本公告供员工查询历史要求，如需补交请通过工单联系财务共享中心。",
    category: "制度提醒",
    department: "财务共享中心",
    validFrom: "2026-04-20",
    validUntil: "2026-05-10",
    publishedAt: "2026-04-20T08:45:00+08:00",
    readCount: 211,
    pinned: false,
    important: true,
    favorite: false,
    expired: true,
    attachments: [
      {
        id: "announcement_attachment_1003",
        fileName: "报销材料清单.xlsx",
        sizeLabel: "88 KB",
        url: "https://mock.projectm.local/announcements/announcement_1003/expense-checklist.xlsx"
      }
    ]
  },
  {
    id: "announcement_draft_1004",
    title: "草稿：办公区施工提醒",
    summary: "草稿公告不应出现在普通用户公告墙。",
    body: "这是一条草稿公告，仅用于验证普通用户模块 API 不返回草稿。",
    category: "办公通知",
    department: "行政部",
    validFrom: "2026-06-01",
    validUntil: "2026-06-15",
    publishedAt: "",
    readCount: 0,
    pinned: false,
    important: false,
    favorite: false,
    expired: false,
    attachments: []
  }
];


export const mockMeFavorites: MeFavoriteItem[] = [
  {
    id: "favorite_brief_20260526",
    resourceType: "brief",
    resourceId: "brief_20260526",
    title: "今日公司简报：网络维护提醒",
    subtitle: "今日公司简报",
    favoritedAt: "2026-05-27T09:05:00+08:00"
  },
  {
    id: "favorite_doc_1001",
    resourceType: "document",
    resourceId: "doc_1001",
    title: "员工手册 2026",
    subtitle: "制度规范 · PDF",
    favoritedAt: "2026-05-27T09:10:00+08:00"
  },
  {
    id: "favorite_course_1001",
    resourceType: "course",
    resourceId: "course_1001",
    title: "信息安全与账号保护",
    subtitle: "安全合规 · 80%",
    favoritedAt: "2026-05-27T09:15:00+08:00"
  }
];

export const mockMeDownloads: MeDownloadRecord[] = [
  {
    id: "download_doc_1001",
    documentId: "doc_1001",
    title: "员工手册 2026",
    fileName: "employee-handbook-2026.pdf",
    fileType: "pdf",
    sizeLabel: "2.4 MB",
    downloadedAt: "2026-05-27T09:35:00+08:00",
    source: "explicit_record"
  },
  {
    id: "download_doc_1002",
    documentId: "doc_1002",
    title: "报销材料模板",
    fileName: "expense-template.xlsx",
    fileType: "xlsx",
    sizeLabel: "680 KB",
    downloadedAt: "2026-05-26T16:20:00+08:00",
    source: "explicit_record"
  }
];

export const mockProfileSummary: ProfileSummary = {
  favoritesCount: mockMeFavorites.length,
  downloadsCount: mockMeDownloads.length,
  trainingProgressPercent: 62,
  newcomerTasksDone: 5,
  newcomerTasksTotal: 8,
  preferences: {
    showNewcomerOnHome: true
  }
};



export const initialMockAdminPortalConfigColumns: AdminPortalConfigColumn[] = mockHomeSummary.modules.map((module, index) => ({
  key: module.key,
  title: module.title,
  enabled: module.enabled,
  display_order: (index + 1) * 10,
  display_count: module.count
}));

export const initialMockAdminCategories: AdminCategoryItem[] = [
  {
    id: "admin_category_1001",
    name: "制度规范",
    description: "员工手册、流程制度和规范类文档分类。",
    sort_order: 10,
    enabled: true,
    updated_at: "2026-05-27T09:35:00+08:00",
    enabled_at: "2026-05-27T09:40:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_category_1002",
    name: "财务流程",
    description: "报销、付款和预算流程分类。",
    sort_order: 20,
    enabled: true,
    updated_at: "2026-05-27T09:25:00+08:00",
    enabled_at: "2026-05-27T09:30:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_category_1003",
    name: "安全合规",
    description: "信息安全、合规培训和设备规范分类。",
    sort_order: 30,
    enabled: false,
    updated_at: "2026-05-26T17:10:00+08:00",
    enabled_at: null,
    disabled_at: "2026-05-27T08:20:00+08:00",
    deleted_at: null
  }
];

export const initialMockAdminTags: AdminTagItem[] = [
  {
    id: "admin_tag_1001",
    name: "移动端",
    description: "用于移动端内容、文档和课程聚合的标签。",
    sort_order: 10,
    enabled: true,
    updated_at: "2026-05-27T09:45:00+08:00",
    enabled_at: "2026-05-27T09:50:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_tag_1002",
    name: "新人必读",
    description: "入职引导和新人任务关联标签。",
    sort_order: 20,
    enabled: true,
    updated_at: "2026-05-27T09:30:00+08:00",
    enabled_at: "2026-05-27T09:35:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_tag_1003",
    name: "旧版标签",
    description: "保留用于验证禁用状态展示。",
    sort_order: 30,
    enabled: false,
    updated_at: "2026-05-26T17:30:00+08:00",
    enabled_at: null,
    disabled_at: "2026-05-27T08:40:00+08:00",
    deleted_at: null
  }
];

export const initialMockAdminContents: AdminContentItem[] = [
  {
    id: "content_1001",
    type: "brief",
    title: "今日公司简报：网络维护提醒",
    summary: "办公区晚间网络维护，请提前保存在线文档。",
    body: "信息平台组将在 18:00 后进行网络维护，预计持续 30 分钟。",
    category: "今日简报",
    status: "published",
    updated_at: "2026-05-27T09:00:00+08:00",
    published_at: "2026-05-27T09:15:00+08:00",
    archived_at: null,
    deleted_at: null
  },
  {
    id: "content_1002",
    type: "announcement",
    title: "端午节办公区开放安排",
    summary: "假期开放时间和物业联系方式。",
    body: "端午节期间办公区 09:00-18:00 开放，请携带工卡。",
    category: "公司公告",
    status: "draft",
    updated_at: "2026-05-27T08:30:00+08:00",
    published_at: null,
    archived_at: null,
    deleted_at: null
  },
  {
    id: "content_1003",
    type: "finance",
    title: "财经轻资讯：市场早读",
    summary: "仅供信息阅读，不构成投资建议。",
    body: "本内容仅用于内部信息阅读和安全教育，避免任何投资操作判断或结果承诺。",
    category: "财经轻资讯",
    status: "archived",
    updated_at: "2026-05-26T17:20:00+08:00",
    published_at: "2026-05-26T08:30:00+08:00",
    archived_at: "2026-05-27T08:00:00+08:00",
    deleted_at: null
  }
];

export const mockNewcomerContent: (NewcomerContentDetail & {
  status: "draft" | "published" | "archived";
  deletedAt: string | null;
})[] = [
  {
    id: "newcomer_content_1001",
    title: "入职第一周必读清单",
    summary: "账号、办公工具和入职资料提交的第一周行动清单。",
    body: "请在第一周完成账号安全确认、办公工具登录、入职资料核对和团队沟通节奏熟悉。",
    category: "新人必读",
    publishedAt: "2026-05-27T09:30:00+08:00",
    favorite: false,
    status: "published",
    deletedAt: null
  },
  {
    id: "newcomer_content_1002",
    title: "导师沟通准备指南",
    summary: "第一次导师一对一前可准备的问题和项目背景材料。",
    body: "建议提前整理岗位目标、项目疑问、协作偏好和希望导师协助澄清的事项。",
    category: "导师沟通",
    publishedAt: "2026-05-27T09:10:00+08:00",
    favorite: false,
    status: "published",
    deletedAt: null
  },
  {
    id: "newcomer_content_draft_1003",
    title: "草稿新人资料",
    summary: "未发布内容不应出现在普通用户新人专区。",
    body: "草稿内容仅用于 Admin 编辑。",
    category: "新人必读",
    publishedAt: "2026-05-27T08:00:00+08:00",
    favorite: false,
    status: "draft",
    deletedAt: null
  },
  {
    id: "newcomer_content_archived_1004",
    title: "归档新人资料",
    summary: "归档内容不应出现在普通用户新人专区。",
    body: "归档内容仅保留后台记录。",
    category: "新人必读",
    publishedAt: "2026-05-26T08:00:00+08:00",
    favorite: false,
    status: "archived",
    deletedAt: null
  }
];

export const initialMockAdminDocuments: AdminDocumentItem[] = [
  {
    id: "admin_doc_1001",
    title: "员工手册 2026",
    category: "制度规范",
    file_type: "pdf",
    size_label: "2.4 MB",
    status: "published",
    updated_at: "2026-05-27T09:10:00+08:00",
    published_at: "2026-05-27T09:20:00+08:00",
    archived_at: null,
    deleted_at: null
  },
  {
    id: "admin_doc_1002",
    title: "报销材料模板",
    category: "财务流程",
    file_type: "xlsx",
    size_label: "680 KB",
    status: "draft",
    updated_at: "2026-05-27T08:40:00+08:00",
    published_at: null,
    archived_at: null,
    deleted_at: null
  },
  {
    id: "admin_doc_1003",
    title: "信息安全入门指南",
    category: "安全合规",
    file_type: "docx",
    size_label: "1.1 MB",
    status: "archived",
    updated_at: "2026-05-26T16:20:00+08:00",
    published_at: "2026-05-26T09:00:00+08:00",
    archived_at: "2026-05-27T08:30:00+08:00",
    deleted_at: null
  }
];

export const initialMockAdminCourses: AdminCourseItem[] = [
  {
    id: "admin_course_1001",
    title: "信息安全与账号保护",
    summary: "账号安全、设备安全和文档访问规范。",
    required: true,
    material_document_id: "admin_doc_1001",
    external_url: null,
    status: "published",
    updated_at: "2026-05-27T09:30:00+08:00",
    published_at: "2026-05-27T09:40:00+08:00",
    archived_at: null,
    deleted_at: null
  },
  {
    id: "admin_course_1002",
    title: "新人产品业务导览",
    summary: "了解 ProjectM 门户核心业务流程。",
    required: true,
    material_document_id: null,
    external_url: "https://learn.projectm.local/onboarding",
    status: "draft",
    updated_at: "2026-05-27T08:50:00+08:00",
    published_at: null,
    archived_at: null,
    deleted_at: null
  },
  {
    id: "admin_course_1003",
    title: "高效协作基础课",
    summary: "跨部门协作文档和会议规范。",
    required: false,
    material_document_id: "admin_doc_1002",
    external_url: null,
    status: "archived",
    updated_at: "2026-05-26T15:30:00+08:00",
    published_at: "2026-05-26T09:30:00+08:00",
    archived_at: "2026-05-27T08:45:00+08:00",
    deleted_at: null
  }
];

export const initialMockAdminNewcomerTasks: AdminNewcomerTaskItem[] = [
  {
    id: "admin_newcomer_task_1001",
    title: "提交入职资料",
    description: "上传身份证明、紧急联系人和银行卡信息。",
    sort_order: 10,
    enabled: true,
    updated_at: "2026-05-27T09:50:00+08:00",
    enabled_at: "2026-05-27T09:55:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_newcomer_task_1002",
    title: "完成信息安全确认",
    description: "阅读信息安全规范并确认设备合规要求。",
    sort_order: 20,
    enabled: true,
    updated_at: "2026-05-27T09:45:00+08:00",
    enabled_at: "2026-05-27T09:50:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_newcomer_task_1003",
    title: "预约导师一对一",
    description: "在入职第一周完成导师沟通预约。",
    sort_order: 30,
    enabled: false,
    updated_at: "2026-05-26T16:30:00+08:00",
    enabled_at: null,
    disabled_at: "2026-05-27T08:30:00+08:00",
    deleted_at: null
  }
];


export const initialMockAdminUsers: AdminUserItem[] = [
  {
    id: "admin_user_1001",
    name: "林一鸣",
    email: "lin.yiming@example.com",
    department: "产品运营部",
    role: "user",
    enabled: true,
    updated_at: "2026-05-27T09:55:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_user_1002",
    name: "陈思远",
    email: "chen.siyuan@example.com",
    department: "信息平台组",
    role: "super_user",
    enabled: true,
    updated_at: "2026-05-27T09:50:00+08:00",
    disabled_at: null,
    deleted_at: null
  },
  {
    id: "admin_user_1003",
    name: "赵宁",
    email: "zhao.ning@example.com",
    department: "财务部",
    role: "user",
    enabled: false,
    updated_at: "2026-05-26T17:30:00+08:00",
    disabled_at: "2026-05-27T08:35:00+08:00",
    deleted_at: null
  }
];


export const initialMockAdminAuditLogs: AdminAuditLogItem[] = [
  {
    id: "audit_log_1001",
    actor_id: "admin_user_9001",
    actor_name: "陈思远",
    action: "publish",
    resource_type: "content",
    resource_id: "content_1001",
    ip_address: "203.0.113.10",
    user_agent: "ProjectM-Mobile/1.0 (iOS 18.0)",
    created_at: "2026-05-27T09:20:00+08:00",
    summary: "发布内容：端午节值班安排"
  },
  {
    id: "audit_log_1002",
    actor_id: "admin_user_9002",
    actor_name: "林一鸣",
    action: "disable",
    resource_type: "user",
    resource_id: "admin_user_1003",
    ip_address: "203.0.113.11",
    user_agent: "ProjectM-Mobile/1.0 (Android 15)",
    created_at: "2026-05-27T08:35:00+08:00",
    summary: "禁用用户：赵宁"
  }
];
