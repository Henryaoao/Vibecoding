import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type {
  AnnouncementDetail,
  AnnouncementFavoriteInput,
  AnnouncementItem,
  AnnouncementListQuery
} from "@/types/domain";

export function listAnnouncements(query: AnnouncementListQuery = {}) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.category?.trim()) {
    params.set("category", query.category.trim());
  }

  const search = params.toString();

  return apiRequest<AnnouncementItem[]>({
    path: search ? `${endpoints.portal.announcements}?${search}` : endpoints.portal.announcements
  });
}

export function getAnnouncement(announcementId: string) {
  return apiRequest<AnnouncementDetail>({
    path: endpoints.portal.announcement(announcementId)
  });
}

export function toggleAnnouncementFavorite(announcementId: string, favorite: boolean) {
  return apiRequest<AnnouncementDetail>({
    path: endpoints.portal.announcementFavorite(announcementId),
    method: "POST",
    body: { favorite } satisfies AnnouncementFavoriteInput
  });
}
