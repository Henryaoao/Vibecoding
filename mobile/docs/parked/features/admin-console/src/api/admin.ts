import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type {
  AdminAuditLogList,
  AdminAuditLogQuery,
  AdminCategoryItem,
  AdminCategoryUpsertInput,
  AdminContentItem,
  AdminContentUpsertInput,
  AdminCourseItem,
  AdminCourseUpsertInput,
  AdminDashboardSummary,
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
  Role
} from "@/types/domain";

export function getAdminDashboard() {
  return apiRequest<AdminDashboardSummary>({
    path: endpoints.admin.dashboard
  });
}

function auditLogPath(params: AdminAuditLogQuery = {}) {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.action) {
    searchParams.set("action", params.action);
  }

  if (params.resourceType) {
    searchParams.set("resource_type", params.resourceType);
  }

  const query = searchParams.toString();
  return query ? `${endpoints.admin.auditLogs}?${query}` : endpoints.admin.auditLogs;
}

export function getAdminAuditLogs(params?: AdminAuditLogQuery) {
  return apiRequest<AdminAuditLogList>({
    path: auditLogPath(params)
  });
}


export function getAdminPortalConfig() {
  return apiRequest<AdminPortalConfig>({
    path: endpoints.admin.portalConfig
  });
}

export function updateAdminPortalConfigColumn(input: AdminPortalConfigColumnUpdateInput) {
  return apiRequest<AdminPortalConfigColumn>({
    path: endpoints.admin.portalConfig,
    method: "PUT",
    body: input
  });
}

export function getAdminCategories() {
  return apiRequest<AdminCategoryItem[]>({
    path: endpoints.admin.categories
  });
}

export function getAdminCategory(categoryId: string) {
  return apiRequest<AdminCategoryItem>({
    path: endpoints.admin.category(categoryId)
  });
}

export function createAdminCategory(input: AdminCategoryUpsertInput) {
  return apiRequest<AdminCategoryItem>({
    path: endpoints.admin.categories,
    method: "POST",
    body: input
  });
}

export function updateAdminCategory(categoryId: string, input: Partial<AdminCategoryUpsertInput>) {
  return apiRequest<AdminCategoryItem>({
    path: endpoints.admin.category(categoryId),
    method: "PUT",
    body: input
  });
}

export function enableAdminCategory(categoryId: string) {
  return apiRequest<AdminCategoryItem>({
    path: endpoints.admin.enableCategory(categoryId),
    method: "POST"
  });
}

export function disableAdminCategory(categoryId: string) {
  return apiRequest<AdminCategoryItem>({
    path: endpoints.admin.disableCategory(categoryId),
    method: "POST"
  });
}

export function getAdminTags() {
  return apiRequest<AdminTagItem[]>({
    path: endpoints.admin.tags
  });
}

export function getAdminTag(tagId: string) {
  return apiRequest<AdminTagItem>({
    path: endpoints.admin.tag(tagId)
  });
}

export function createAdminTag(input: AdminTagUpsertInput) {
  return apiRequest<AdminTagItem>({
    path: endpoints.admin.tags,
    method: "POST",
    body: input
  });
}

export function updateAdminTag(tagId: string, input: Partial<AdminTagUpsertInput>) {
  return apiRequest<AdminTagItem>({
    path: endpoints.admin.tag(tagId),
    method: "PUT",
    body: input
  });
}

export function enableAdminTag(tagId: string) {
  return apiRequest<AdminTagItem>({
    path: endpoints.admin.enableTag(tagId),
    method: "POST"
  });
}

export function disableAdminTag(tagId: string) {
  return apiRequest<AdminTagItem>({
    path: endpoints.admin.disableTag(tagId),
    method: "POST"
  });
}

export function getAdminContents() {
  return apiRequest<AdminContentItem[]>({
    path: endpoints.admin.contents
  });
}

export function getAdminContent(contentId: string) {
  return apiRequest<AdminContentItem>({
    path: endpoints.admin.content(contentId)
  });
}

export function createAdminContent(input: AdminContentUpsertInput) {
  return apiRequest<AdminContentItem>({
    path: endpoints.admin.contents,
    method: "POST",
    body: input
  });
}

export function updateAdminContent(contentId: string, input: Partial<AdminContentUpsertInput>) {
  return apiRequest<AdminContentItem>({
    path: endpoints.admin.content(contentId),
    method: "PUT",
    body: input
  });
}

export function publishAdminContent(contentId: string) {
  return apiRequest<AdminContentItem>({
    path: endpoints.admin.publishContent(contentId),
    method: "POST"
  });
}

export function archiveAdminContent(contentId: string) {
  return apiRequest<AdminContentItem>({
    path: endpoints.admin.archiveContent(contentId),
    method: "POST"
  });
}

export function deleteAdminContent(contentId: string) {
  return apiRequest<AdminContentItem>({
    path: endpoints.admin.content(contentId),
    method: "DELETE"
  });
}


export function getAdminDocuments() {
  return apiRequest<AdminDocumentItem[]>({
    path: endpoints.admin.documents
  });
}

export function getAdminDocument(documentId: string) {
  return apiRequest<AdminDocumentItem>({
    path: endpoints.admin.document(documentId)
  });
}

export function createAdminDocument(input: AdminDocumentUpsertInput) {
  return apiRequest<AdminDocumentItem>({
    path: endpoints.admin.documents,
    method: "POST",
    body: input
  });
}

export function updateAdminDocument(documentId: string, input: Partial<AdminDocumentUpsertInput>) {
  return apiRequest<AdminDocumentItem>({
    path: endpoints.admin.document(documentId),
    method: "PUT",
    body: input
  });
}

export function publishAdminDocument(documentId: string) {
  return apiRequest<AdminDocumentItem>({
    path: endpoints.admin.publishDocument(documentId),
    method: "POST"
  });
}

export function archiveAdminDocument(documentId: string) {
  return apiRequest<AdminDocumentItem>({
    path: endpoints.admin.archiveDocument(documentId),
    method: "POST"
  });
}

export function deleteAdminDocument(documentId: string) {
  return apiRequest<AdminDocumentItem>({
    path: endpoints.admin.document(documentId),
    method: "DELETE"
  });
}

export function getAdminCourses() {
  return apiRequest<AdminCourseItem[]>({
    path: endpoints.admin.courses
  });
}

export function getAdminCourse(courseId: string) {
  return apiRequest<AdminCourseItem>({
    path: endpoints.admin.course(courseId)
  });
}

export function createAdminCourse(input: AdminCourseUpsertInput) {
  return apiRequest<AdminCourseItem>({
    path: endpoints.admin.courses,
    method: "POST",
    body: input
  });
}

export function updateAdminCourse(courseId: string, input: Partial<AdminCourseUpsertInput>) {
  return apiRequest<AdminCourseItem>({
    path: endpoints.admin.course(courseId),
    method: "PUT",
    body: input
  });
}

export function publishAdminCourse(courseId: string) {
  return apiRequest<AdminCourseItem>({
    path: endpoints.admin.publishCourse(courseId),
    method: "POST"
  });
}

export function archiveAdminCourse(courseId: string) {
  return apiRequest<AdminCourseItem>({
    path: endpoints.admin.archiveCourse(courseId),
    method: "POST"
  });
}

export function deleteAdminCourse(courseId: string) {
  return apiRequest<AdminCourseItem>({
    path: endpoints.admin.course(courseId),
    method: "DELETE"
  });
}

export function getAdminNewcomerTasks() {
  return apiRequest<AdminNewcomerTaskItem[]>({
    path: endpoints.admin.newcomerTasks
  });
}

export function getAdminNewcomerTask(taskId: string) {
  return apiRequest<AdminNewcomerTaskItem>({
    path: endpoints.admin.newcomerTask(taskId)
  });
}

export function createAdminNewcomerTask(input: AdminNewcomerTaskUpsertInput) {
  return apiRequest<AdminNewcomerTaskItem>({
    path: endpoints.admin.newcomerTasks,
    method: "POST",
    body: input
  });
}

export function updateAdminNewcomerTask(taskId: string, input: Partial<AdminNewcomerTaskUpsertInput>) {
  return apiRequest<AdminNewcomerTaskItem>({
    path: endpoints.admin.newcomerTask(taskId),
    method: "PUT",
    body: input
  });
}

export function enableAdminNewcomerTask(taskId: string) {
  return apiRequest<AdminNewcomerTaskItem>({
    path: endpoints.admin.enableNewcomerTask(taskId),
    method: "POST"
  });
}

export function disableAdminNewcomerTask(taskId: string) {
  return apiRequest<AdminNewcomerTaskItem>({
    path: endpoints.admin.disableNewcomerTask(taskId),
    method: "POST"
  });
}

export function getAdminUsers() {
  return apiRequest<AdminUserItem[]>({
    path: endpoints.admin.users
  });
}

export function getAdminUser(userId: string) {
  return apiRequest<AdminUserItem>({
    path: endpoints.admin.user(userId)
  });
}

export function createAdminUser(input: AdminUserUpsertInput) {
  return apiRequest<AdminUserItem>({
    path: endpoints.admin.users,
    method: "POST",
    body: input
  });
}

export function updateAdminUser(userId: string, input: Partial<AdminUserUpsertInput>) {
  return apiRequest<AdminUserItem>({
    path: endpoints.admin.user(userId),
    method: "PUT",
    body: input
  });
}

export function disableAdminUser(userId: string) {
  return apiRequest<AdminUserItem>({
    path: endpoints.admin.disableUser(userId),
    method: "POST"
  });
}

export function updateAdminUserRole(userId: string, input: AdminUserRoleInput) {
  return apiRequest<AdminUserItem>({
    path: endpoints.admin.userRole(userId),
    method: "POST",
    body: input
  });
}

export function getAdminRoles() {
  return apiRequest<Role[]>({
    path: endpoints.admin.roles
  });
}
