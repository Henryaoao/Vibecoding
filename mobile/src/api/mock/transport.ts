import type { ApiRequest, ApiTransportResponse } from "../client";
import type { ApiEnvelope } from "../envelope";
import { endpoints } from "../endpoints";
import { APPLICATION_ROLES, isApplicationRole } from "@/auth/roles";
import {
  initialMockAdminAuditLogs,
  initialMockAdminCategories,
  initialMockAdminContents,
  initialMockAdminCourses,
  initialMockAdminDocuments,
  initialMockAdminNewcomerTasks,
  initialMockAdminPortalConfigColumns,
  initialMockAdminTags,
  initialMockAdminUsers,
  mockAnnouncements,
  mockBriefs,
  mockCourses,
  mockDocuments,
  mockFinanceInfo,
  mockForumHotPosts,
  mockHomeSummary,
  mockMeDownloads,
  mockMeFavorites,
  mockNewcomerContent,
  mockProfileSummary,
  mockUsers
} from "./data";
import type {
  AdminAuditLogList,
  AdminAuditLogItem,
  AdminCategoryItem,
  AdminCategoryUpsertInput,
  AdminContentItem,
  AdminContentUpsertInput,
  AdminCourseItem,
  AdminCourseUpsertInput,
  AdminDocumentItem,
  AdminDocumentUpsertInput,
  AdminNewcomerTaskItem,
  AdminNewcomerTaskUpsertInput,
  AdminPortalConfig,
  AdminPortalConfigColumn,
  AdminPortalConfigColumnUpdateInput,
  AdminTagItem,
  AdminTagUpsertInput,
  AdminUserItem,
  AdminUserRoleInput,
  AdminUserUpsertInput,
  AnnouncementDetail,
  AnnouncementFavoriteInput,
  BriefDetail,
  BriefFavoriteInput,
  BriefItem,
  AnnouncementItem,
  CourseDetail,
  CourseItem,
  CourseProgressUpdateInput,
  FinanceInfoDetail,
  FinanceInfoFavoriteInput,
  FinanceInfoItem,
  ForumHotPostDetail,
  ForumHotPostItem,
  MeDownloadRecord,
  MeFavoriteItem,
  MeTrainingProgressItem,
  MyNewcomerTaskItem,
  NewcomerContentDetail,
  NewcomerContentFavoriteInput,
  NewcomerContentItem,
  NotificationSettings,
  ProfilePreferenceUpdateInput,
  RegisteredDevice,
  RegisterDeviceRequest,
  Role
} from "@/types/domain";

let requestCounter = 0;
let deviceCounter = 0;
let categoryCounter = 0;
let contentCounter = 0;
let documentCounter = 0;
let courseCounter = 0;
let newcomerTaskCounter = 0;
let tagCounter = 0;
let userCounter = 0;
let auditLogCounter = 0;

const defaultNotificationSettings: NotificationSettings = {
  briefs: true,
  announcements: true,
  "forum-hot": true,
  newcomer: true,
  finance: false,
  documents: true,
  training: true
};

let mockNotificationSettings: NotificationSettings = {
  ...defaultNotificationSettings
};
let mockRegisteredDevices: RegisteredDevice[] = [];
let mockAnnouncementItems: AnnouncementDetail[] = mockAnnouncements.map((item) => ({
  ...item,
  attachments: item.attachments.map((attachment) => ({ ...attachment }))
}));
let mockBriefItems = mockBriefs.map((item) => ({ ...item, keyPoints: [...item.keyPoints] }));
let mockFinanceInfoItems: FinanceInfoDetail[] = mockFinanceInfo.map((item) => ({ ...item, tags: [...item.tags] }));
let mockForumHotItems: ForumHotPostDetail[] = mockForumHotPosts.map((item) => ({ ...item }));
let mockNewcomerContentItems = mockNewcomerContent.map((item) => ({ ...item }));
let mockMeFavoriteItems: MeFavoriteItem[] = mockMeFavorites.map((item) => ({ ...item }));
let mockMeDownloadItems: MeDownloadRecord[] = mockMeDownloads.map((item) => ({ ...item }));
let mockUserProfilePreferences: Record<string, ProfilePreferenceUpdateInput> = {};

let mockAdminAuditLogs: AdminAuditLogItem[] = initialMockAdminAuditLogs.map((item) => ({ ...item }));
let mockAdminCategories: AdminCategoryItem[] = initialMockAdminCategories.map((item) => ({ ...item }));
let mockAdminContents: AdminContentItem[] = initialMockAdminContents.map((item) => ({ ...item }));
let mockAdminDocuments: AdminDocumentItem[] = initialMockAdminDocuments.map((item) => ({ ...item }));
let mockAdminCourses: AdminCourseItem[] = initialMockAdminCourses.map((item) => ({ ...item }));
let mockAdminNewcomerTasks: AdminNewcomerTaskItem[] = initialMockAdminNewcomerTasks.map((item) => ({ ...item }));
let mockAdminPortalConfigColumns: AdminPortalConfigColumn[] = initialMockAdminPortalConfigColumns.map((item) => ({ ...item }));
let mockAdminTags: AdminTagItem[] = initialMockAdminTags.map((item) => ({ ...item }));
let mockAdminUsers: AdminUserItem[] = initialMockAdminUsers.map((item) => ({ ...item }));
let mockUserCourseProgress: Record<string, CourseDetail[]> = Object.fromEntries(
  Object.values(mockUsers).map((user) => [user.id, mockCourses.map((course) => ({ ...course }))])
);
let mockUserNewcomerTaskProgress: Record<string, Record<string, string>> = {};

export function resetMockTransportState() {
  requestCounter = 0;
  deviceCounter = 0;
  categoryCounter = 0;
  contentCounter = 0;
  documentCounter = 0;
  courseCounter = 0;
  newcomerTaskCounter = 0;
  tagCounter = 0;
  userCounter = 0;
  auditLogCounter = 0;
  mockAdminAuditLogs = initialMockAdminAuditLogs.map((item) => ({ ...item }));
  mockAdminCategories = initialMockAdminCategories.map((item) => ({ ...item }));
  mockAdminContents = initialMockAdminContents.map((item) => ({ ...item }));
  mockAdminDocuments = initialMockAdminDocuments.map((item) => ({ ...item }));
  mockAdminCourses = initialMockAdminCourses.map((item) => ({ ...item }));
  mockAdminNewcomerTasks = initialMockAdminNewcomerTasks.map((item) => ({ ...item }));
  mockAdminPortalConfigColumns = initialMockAdminPortalConfigColumns.map((item) => ({ ...item }));
  mockAdminTags = initialMockAdminTags.map((item) => ({ ...item }));
  mockAdminUsers = initialMockAdminUsers.map((item) => ({ ...item }));
  mockUserCourseProgress = Object.fromEntries(
    Object.values(mockUsers).map((user) => [user.id, mockCourses.map((course) => ({ ...course }))])
  );
  mockNotificationSettings = {
    ...defaultNotificationSettings
  };
  mockRegisteredDevices = [];
  mockAnnouncementItems = mockAnnouncements.map((item) => ({
    ...item,
    attachments: item.attachments.map((attachment) => ({ ...attachment }))
  }));
  mockBriefItems = mockBriefs.map((item) => ({ ...item, keyPoints: [...item.keyPoints] }));
  mockFinanceInfoItems = mockFinanceInfo.map((item) => ({ ...item, tags: [...item.tags] }));
  mockForumHotItems = mockForumHotPosts.map((item) => ({ ...item }));
  mockNewcomerContentItems = mockNewcomerContent.map((item) => ({ ...item }));
  mockMeFavoriteItems = mockMeFavorites.map((item) => ({ ...item }));
  mockMeDownloadItems = mockMeDownloads.map((item) => ({ ...item }));
  mockUserProfilePreferences = {};
  mockUserNewcomerTaskProgress = {};
}

function requestId() {
  requestCounter += 1;
  return `req_mock_${String(requestCounter).padStart(4, "0")}`;
}

function envelope<T>(data: T, code = "OK", message = "success"): ApiEnvelope<T> {
  return {
    code,
    message,
    data,
    request_id: requestId()
  };
}

function response<T>(status: number, data: T, code = "OK", message = "success"): ApiTransportResponse<T> {
  return {
    status,
    envelope: envelope(data, code, message)
  };
}

function roleFromAuthorization(header?: string): Role | null {
  if (header === "Bearer mock-token-super-user") {
    return "super_user";
  }

  if (header === "Bearer mock-token-user") {
    return "user";
  }

  return null;
}


function nowIso() {
  return "2026-05-27T10:30:00+08:00";
}

function appendAdminAuditLog(input: Pick<AdminAuditLogItem, "action" | "resource_type" | "resource_id" | "summary">) {
  auditLogCounter += 1;
  mockAdminAuditLogs = [
    {
      id: `audit_log_mock_${String(auditLogCounter).padStart(4, "0")}`,
      actor_id: "admin_user_9001",
      actor_name: mockUsers.super_user.name,
      action: input.action,
      resource_type: input.resource_type,
      resource_id: input.resource_id,
      ip_address: "203.0.113.20",
      user_agent: "ProjectM-Mobile/1.0 (Mock)",
      created_at: nowIso(),
      summary: input.summary
    },
    ...mockAdminAuditLogs
  ];
}

function splitPathAndQuery(path: string) {
  const [pathname, queryString = ""] = path.split("?");
  return {
    pathname,
    query: new URLSearchParams(queryString)
  };
}

function visibleAdminAuditLogs(query: URLSearchParams): AdminAuditLogList {
  const search = query.get("query")?.trim().toLowerCase() ?? "";
  const action = query.get("action") ?? "";
  const resourceType = query.get("resource_type") ?? "";

  const items = mockAdminAuditLogs.filter((item) => {
    const matchesSearch = search
      ? [item.actor_name, item.action, item.resource_type, item.resource_id, item.summary].some((value) => value.toLowerCase().includes(search))
      : true;
    const matchesAction = action ? item.action === action : true;
    const matchesResourceType = resourceType ? item.resource_type === resourceType : true;
    return matchesSearch && matchesAction && matchesResourceType;
  });

  return {
    items,
    total: items.length
  };
}

function visibleAdminCategories() {
  return mockAdminCategories.filter((item) => !item.deleted_at).sort((left, right) => left.sort_order - right.sort_order);
}

function visibleAdminContents() {
  return mockAdminContents.filter((item) => !item.deleted_at);
}

function visibleAdminDocuments() {
  return mockAdminDocuments.filter((item) => !item.deleted_at);
}

const adminDocumentAllowedFileTypes = ["pdf", "docx", "xlsx", "pptx"] as const;
const adminDocumentMaxFileSizeBytes = 50 * 1024 * 1024;

function adminDocumentSizeLabelToBytes(sizeLabel: string) {
  const match = sizeLabel.trim().match(/^(\d+(?:\.\d+)?)\s*(b|bytes?|kb|mb)$/i);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(value)) {
    return null;
  }

  if (unit === "b" || unit === "byte" || unit === "bytes") {
    return value;
  }

  if (unit === "kb") {
    return value * 1024;
  }

  return value * 1024 * 1024;
}

function validateAdminDocumentFileMetadata(input: Pick<AdminDocumentUpsertInput, "file_type" | "size_label">) {
  if (!adminDocumentAllowedFileTypes.includes(input.file_type)) {
    return "仅支持 pdf、docx、xlsx、pptx 文件";
  }

  const sizeBytes = adminDocumentSizeLabelToBytes(input.size_label);

  if (sizeBytes === null) {
    return "文件大小格式无效，请使用 KB 或 MB";
  }

  if (sizeBytes > adminDocumentMaxFileSizeBytes) {
    return "单个文件大小不能超过 50 MB";
  }

  return null;
}

function visibleAdminCourses() {
  return mockAdminCourses.filter((item) => !item.deleted_at);
}

function adminDashboardSummary() {
  const courseProgress = Object.values(mockUserCourseProgress).flat();
  const completedCourses = courseProgress.filter((course) => course.completed).length;

  return {
    contentCount: visibleAdminContents().length,
    pendingPublishCount: [...visibleAdminContents(), ...visibleAdminDocuments(), ...visibleAdminCourses()].filter(
      (item) => item.status === "draft"
    ).length,
    readCount: [...mockBriefItems, ...mockAnnouncementItems].reduce((total, item) => total + item.readCount, 0),
    documentDownloadCount: mockMeDownloadItems.length,
    trainingCompletionRate: courseProgress.length === 0 ? 0 : Math.round((completedCourses / courseProgress.length) * 100),
    recentActions: mockAdminAuditLogs.map((item) => item.summary)
  };
}

function visibleAdminNewcomerTasks() {
  return mockAdminNewcomerTasks.filter((item) => !item.deleted_at).sort((left, right) => left.sort_order - right.sort_order);
}

function visibleNewcomerContent(query: URLSearchParams): NewcomerContentItem[] {
  const search = query.get("search")?.trim().toLowerCase() ?? "";
  return mockNewcomerContentItems
    .filter((item) => item.status === "published" && !item.deletedAt)
    .filter((item) => {
      if (!search) {
        return true;
      }
      return [item.title, item.summary, item.body, item.category].some((value) => value.toLowerCase().includes(search));
    })
    .map(({ body: _body, status: _status, deletedAt: _deletedAt, ...item }) => item);
}

function newcomerContentDetailById(contentId: string): NewcomerContentDetail | undefined {
  const item = mockNewcomerContentItems.find((candidate) => candidate.id === contentId && candidate.status === "published" && !candidate.deletedAt);
  if (!item) {
    return undefined;
  }
  const { status: _status, deletedAt: _deletedAt, ...detail } = item;
  return detail;
}

function myNewcomerTasksForRole(role: Role): MyNewcomerTaskItem[] {
  const userId = mockUsers[role].id;
  const progress = mockUserNewcomerTaskProgress[userId] ?? {};

  return mockAdminNewcomerTasks
    .filter((item) => item.enabled && !item.deleted_at)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      sort_order: item.sort_order,
      enabled: item.enabled,
      completed: Boolean(progress[item.id]),
      completed_at: progress[item.id] ?? null
    }));
}

function orderedAdminPortalConfigColumns() {
  return [...mockAdminPortalConfigColumns].sort((left, right) => left.display_order - right.display_order);
}

function visibleAdminTags() {
  return mockAdminTags.filter((item) => !item.deleted_at).sort((left, right) => left.sort_order - right.sort_order);
}

function visibleAdminUsers() {
  return mockAdminUsers.filter((item) => !item.deleted_at);
}

function adminCategoryFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/categories\/([^/]+)(?:\/(enable|disable))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "enable" | "disable" | undefined
  };
}

function adminTagFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/tags\/([^/]+)(?:\/(enable|disable))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "enable" | "disable" | undefined
  };
}

function adminContentFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/contents\/([^/]+)(?:\/(publish|archive))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "publish" | "archive" | undefined
  };
}

function adminDocumentFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/documents\/([^/]+)(?:\/(publish|archive))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "publish" | "archive" | undefined
  };
}

function adminCourseFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/courses\/([^/]+)(?:\/(publish|archive))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "publish" | "archive" | undefined
  };
}

function adminUserFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/users\/([^/]+)(?:\/(disable|roles))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "disable" | "roles" | undefined
  };
}

function isAllowedAdminRole(role: unknown): role is Role {
  return isApplicationRole(role);
}

const lastEnabledSuperUserMessage = "系统必须保留至少一名启用的超级用户";

function isEnabledSuperUser(user: AdminUserItem) {
  return user.role === "super_user" && user.enabled && !user.deleted_at;
}

function isLastEnabledSuperUser(user: AdminUserItem) {
  return isEnabledSuperUser(user) && mockAdminUsers.filter(isEnabledSuperUser).length === 1;
}

function adminNewcomerTaskFromPath(path: string) {
  const match = path.match(/^\/api\/v1\/admin\/newcomer-tasks\/([^/]+)(?:\/(enable|disable))?$/);

  if (!match) {
    return null;
  }

  return {
    id: decodeURIComponent(match[1]),
    action: match[2] as "enable" | "disable" | undefined
  };
}

function notFound<T>() {
  return response<T>(404, undefined as T, "NOT_FOUND", "资源不存在或已下架");
}

function forbidden<T>() {
  return response<T>(403, undefined as T, "FORBIDDEN", "当前账号无权访问该页面");
}

function validationError<T>(message: string) {
  return response<T>(400, undefined as T, "VALIDATION_ERROR", message);
}

function unauthorized<T>() {
  return response<T>(401, undefined as T, "UNAUTHORIZED", "登录状态已失效，请重新登录");
}


function canAccessDocumentDetail(document: { canPreview: boolean }, role: Role) {
  return role === "super_user" || document.canPreview;
}

function visibleDocuments(query: URLSearchParams, role: Role) {
  const search = query.get("search")?.trim().toLowerCase() ?? "";
  const category = query.get("category")?.trim() ?? "";
  const tag = query.get("tag")?.trim() ?? "";
  const fileType = query.get("file_type")?.trim().toLowerCase() ?? "";

  return mockDocuments
    .filter((item) => canAccessDocumentDetail(item, role))
    .filter((item) => (category ? item.category === category : true))
    .filter((item) => (tag ? item.tags.includes(tag) : true))
    .filter((item) => (fileType ? item.fileType === fileType : true))
    .filter((item) => {
      if (!search) {
        return true;
      }

      return [item.title, item.category, ...item.tags].some((value) => value.toLowerCase().includes(search));
    })
    .map((item) => ({ ...item, tags: [...item.tags] }));
}

function documentFileMetadata(document: { id: string; title: string; fileType: string }) {
  const metadataByType: Record<string, { extension: string; mimeType: string }> = {
    pdf: { extension: "pdf", mimeType: "application/pdf" },
    docx: { extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    xlsx: { extension: "xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    pptx: { extension: "pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }
  };
  const metadata = metadataByType[document.fileType] ?? { extension: document.fileType, mimeType: "application/octet-stream" };
  const slugByDocumentId: Record<string, string> = {
    doc_1001: "employee-handbook-2026",
    doc_1002: "expense-template",
    doc_1003: "security-onboarding-guide"
  };

  return {
    fileName: `${slugByDocumentId[document.id] ?? document.id}.${metadata.extension}`,
    mimeType: metadata.mimeType
  };
}

function coursesForRole(role: Role) {
  const userId = mockUsers[role].id;
  if (!mockUserCourseProgress[userId]) {
    mockUserCourseProgress[userId] = mockCourses.map((course) => ({ ...course }));
  }
  return mockUserCourseProgress[userId];
}

function courseListForRole(role: Role): CourseItem[] {
  return coursesForRole(role).map(({ id, title, required, progressPercent, completed, completedAt }) => ({
    id,
    title,
    required,
    progressPercent,
    completed,
    completedAt
  }));
}


function publishedBriefItems() {
  return mockBriefItems
    .filter((item) => item.status === "published" && !item.deletedAt)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

function latestBriefDate() {
  return publishedBriefItems()[0]?.briefDate ?? null;
}

function briefListItems(query: URLSearchParams): BriefItem[] {
  const search = query.get("search")?.trim().toLowerCase() ?? "";
  const latestDate = latestBriefDate();

  return publishedBriefItems()
    .filter((item) => {
      if (!search) {
        return true;
      }

      return [item.title, item.summary, item.body, item.source, item.department].some((value) => value.toLowerCase().includes(search));
    })
    .map(({ body: _body, source: _source, publishedAt: _publishedAt, department: _department, readCount: _readCount, status: _status, deletedAt: _deletedAt, ...item }) => ({
      ...item,
      keyPoints: [...item.keyPoints],
      isLatestFallback: latestDate ? item.briefDate === latestDate && latestDate !== "2026-05-27" : false
    }));
}

function briefDetailById(briefId: string): BriefDetail | null {
  const latestDate = latestBriefDate();
  const item = publishedBriefItems().find((candidate) => candidate.id === briefId);
  if (!item) {
    return null;
  }

  const { status: _status, deletedAt: _deletedAt, ...detail } = item;
  return {
    ...detail,
    keyPoints: [...detail.keyPoints],
    isLatestFallback: latestDate ? detail.briefDate === latestDate && latestDate !== "2026-05-27" : false
  };
}

function publishedAnnouncementItems() {
  return mockAnnouncementItems.filter((item) => item.publishedAt);
}

function announcementListItems(query: URLSearchParams): AnnouncementItem[] {
  const search = query.get("search")?.trim().toLowerCase() ?? "";
  const category = query.get("category")?.trim() ?? "";

  return publishedAnnouncementItems()
    .filter((item) => (category ? item.category === category : true))
    .filter((item) => {
      if (!search) {
        return true;
      }

      return [item.title, item.summary, item.body, item.department].some((value) => value.toLowerCase().includes(search));
    })
    .sort((left, right) => {
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1;
      }

      return right.publishedAt.localeCompare(left.publishedAt);
    })
    .map(({ body: _body, attachments: _attachments, ...item }) => ({ ...item }));
}

function announcementDetailById(announcementId: string) {
  const item = publishedAnnouncementItems().find((candidate) => candidate.id === announcementId);
  return item ? { ...item, attachments: item.attachments.map((attachment) => ({ ...attachment })) } : null;
}


function calculateForumHotness(post: Pick<ForumHotPostDetail, "viewCount" | "commentCount" | "likeCount">) {
  return post.viewCount + post.commentCount * 3 + post.likeCount * 2;
}

function publishedForumHotItems() {
  return mockForumHotItems.filter((item) => item.status === "published" && item.publishedAt);
}

function forumHotListItems(): ForumHotPostItem[] {
  return publishedForumHotItems()
    .map((item) => ({ ...item, hotnessScore: calculateForumHotness(item) }))
    .sort((left, right) => {
      if (left.configuredOrder !== undefined || right.configuredOrder !== undefined) {
        return (left.configuredOrder ?? Number.MAX_SAFE_INTEGER) - (right.configuredOrder ?? Number.MAX_SAFE_INTEGER);
      }

      return right.hotnessScore - left.hotnessScore;
    })
    .map(({ body: _body, ...item }) => ({ ...item }));
}

function forumHotDetailById(postId: string) {
  const item = publishedForumHotItems().find((candidate) => candidate.id === postId);
  return item ? { ...item, hotnessScore: calculateForumHotness(item) } : null;
}

function financeListItems(tag?: string): FinanceInfoItem[] {
  const normalizedTag = tag?.trim();

  return mockFinanceInfoItems
    .filter((item) => (normalizedTag ? item.tags.includes(normalizedTag as FinanceInfoDetail["tags"][number]) : true))
    .map(({ body: _body, ...item }) => ({ ...item, tags: [...item.tags] }));
}

function financeDetailById(financeInfoId: string) {
  const item = mockFinanceInfoItems.find((candidate) => candidate.id === financeInfoId);
  return item ? { ...item, tags: [...item.tags] } : null;
}

function trainingProgressForRole(role: Role) {
  const courses = coursesForRole(role);
  if (courses.length === 0) {
    return 0;
  }
  return Math.round(courses.reduce((total, course) => total + course.progressPercent, 0) / courses.length);
}

function trainingProgressItemsForRole(role: Role): MeTrainingProgressItem[] {
  const lastLearnedAtByCourseId: Record<string, string> = {
    course_1001: "2026-05-27T08:50:00+08:00",
    course_1002: "2026-05-26T17:25:00+08:00",
    course_1003: "2026-05-24T15:10:00+08:00"
  };

  return coursesForRole(role).map((course) => ({
    courseId: course.id,
    title: course.title,
    required: course.required,
    progressPercent: course.progressPercent,
    completed: course.completed,
    completedAt: course.completedAt,
    lastLearnedAt: course.completedAt ?? lastLearnedAtByCourseId[course.id] ?? "2026-05-27T08:00:00+08:00"
  }));
}

function badRequest<T>(code = "BAD_REQUEST", message = "请求参数不正确") {
  return response<T>(400, undefined as T, code, message);
}

function profileSummaryForRole(role: Role) {
  const userId = mockUsers[role].id;

  return {
    ...mockProfileSummary,
    preferences: {
      ...mockProfileSummary.preferences,
      ...(mockUserProfilePreferences[userId] ?? {})
    },
    favoritesCount: mockMeFavoriteItems.length,
    downloadsCount: mockMeDownloadItems.length,
    trainingProgressPercent: trainingProgressForRole(role)
  };
}

export async function mockTransport<T>(request: ApiRequest): Promise<ApiTransportResponse<T>> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const role = roleFromAuthorization(request.headers.Authorization);

  if (request.path === endpoints.auth.login && request.method === "POST") {
    const body = request.body as { roleHint?: Role; username?: string };
    const loginRole: Role = body.roleHint === "super_user" || body.username === "super" ? "super_user" : "user";
    return response<T>(
      200,
      {
        access_token: loginRole === "super_user" ? "mock-token-super-user" : "mock-token-user",
        token_type: "Bearer"
      } as T
    );
  }

  if (request.path === endpoints.auth.me) {
    if (!role) {
      return unauthorized<T>();
    }

    return response<T>(200, mockUsers[role] as T);
  }

  if (request.path === endpoints.auth.logout) {
    return response<T>(200, { ok: true } as T);
  }

  if (!role) {
    return unauthorized<T>();
  }

  if (request.path === endpoints.me.devices && request.method === "POST") {
    deviceCounter += 1;
    const body = request.body as RegisterDeviceRequest;
    const device: RegisteredDevice = {
      id: `device_mock_${String(deviceCounter).padStart(3, "0")}`,
      user_id: mockUsers[role].id,
      platform: body.platform,
      expo_push_token: body.expo_push_token,
      device_name: body.device_name,
      app_version: body.app_version,
      enabled: true,
      last_seen_at: "2026-05-27T10:00:00+08:00"
    };

    mockRegisteredDevices = [...mockRegisteredDevices, device];

    return response<T>(200, device as T);
  }

  const deviceDeleteMatch = request.path.match(/^\/api\/v1\/me\/devices\/([^/]+)$/);

  if (deviceDeleteMatch && request.method === "DELETE") {
    const deviceId = decodeURIComponent(deviceDeleteMatch[1]);
    const device = mockRegisteredDevices.find(
      (item) => item.id === deviceId && item.user_id === mockUsers[role].id && item.enabled
    );

    if (!device) {
      return response<T>(404, undefined as T, "NOT_FOUND", "资源不存在或已下架");
    }

    mockRegisteredDevices = mockRegisteredDevices.map((item) =>
      item.id === deviceId ? { ...item, enabled: false } : item
    );

    return response<T>(200, { ok: true } as T);
  }

  if (request.path === endpoints.me.notificationSettings && request.method === "GET") {
    return response<T>(200, mockNotificationSettings as T);
  }

  if (request.path === endpoints.me.notificationSettings && request.method === "PUT") {
    mockNotificationSettings = request.body as NotificationSettings;
    return response<T>(200, mockNotificationSettings as T);
  }

  if (request.path === endpoints.me.favorites && request.method === "GET") {
    return response<T>(200, mockMeFavoriteItems.map((item) => ({ ...item })) as T);
  }

  const favoriteDeleteMatch = request.path.match(/^\/api\/v1\/me\/favorites\/([^/]+)$/);

  if (favoriteDeleteMatch && request.method === "DELETE") {
    const favoriteId = decodeURIComponent(favoriteDeleteMatch[1]);
    const favorite = mockMeFavoriteItems.find((item) => item.id === favoriteId);

    if (!favorite) {
      return notFound<T>();
    }

    mockMeFavoriteItems = mockMeFavoriteItems.filter((item) => item.id !== favoriteId);
    return response<T>(200, { ok: true } as T);
  }

  if (request.path === endpoints.me.downloads && request.method === "GET") {
    return response<T>(200, mockMeDownloadItems.map((item) => ({ ...item })) as T);
  }

  if (request.path === endpoints.me.trainingProgress && request.method === "GET") {
    return response<T>(200, trainingProgressItemsForRole(role) as T);
  }

  if (request.path === endpoints.portal.home) {
    return response<T>(200, mockHomeSummary as T);
  }


  const previewMatch = request.path.match(/^\/api\/v1\/documents\/([^/]+)\/preview-url$/);

  if (previewMatch) {
    const documentId = decodeURIComponent(previewMatch[1]);
    const document = mockDocuments.find((item) => item.id === documentId);

    if (!document || !document.canPreview) {
      return response<T>(404, undefined as T, "NOT_FOUND", "资源不存在或已下架");
    }

    const file = documentFileMetadata(document);

    return response<T>(
      200,
      {
        document_id: document.id,
        preview_url: `https://mock.projectm.local/previews/${document.id}?expires=900`,
        expires_at: "2026-05-27T10:15:00+08:00",
        file_type: document.fileType,
        file_name: file.fileName,
        mime_type: file.mimeType
      } as T
    );
  }

  const downloadMatch = request.path.match(/^\/api\/v1\/documents\/([^/]+)\/download$/);

  if (downloadMatch && request.method === "GET") {
    const documentId = decodeURIComponent(downloadMatch[1]);
    const document = mockDocuments.find((item) => item.id === documentId);

    if (!document || !document.canPreview) {
      return response<T>(404, undefined as T, "NOT_FOUND", "资源不存在或已下架");
    }

    const file = documentFileMetadata(document);

    return response<T>(
      200,
      {
        document_id: document.id,
        download_url: `https://mock.projectm.local/downloads/${document.id}?expires=900`,
        expires_at: "2026-05-27T10:15:00+08:00",
        file_name: file.fileName,
        mime_type: file.mimeType
      } as T
    );
  }

  if (request.path === endpoints.portal.courses && request.method === "GET") {
    return response<T>(200, courseListForRole(role) as T);
  }

  const courseMatch = request.path.match(/^\/api\/v1\/mobile\/courses\/([^/]+)(?:\/(progress|complete))?$/);

  if (courseMatch) {
    const courseId = decodeURIComponent(courseMatch[1]);
    const action = courseMatch[2] as "progress" | "complete" | undefined;
    const courses = coursesForRole(role);
    const courseIndex = courses.findIndex((course) => course.id === courseId);

    if (courseIndex < 0) {
      return notFound<T>();
    }

    if (!action && request.method === "GET") {
      return response<T>(200, courses[courseIndex] as T);
    }

    if (action === "progress" && request.method === "POST") {
      const body = request.body as CourseProgressUpdateInput;
      if (!Number.isInteger(body.progressPercent) || body.progressPercent < 0 || body.progressPercent > 100) {
        return badRequest<T>("INVALID_PROGRESS", "学习进度必须是 0 到 100 的整数");
      }

      const updated: CourseDetail = {
        ...courses[courseIndex],
        progressPercent: body.progressPercent,
        completed: body.progressPercent === 100 ? true : false,
        completedAt: body.progressPercent === 100 ? courses[courseIndex].completedAt ?? nowIso() : null
      };
      courses[courseIndex] = updated;
      return response<T>(200, updated as T);
    }

    if (action === "complete" && request.method === "POST") {
      const updated: CourseDetail = {
        ...courses[courseIndex],
        progressPercent: 100,
        completed: true,
        completedAt: courses[courseIndex].completedAt ?? nowIso()
      };
      courses[courseIndex] = updated;
      return response<T>(200, updated as T);
    }

    return notFound<T>();
  }


  const { pathname, query } = splitPathAndQuery(request.path);


  if (pathname === endpoints.portal.documents && request.method === "GET") {
    return response<T>(200, visibleDocuments(query, role) as T);
  }

  const documentDetailMatch = pathname.match(/^\/api\/v1\/mobile\/documents\/([^/]+)$/);

  if (documentDetailMatch && request.method === "GET") {
    const documentId = decodeURIComponent(documentDetailMatch[1]);
    const document = mockDocuments.find((item) => item.id === documentId);

    if (!document || !canAccessDocumentDetail(document, role)) {
      return notFound<T>();
    }

    return response<T>(200, { ...document, tags: [...document.tags] } as T);
  }

  if (pathname === endpoints.portal.briefs && request.method === "GET") {
    return response<T>(200, briefListItems(query) as T);
  }

  const briefMatch = pathname.match(/^\/api\/v1\/mobile\/briefs\/([^/]+)(?:\/(favorite))?$/);

  if (briefMatch) {
    const briefId = decodeURIComponent(briefMatch[1]);
    const action = briefMatch[2] as "favorite" | undefined;
    const existingIndex = mockBriefItems.findIndex((item) => item.id === briefId && item.status === "published" && !item.deletedAt);

    if (existingIndex < 0) {
      return notFound<T>();
    }

    if (!action && request.method === "GET") {
      return response<T>(200, briefDetailById(briefId) as T);
    }

    if (action === "favorite" && request.method === "POST") {
      const body = request.body as BriefFavoriteInput;
      mockBriefItems[existingIndex] = {
        ...mockBriefItems[existingIndex],
        favorite: Boolean(body.favorite)
      };
      return response<T>(200, briefDetailById(briefId) as T);
    }

    return notFound<T>();
  }

  if (pathname === endpoints.portal.announcements && request.method === "GET") {
    return response<T>(200, announcementListItems(query) as T);
  }

  const announcementMatch = pathname.match(/^\/api\/v1\/mobile\/announcements\/([^/]+)(?:\/(favorite))?$/);

  if (announcementMatch) {
    const announcementId = decodeURIComponent(announcementMatch[1]);
    const action = announcementMatch[2] as "favorite" | undefined;
    const existingIndex = mockAnnouncementItems.findIndex((item) => item.id === announcementId && item.publishedAt);

    if (existingIndex < 0) {
      return notFound<T>();
    }

    if (!action && request.method === "GET") {
      return response<T>(200, announcementDetailById(announcementId) as T);
    }

    if (action === "favorite" && request.method === "POST") {
      const body = request.body as AnnouncementFavoriteInput;
      mockAnnouncementItems[existingIndex] = {
        ...mockAnnouncementItems[existingIndex],
        favorite: Boolean(body.favorite)
      };
      return response<T>(200, announcementDetailById(announcementId) as T);
    }

    return notFound<T>();
  }

  if (pathname === endpoints.portal.newcomerContent && request.method === "GET") {
    return response<T>(200, visibleNewcomerContent(query) as T);
  }

  const newcomerContentMatch = pathname.match(/^\/api\/v1\/mobile\/newcomer\/content\/([^/]+)(?:\/(favorite))?$/);

  if (newcomerContentMatch) {
    const contentId = decodeURIComponent(newcomerContentMatch[1]);
    const action = newcomerContentMatch[2] as "favorite" | undefined;
    const existingIndex = mockNewcomerContentItems.findIndex(
      (item) => item.id === contentId && item.status === "published" && !item.deletedAt
    );

    if (existingIndex < 0) {
      return notFound<T>();
    }

    if (!action && request.method === "GET") {
      return response<T>(200, newcomerContentDetailById(contentId) as T);
    }

    if (action === "favorite" && request.method === "POST") {
      const body = request.body as NewcomerContentFavoriteInput;
      mockNewcomerContentItems[existingIndex] = {
        ...mockNewcomerContentItems[existingIndex],
        favorite: Boolean(body.favorite)
      };
      return response<T>(200, newcomerContentDetailById(contentId) as T);
    }

    return notFound<T>();
  }

  if (pathname === endpoints.portal.forumHot && request.method === "GET") {
    return response<T>(200, forumHotListItems() as T);
  }

  const forumHotMatch = pathname.match(/^\/api\/v1\/mobile\/forum-hot\/([^/]+)$/);

  if (forumHotMatch) {
    const postId = decodeURIComponent(forumHotMatch[1]);

    if (request.method === "GET") {
      const detail = forumHotDetailById(postId);
      return detail ? response<T>(200, detail as T) : notFound<T>();
    }

    return notFound<T>();
  }

  if (pathname === endpoints.portal.finance && request.method === "GET") {
    return response<T>(200, financeListItems(query.get("tag") ?? undefined) as T);
  }

  const financeMatch = pathname.match(/^\/api\/v1\/mobile\/finance\/([^/]+)(?:\/(favorite))?$/);

  if (financeMatch) {
    const financeInfoId = decodeURIComponent(financeMatch[1]);
    const action = financeMatch[2] as "favorite" | undefined;
    const existingIndex = mockFinanceInfoItems.findIndex((item) => item.id === financeInfoId);

    if (existingIndex < 0) {
      return notFound<T>();
    }

    if (!action && request.method === "GET") {
      return response<T>(200, financeDetailById(financeInfoId) as T);
    }

    if (action === "favorite" && request.method === "POST") {
      const body = request.body as FinanceInfoFavoriteInput;
      mockFinanceInfoItems[existingIndex] = {
        ...mockFinanceInfoItems[existingIndex],
        favorite: Boolean(body.favorite)
      };
      return response<T>(200, financeDetailById(financeInfoId) as T);
    }

    return notFound<T>();
  }

  if ((request.path === endpoints.portal.profile || request.path === endpoints.me.profile) && request.method === "GET") {
    return response<T>(200, profileSummaryForRole(role) as T);
  }

  if (request.path === endpoints.me.profile && request.method === "PUT") {
    const body = request.body as { preferences?: ProfilePreferenceUpdateInput };
    const nextShowNewcomerOnHome = body.preferences?.showNewcomerOnHome;

    if (nextShowNewcomerOnHome !== undefined && typeof nextShowNewcomerOnHome !== "boolean") {
      return badRequest<T>();
    }

    const userId = mockUsers[role].id;
    mockUserProfilePreferences = {
      ...mockUserProfilePreferences,
      [userId]: {
        ...(mockUserProfilePreferences[userId] ?? {}),
        ...(nextShowNewcomerOnHome === undefined ? {} : { showNewcomerOnHome: nextShowNewcomerOnHome })
      }
    };

    return response<T>(200, profileSummaryForRole(role) as T);
  }

  if (pathname === endpoints.portal.myNewcomerTasks && request.method === "GET") {
    return response<T>(200, myNewcomerTasksForRole(role) as T);
  }

  const myNewcomerTaskMatch = pathname.match(/^\/api\/v1\/mobile\/me\/newcomer-tasks\/([^/]+)(?:\/(complete))?$/);

  if (myNewcomerTaskMatch) {
    const taskId = decodeURIComponent(myNewcomerTaskMatch[1]);
    const action = myNewcomerTaskMatch[2] as "complete" | undefined;
    const userId = mockUsers[role].id;
    const task = myNewcomerTasksForRole(role).find((item) => item.id === taskId);

    if (!task) {
      return notFound<T>();
    }

    if (!action && request.method === "GET") {
      return response<T>(200, task as T);
    }

    if (action === "complete" && request.method === "POST") {
      const completedAt = task.completed_at ?? nowIso();
      mockUserNewcomerTaskProgress = {
        ...mockUserNewcomerTaskProgress,
        [userId]: {
          ...(mockUserNewcomerTaskProgress[userId] ?? {}),
          [taskId]: completedAt
        }
      };
      return response<T>(200, { ...task, completed: true, completed_at: completedAt } as T);
    }

    return notFound<T>();
  }

  if (pathname.startsWith("/api/v1/admin/")) {
    if (role !== "super_user") {
      return forbidden<T>();
    }

    if (pathname === endpoints.admin.dashboard) {
      return response<T>(200, adminDashboardSummary() as T);
    }



    if (pathname === endpoints.admin.auditLogs && request.method === "GET") {
      return response<T>(200, visibleAdminAuditLogs(query) as T);
    }

    if (pathname === endpoints.admin.portalConfig && request.method === "GET") {
      return response<T>(200, { columns: orderedAdminPortalConfigColumns() } satisfies AdminPortalConfig as T);
    }

    if (pathname === endpoints.admin.portalConfig && request.method === "PUT") {
      const body = request.body as AdminPortalConfigColumnUpdateInput;
      const existingIndex = mockAdminPortalConfigColumns.findIndex((item) => item.key === body.key);

      if (existingIndex < 0) {
        return notFound<T>();
      }

      const updated: AdminPortalConfigColumn = {
        ...mockAdminPortalConfigColumns[existingIndex],
        enabled: body.enabled,
        display_order: body.display_order,
        display_count: body.display_count
      };
      mockAdminPortalConfigColumns[existingIndex] = updated;
      appendAdminAuditLog({
        action: "config_update",
        resource_type: "portal_config",
        resource_id: updated.key,
        summary: `更新首页栏目配置：${updated.title}`
      });
      return response<T>(200, updated as T);
    }

    if (pathname === endpoints.admin.roles && request.method === "GET") {
      return response<T>(200, [...APPLICATION_ROLES] as T);
    }

    if (pathname === endpoints.admin.users && request.method === "GET") {
      return response<T>(200, visibleAdminUsers() as T);
    }

    if (pathname === endpoints.admin.users && request.method === "POST") {
      const body = request.body as AdminUserUpsertInput;

      if (!isAllowedAdminRole(body.role)) {
        return response<T>(400, undefined as T, "VALIDATION_ERROR", "角色只能是 user 或 super_user");
      }

      userCounter += 1;
      const created: AdminUserItem = {
        id: `admin_user_mock_${String(userCounter).padStart(3, "0")}`,
        name: body.name,
        email: body.email,
        department: body.department,
        role: body.role,
        enabled: true,
        updated_at: nowIso(),
        disabled_at: null,
        deleted_at: null
      };
      mockAdminUsers = [created, ...mockAdminUsers];
      appendAdminAuditLog({
        action: "create",
        resource_type: "user",
        resource_id: created.id,
        summary: `创建用户：${created.name}`
      });
      return response<T>(200, created as T);
    }

    const userPath = adminUserFromPath(pathname);

    if (userPath) {
      const existingIndex = mockAdminUsers.findIndex((item) => item.id === userPath.id);
      const existing = existingIndex >= 0 ? mockAdminUsers[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!userPath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!userPath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminUserUpsertInput>;

        if (body.role !== undefined && !isAllowedAdminRole(body.role)) {
          return response<T>(400, undefined as T, "VALIDATION_ERROR", "角色只能是 user 或 super_user");
        }

        if (body.role === "user" && isLastEnabledSuperUser(existing)) {
          return response<T>(400, undefined as T, "VALIDATION_ERROR", lastEnabledSuperUserMessage);
        }

        const updated: AdminUserItem = {
          ...existing,
          ...body,
          updated_at: nowIso()
        };
        mockAdminUsers[existingIndex] = updated;
        appendAdminAuditLog({
          action: body.role !== undefined && body.role !== existing.role ? "role_change" : "update",
          resource_type: "user",
          resource_id: updated.id,
          summary:
            body.role !== undefined && body.role !== existing.role
              ? `修改用户角色：${updated.name} -> ${updated.role}`
              : `更新用户：${updated.name}`
        });
        return response<T>(200, updated as T);
      }

      if (userPath.action === "roles" && request.method === "POST") {
        const body = request.body as AdminUserRoleInput;

        if (!isAllowedAdminRole(body.role)) {
          return response<T>(400, undefined as T, "VALIDATION_ERROR", "角色只能是 user 或 super_user");
        }

        if (body.role === "user" && isLastEnabledSuperUser(existing)) {
          return response<T>(400, undefined as T, "VALIDATION_ERROR", lastEnabledSuperUserMessage);
        }

        const updated: AdminUserItem = {
          ...existing,
          role: body.role,
          updated_at: nowIso()
        };
        mockAdminUsers[existingIndex] = updated;
        appendAdminAuditLog({
          action: "role_change",
          resource_type: "user",
          resource_id: updated.id,
          summary: `修改用户角色：${updated.name} -> ${updated.role}`
        });
        return response<T>(200, updated as T);
      }

      if (userPath.action === "disable" && request.method === "POST") {
        if (isLastEnabledSuperUser(existing)) {
          return response<T>(400, undefined as T, "VALIDATION_ERROR", lastEnabledSuperUserMessage);
        }

        const updated: AdminUserItem = {
          ...existing,
          enabled: false,
          updated_at: nowIso(),
          disabled_at: nowIso()
        };
        mockAdminUsers[existingIndex] = updated;
        appendAdminAuditLog({
          action: "disable",
          resource_type: "user",
          resource_id: updated.id,
          summary: `禁用用户：${updated.name}`
        });
        return response<T>(200, updated as T);
      }
    }

    if (pathname === endpoints.admin.categories && request.method === "GET") {
      return response<T>(200, visibleAdminCategories() as T);
    }

    if (pathname === endpoints.admin.categories && request.method === "POST") {
      const body = request.body as AdminCategoryUpsertInput;
      categoryCounter += 1;
      const created: AdminCategoryItem = {
        id: `admin_category_mock_${String(categoryCounter).padStart(3, "0")}`,
        name: body.name,
        description: body.description,
        sort_order: body.sort_order,
        enabled: false,
        updated_at: nowIso(),
        enabled_at: null,
        disabled_at: nowIso(),
        deleted_at: null
      };
      mockAdminCategories = [created, ...mockAdminCategories];
      return response<T>(200, created as T);
    }

    const categoryPath = adminCategoryFromPath(pathname);

    if (categoryPath) {
      const existingIndex = mockAdminCategories.findIndex((item) => item.id === categoryPath.id);
      const existing = existingIndex >= 0 ? mockAdminCategories[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!categoryPath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!categoryPath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminCategoryUpsertInput>;
        const updated: AdminCategoryItem = {
          ...existing,
          ...body,
          updated_at: nowIso()
        };
        mockAdminCategories[existingIndex] = updated;
        return response<T>(200, updated as T);
      }

      if (categoryPath.action === "enable" && request.method === "POST") {
        const updated: AdminCategoryItem = {
          ...existing,
          enabled: true,
          updated_at: nowIso(),
          enabled_at: nowIso(),
          disabled_at: null
        };
        mockAdminCategories[existingIndex] = updated;
        return response<T>(200, updated as T);
      }

      if (categoryPath.action === "disable" && request.method === "POST") {
        const updated: AdminCategoryItem = {
          ...existing,
          enabled: false,
          updated_at: nowIso(),
          disabled_at: nowIso()
        };
        mockAdminCategories[existingIndex] = updated;
        return response<T>(200, updated as T);
      }
    }

    if (pathname === endpoints.admin.tags && request.method === "GET") {
      return response<T>(200, visibleAdminTags() as T);
    }

    if (pathname === endpoints.admin.tags && request.method === "POST") {
      const body = request.body as AdminTagUpsertInput;
      tagCounter += 1;
      const created: AdminTagItem = {
        id: `admin_tag_mock_${String(tagCounter).padStart(3, "0")}`,
        name: body.name,
        description: body.description,
        sort_order: body.sort_order,
        enabled: false,
        updated_at: nowIso(),
        enabled_at: null,
        disabled_at: nowIso(),
        deleted_at: null
      };
      mockAdminTags = [created, ...mockAdminTags];
      return response<T>(200, created as T);
    }

    const tagPath = adminTagFromPath(pathname);

    if (tagPath) {
      const existingIndex = mockAdminTags.findIndex((item) => item.id === tagPath.id);
      const existing = existingIndex >= 0 ? mockAdminTags[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!tagPath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!tagPath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminTagUpsertInput>;
        const updated: AdminTagItem = {
          ...existing,
          ...body,
          updated_at: nowIso()
        };
        mockAdminTags[existingIndex] = updated;
        return response<T>(200, updated as T);
      }

      if (tagPath.action === "enable" && request.method === "POST") {
        const updated: AdminTagItem = {
          ...existing,
          enabled: true,
          updated_at: nowIso(),
          enabled_at: nowIso(),
          disabled_at: null
        };
        mockAdminTags[existingIndex] = updated;
        return response<T>(200, updated as T);
      }

      if (tagPath.action === "disable" && request.method === "POST") {
        const updated: AdminTagItem = {
          ...existing,
          enabled: false,
          updated_at: nowIso(),
          disabled_at: nowIso()
        };
        mockAdminTags[existingIndex] = updated;
        return response<T>(200, updated as T);
      }
    }

    if (pathname === endpoints.admin.newcomerTasks && request.method === "GET") {
      return response<T>(200, visibleAdminNewcomerTasks() as T);
    }

    if (pathname === endpoints.admin.newcomerTasks && request.method === "POST") {
      const body = request.body as AdminNewcomerTaskUpsertInput;
      newcomerTaskCounter += 1;
      const created: AdminNewcomerTaskItem = {
        id: `admin_newcomer_task_mock_${String(newcomerTaskCounter).padStart(3, "0")}`,
        title: body.title,
        description: body.description,
        sort_order: body.sort_order,
        enabled: false,
        updated_at: nowIso(),
        enabled_at: null,
        disabled_at: nowIso(),
        deleted_at: null
      };
      mockAdminNewcomerTasks = [created, ...mockAdminNewcomerTasks];
      return response<T>(200, created as T);
    }

    const newcomerTaskPath = adminNewcomerTaskFromPath(pathname);

    if (newcomerTaskPath) {
      const existingIndex = mockAdminNewcomerTasks.findIndex((item) => item.id === newcomerTaskPath.id);
      const existing = existingIndex >= 0 ? mockAdminNewcomerTasks[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!newcomerTaskPath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!newcomerTaskPath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminNewcomerTaskUpsertInput>;
        const updated: AdminNewcomerTaskItem = {
          ...existing,
          ...body,
          updated_at: nowIso()
        };
        mockAdminNewcomerTasks[existingIndex] = updated;
        return response<T>(200, updated as T);
      }

      if (newcomerTaskPath.action === "enable" && request.method === "POST") {
        const updated: AdminNewcomerTaskItem = {
          ...existing,
          enabled: true,
          updated_at: nowIso(),
          enabled_at: nowIso(),
          disabled_at: null
        };
        mockAdminNewcomerTasks[existingIndex] = updated;
        return response<T>(200, updated as T);
      }

      if (newcomerTaskPath.action === "disable" && request.method === "POST") {
        const updated: AdminNewcomerTaskItem = {
          ...existing,
          enabled: false,
          updated_at: nowIso(),
          disabled_at: nowIso()
        };
        mockAdminNewcomerTasks[existingIndex] = updated;
        return response<T>(200, updated as T);
      }
    }

    if (pathname === endpoints.admin.courses && request.method === "GET") {
      return response<T>(200, visibleAdminCourses() as T);
    }

    if (pathname === endpoints.admin.courses && request.method === "POST") {
      const body = request.body as AdminCourseUpsertInput;
      courseCounter += 1;
      const created: AdminCourseItem = {
        id: `admin_course_mock_${String(courseCounter).padStart(3, "0")}`,
        title: body.title,
        summary: body.summary,
        required: body.required,
        material_document_id: body.material_document_id ?? null,
        external_url: body.external_url ?? null,
        status: "draft",
        updated_at: nowIso(),
        published_at: null,
        archived_at: null,
        deleted_at: null
      };
      mockAdminCourses = [created, ...mockAdminCourses];
      appendAdminAuditLog({
        action: "create",
        resource_type: "course",
        resource_id: created.id,
        summary: `创建课程：${created.title}`
      });
      return response<T>(200, created as T);
    }

    const coursePath = adminCourseFromPath(pathname);

    if (coursePath) {
      const existingIndex = mockAdminCourses.findIndex((item) => item.id === coursePath.id);
      const existing = existingIndex >= 0 ? mockAdminCourses[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!coursePath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!coursePath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminCourseUpsertInput>;
        const updated: AdminCourseItem = {
          ...existing,
          ...body,
          material_document_id: body.material_document_id ?? existing.material_document_id,
          external_url: body.external_url ?? existing.external_url,
          updated_at: nowIso()
        };
        mockAdminCourses[existingIndex] = updated;
        appendAdminAuditLog({
          action: "update",
          resource_type: "course",
          resource_id: updated.id,
          summary: `更新课程：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (coursePath.action === "publish" && request.method === "POST") {
        const updated: AdminCourseItem = {
          ...existing,
          status: "published",
          updated_at: nowIso(),
          published_at: nowIso(),
          archived_at: null
        };
        mockAdminCourses[existingIndex] = updated;
        appendAdminAuditLog({
          action: "publish",
          resource_type: "course",
          resource_id: updated.id,
          summary: `发布课程：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (coursePath.action === "archive" && request.method === "POST") {
        const updated: AdminCourseItem = {
          ...existing,
          status: "archived",
          updated_at: nowIso(),
          archived_at: nowIso()
        };
        mockAdminCourses[existingIndex] = updated;
        appendAdminAuditLog({
          action: "archive",
          resource_type: "course",
          resource_id: updated.id,
          summary: `归档课程：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (!coursePath.action && request.method === "DELETE") {
        const updated: AdminCourseItem = {
          ...existing,
          updated_at: nowIso(),
          deleted_at: nowIso()
        };
        mockAdminCourses[existingIndex] = updated;
        appendAdminAuditLog({
          action: "delete",
          resource_type: "course",
          resource_id: updated.id,
          summary: `删除课程：${updated.title}`
        });
        return response<T>(200, updated as T);
      }
    }

    if (pathname === endpoints.admin.documents && request.method === "GET") {
      return response<T>(200, visibleAdminDocuments() as T);
    }

    if (pathname === endpoints.admin.documents && request.method === "POST") {
      const body = request.body as AdminDocumentUpsertInput;
      const fileMetadataError = validateAdminDocumentFileMetadata(body);

      if (fileMetadataError) {
        return validationError<T>(fileMetadataError);
      }

      documentCounter += 1;
      const created: AdminDocumentItem = {
        id: `admin_doc_mock_${String(documentCounter).padStart(3, "0")}`,
        title: body.title,
        category: body.category,
        file_type: body.file_type,
        size_label: body.size_label,
        status: "draft",
        updated_at: nowIso(),
        published_at: null,
        archived_at: null,
        deleted_at: null
      };
      mockAdminDocuments = [created, ...mockAdminDocuments];
      appendAdminAuditLog({
        action: "create",
        resource_type: "document",
        resource_id: created.id,
        summary: `创建文档：${created.title}`
      });
      return response<T>(200, created as T);
    }

    const documentPath = adminDocumentFromPath(pathname);

    if (documentPath) {
      const existingIndex = mockAdminDocuments.findIndex((item) => item.id === documentPath.id);
      const existing = existingIndex >= 0 ? mockAdminDocuments[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!documentPath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!documentPath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminDocumentUpsertInput>;
        const nextFileMetadata = {
          file_type: body.file_type ?? existing.file_type,
          size_label: body.size_label ?? existing.size_label
        };
        const fileMetadataError = validateAdminDocumentFileMetadata(nextFileMetadata);

        if (fileMetadataError) {
          return validationError<T>(fileMetadataError);
        }

        const updated: AdminDocumentItem = {
          ...existing,
          ...body,
          updated_at: nowIso()
        };
        mockAdminDocuments[existingIndex] = updated;
        appendAdminAuditLog({
          action: "update",
          resource_type: "document",
          resource_id: updated.id,
          summary: `更新文档：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (documentPath.action === "publish" && request.method === "POST") {
        const updated: AdminDocumentItem = {
          ...existing,
          status: "published",
          updated_at: nowIso(),
          published_at: nowIso(),
          archived_at: null
        };
        mockAdminDocuments[existingIndex] = updated;
        appendAdminAuditLog({
          action: "publish",
          resource_type: "document",
          resource_id: updated.id,
          summary: `发布文档：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (documentPath.action === "archive" && request.method === "POST") {
        const updated: AdminDocumentItem = {
          ...existing,
          status: "archived",
          updated_at: nowIso(),
          archived_at: nowIso()
        };
        mockAdminDocuments[existingIndex] = updated;
        appendAdminAuditLog({
          action: "archive",
          resource_type: "document",
          resource_id: updated.id,
          summary: `归档文档：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (!documentPath.action && request.method === "DELETE") {
        const updated: AdminDocumentItem = {
          ...existing,
          updated_at: nowIso(),
          deleted_at: nowIso()
        };
        mockAdminDocuments[existingIndex] = updated;
        appendAdminAuditLog({
          action: "delete",
          resource_type: "document",
          resource_id: updated.id,
          summary: `删除文档：${updated.title}`
        });
        return response<T>(200, updated as T);
      }
    }

    if (pathname === endpoints.admin.contents && request.method === "GET") {
      return response<T>(200, visibleAdminContents() as T);
    }

    if (pathname === endpoints.admin.contents && request.method === "POST") {
      const body = request.body as AdminContentUpsertInput;
      contentCounter += 1;
      const created: AdminContentItem = {
        id: `content_mock_${String(contentCounter).padStart(3, "0")}`,
        type: body.type,
        title: body.title,
        summary: body.summary,
        body: body.body,
        category: body.category,
        status: "draft",
        updated_at: nowIso(),
        published_at: null,
        archived_at: null,
        deleted_at: null
      };
      mockAdminContents = [created, ...mockAdminContents];
      appendAdminAuditLog({
        action: "create",
        resource_type: "content",
        resource_id: created.id,
        summary: `创建内容：${created.title}`
      });
      return response<T>(200, created as T);
    }

    const contentPath = adminContentFromPath(pathname);

    if (contentPath) {
      const existingIndex = mockAdminContents.findIndex((item) => item.id === contentPath.id);
      const existing = existingIndex >= 0 ? mockAdminContents[existingIndex] : undefined;

      if (!existing || existing.deleted_at) {
        return notFound<T>();
      }

      if (!contentPath.action && request.method === "GET") {
        return response<T>(200, existing as T);
      }

      if (!contentPath.action && request.method === "PUT") {
        const body = request.body as Partial<AdminContentUpsertInput>;
        const updated: AdminContentItem = {
          ...existing,
          ...body,
          updated_at: nowIso()
        };
        mockAdminContents[existingIndex] = updated;
        appendAdminAuditLog({
          action: "update",
          resource_type: "content",
          resource_id: updated.id,
          summary: `更新内容：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (contentPath.action === "publish" && request.method === "POST") {
        const updated: AdminContentItem = {
          ...existing,
          status: "published",
          updated_at: nowIso(),
          published_at: nowIso(),
          archived_at: null
        };
        mockAdminContents[existingIndex] = updated;
        appendAdminAuditLog({
          action: "publish",
          resource_type: "content",
          resource_id: updated.id,
          summary: `发布内容：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (contentPath.action === "archive" && request.method === "POST") {
        const updated: AdminContentItem = {
          ...existing,
          status: "archived",
          updated_at: nowIso(),
          archived_at: nowIso()
        };
        mockAdminContents[existingIndex] = updated;
        appendAdminAuditLog({
          action: "archive",
          resource_type: "content",
          resource_id: updated.id,
          summary: `归档内容：${updated.title}`
        });
        return response<T>(200, updated as T);
      }

      if (!contentPath.action && request.method === "DELETE") {
        const updated: AdminContentItem = {
          ...existing,
          updated_at: nowIso(),
          deleted_at: nowIso()
        };
        mockAdminContents[existingIndex] = updated;
        appendAdminAuditLog({
          action: "delete",
          resource_type: "content",
          resource_id: updated.id,
          summary: `删除内容：${updated.title}`
        });
        return response<T>(200, updated as T);
      }
    }

  }

  return response<T>(404, undefined as T, "NOT_FOUND", "资源不存在或已下架");
}
