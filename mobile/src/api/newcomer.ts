import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type {
  MyNewcomerTaskItem,
  NewcomerContentDetail,
  NewcomerContentFavoriteInput,
  NewcomerContentItem,
  NewcomerContentListQuery
} from "@/types/domain";

export function listNewcomerContent(query: NewcomerContentListQuery = {}) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const search = params.toString();

  return apiRequest<NewcomerContentItem[]>({
    path: search ? `${endpoints.portal.newcomerContent}?${search}` : endpoints.portal.newcomerContent
  });
}

export function getNewcomerContent(contentId: string) {
  return apiRequest<NewcomerContentDetail>({
    path: endpoints.portal.newcomerContentDetail(contentId)
  });
}

export function toggleNewcomerContentFavorite(contentId: string, favorite: boolean) {
  return apiRequest<NewcomerContentDetail>({
    path: endpoints.portal.newcomerContentFavorite(contentId),
    method: "POST",
    body: { favorite } satisfies NewcomerContentFavoriteInput
  });
}

export function listMyNewcomerTasks() {
  return apiRequest<MyNewcomerTaskItem[]>({
    path: endpoints.portal.myNewcomerTasks
  });
}

export function getMyNewcomerTask(taskId: string) {
  return apiRequest<MyNewcomerTaskItem>({
    path: endpoints.portal.myNewcomerTask(taskId)
  });
}

export function completeMyNewcomerTask(taskId: string) {
  return apiRequest<MyNewcomerTaskItem>({
    path: endpoints.portal.completeMyNewcomerTask(taskId),
    method: "POST"
  });
}
