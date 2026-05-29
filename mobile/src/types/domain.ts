export type Role = "user" | "super_user";

export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  roles: Role[];
};

export type ModuleKey =
  | "briefs"
  | "announcements"
  | "forum-hot"
  | "newcomer"
  | "finance"
  | "documents"
  | "training";

export type HomeModule = {
  key: ModuleKey;
  title: string;
  subtitle: string;
  count: number;
  enabled: boolean;
};

export type AdminPortalConfigColumn = {
  key: ModuleKey;
  title: string;
  enabled: boolean;
  display_order: number;
  display_count: number;
};

export type AdminPortalConfig = {
  columns: AdminPortalConfigColumn[];
};

export type AdminPortalConfigColumnUpdateInput = Pick<
  AdminPortalConfigColumn,
  "key" | "enabled" | "display_order" | "display_count"
>;

export type DailyBrief = {
  id: string;
  title: string;
  briefDate: string;
  highlights: string[];
};

export type BriefStatus = "draft" | "published" | "archived";

export type BriefItem = {
  id: string;
  title: string;
  summary: string;
  briefDate: string;
  updatedAt: string;
  keyPoints: string[];
  favorite: boolean;
  isLatestFallback: boolean;
};

export type BriefDetail = BriefItem & {
  body: string;
  source: string;
  publishedAt: string;
  department: string;
  readCount: number;
};

export type BriefListQuery = {
  search?: string;
};

export type BriefFavoriteInput = {
  favorite: boolean;
};

export type HomeSummary = {
  dailyBrief: DailyBrief;
  modules: HomeModule[];
};

export type DocumentItem = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  fileType: "pdf" | "docx" | "xlsx" | "pptx";
  sizeLabel: string;
  updatedAt: string;
  canPreview: boolean;
};

export type DocumentListQuery = {
  search?: string;
  category?: string;
  tag?: string;
  fileType?: DocumentItem["fileType"] | string;
};

export type DocumentPreviewUrl = {
  document_id: string;
  preview_url: string;
  expires_at: string;
  file_type: DocumentItem["fileType"];
  file_name: string;
  mime_type: string;
};

export type DocumentDownload = {
  document_id: string;
  download_url: string;
  expires_at: string;
  file_name: string;
  mime_type: string;
};

export type MeFavoriteResourceType = "brief" | "announcement" | "newcomer" | "document" | "course" | "finance";

export type MeFavoriteItem = {
  id: string;
  resourceType: MeFavoriteResourceType;
  resourceId: string;
  title: string;
  subtitle: string;
  favoritedAt: string;
};

export type MeDownloadRecord = {
  id: string;
  documentId: string;
  title: string;
  fileName: string;
  fileType: DocumentItem["fileType"];
  sizeLabel: string;
  downloadedAt: string;
  source: "explicit_record";
};

export type MeTrainingProgressItem = {
  courseId: string;
  title: string;
  required: boolean;
  progressPercent: number;
  completed: boolean;
  completedAt: string | null;
  lastLearnedAt: string;
};

export type MobilePlatform = "ios" | "android";

export type RegisterDeviceRequest = {
  platform: MobilePlatform;
  expo_push_token: string;
  device_name?: string;
  app_version?: string;
};

export type RegisteredDevice = RegisterDeviceRequest & {
  id: string;
  user_id: string;
  enabled: boolean;
  last_seen_at: string;
};

export type NotificationSettings = Record<ModuleKey, boolean>;


export type FinanceInfoTag = "财经早知道" | "指数概览" | "金融小知识" | "反诈提醒" | "财经日历";

export type FinanceInfoItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  tags: FinanceInfoTag[];
  disclaimer: string;
  favorite: boolean;
  curatedByRole: "super_user";
};

export type FinanceInfoDetail = FinanceInfoItem & {
  body: string;
};

export type FinanceInfoListQuery = {
  tag?: FinanceInfoTag | string;
};

export type FinanceInfoFavoriteInput = {
  favorite: boolean;
};

export type AnnouncementAttachment = {
  id: string;
  fileName: string;
  sizeLabel: string;
  url: string;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  department: string;
  validFrom: string;
  validUntil: string;
  publishedAt: string;
  readCount: number;
  pinned: boolean;
  important: boolean;
  favorite: boolean;
  expired: boolean;
};

export type AnnouncementDetail = AnnouncementItem & {
  body: string;
  attachments: AnnouncementAttachment[];
};

export type AnnouncementListQuery = {
  search?: string;
  category?: string;
};

export type AnnouncementFavoriteInput = {
  favorite: boolean;
};

export type NewcomerContentItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  favorite: boolean;
};

export type NewcomerContentDetail = NewcomerContentItem & {
  body: string;
};

export type NewcomerContentListQuery = {
  search?: string;
};

export type NewcomerContentFavoriteInput = {
  favorite: boolean;
};

export type MyNewcomerTaskItem = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  enabled: boolean;
  completed: boolean;
  completed_at: string | null;
};

export type ForumHotPostStatus = "draft" | "published" | "archived";

export type ForumHotPostLinkType = "detail" | "external";

export type ForumHotPostItem = {
  id: string;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  latestReplyAt: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  hotnessScore: number;
  linkType: ForumHotPostLinkType;
  externalUrl?: string;
  configuredOrder?: number;
  status: ForumHotPostStatus;
};

export type ForumHotPostDetail = ForumHotPostItem & {
  body: string;
};

export type CourseItem = {
  id: string;
  title: string;
  required: boolean;
  progressPercent: number;
  completed: boolean;
  completedAt: string | null;
};

export type CourseDetail = CourseItem & {
  summary: string;
  description: string;
  category: string;
  resourceUrl: string;
};

export type CourseProgressUpdateInput = {
  progressPercent: number;
};

export type ProfileSummary = {
  favoritesCount: number;
  downloadsCount: number;
  trainingProgressPercent: number;
  newcomerTasksDone: number;
  newcomerTasksTotal: number;
  preferences: ProfilePreferences;
};

export type ProfilePreferences = {
  showNewcomerOnHome: boolean;
};

export type ProfilePreferenceUpdateInput = Partial<ProfilePreferences>;

export type AdminContentType = "brief" | "announcement" | "forum-hot" | "newcomer" | "finance";

export type AdminContentStatus = "draft" | "published" | "archived";

export type AdminDocumentStatus = "draft" | "published" | "archived";

export type AdminCourseStatus = "draft" | "published" | "archived";

export type AdminCategoryItem = {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  enabled: boolean;
  updated_at: string;
  enabled_at: string | null;
  disabled_at: string | null;
  deleted_at: string | null;
};

export type AdminCategoryUpsertInput = {
  name: string;
  description: string;
  sort_order: number;
};


export type AdminTagItem = {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  enabled: boolean;
  updated_at: string;
  enabled_at: string | null;
  disabled_at: string | null;
  deleted_at: string | null;
};

export type AdminTagUpsertInput = {
  name: string;
  description: string;
  sort_order: number;
};

export type AdminNewcomerTaskItem = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  enabled: boolean;
  updated_at: string;
  enabled_at: string | null;
  disabled_at: string | null;
  deleted_at: string | null;
};

export type AdminNewcomerTaskUpsertInput = {
  title: string;
  description: string;
  sort_order: number;
};

export type AdminContentItem = {
  id: string;
  type: AdminContentType;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: AdminContentStatus;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
};

export type AdminContentUpsertInput = {
  type: AdminContentType;
  title: string;
  summary: string;
  body: string;
  category: string;
};


export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role;
  enabled: boolean;
  updated_at: string;
  disabled_at: string | null;
  deleted_at: string | null;
};

export type AdminUserUpsertInput = {
  name: string;
  email: string;
  department: string;
  role: Role;
};

export type AdminUserRoleInput = {
  role: Role;
};

export type AdminDashboardSummary = {
  contentCount: number;
  pendingPublishCount: number;
  readCount: number;
  documentDownloadCount: number;
  trainingCompletionRate: number;
  recentActions: string[];
};

export type AdminAuditLogAction =
  | "create"
  | "update"
  | "publish"
  | "archive"
  | "disable"
  | "delete"
  | "upload"
  | "download"
  | "role_change"
  | "config_update"
  | "login";

export type AdminAuditLogResourceType = "content" | "document" | "course" | "user" | "portal_config" | "auth";

export type AdminAuditLogItem = {
  id: string;
  actor_id: string;
  actor_name: string;
  action: AdminAuditLogAction;
  resource_type: AdminAuditLogResourceType;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  summary: string;
};

export type AdminAuditLogQuery = {
  query?: string;
  action?: AdminAuditLogAction | "";
  resourceType?: AdminAuditLogResourceType | "";
};

export type AdminAuditLogList = {
  items: AdminAuditLogItem[];
  total: number;
};

export type AdminDocumentItem = {
  id: string;
  title: string;
  category: string;
  file_type: DocumentItem["fileType"];
  size_label: string;
  status: AdminDocumentStatus;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
};

export type AdminDocumentUpsertInput = {
  title: string;
  category: string;
  file_type: DocumentItem["fileType"];
  size_label: string;
};


export type AdminCourseItem = {
  id: string;
  title: string;
  summary: string;
  required: boolean;
  material_document_id: string | null;
  external_url: string | null;
  status: AdminCourseStatus;
  updated_at: string;
  published_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
};

export type AdminCourseUpsertInput = {
  title: string;
  summary: string;
  required: boolean;
  material_document_id?: string | null;
  external_url?: string | null;
};
