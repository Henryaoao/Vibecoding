import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { BriefDetail, BriefFavoriteInput, BriefItem, BriefListQuery } from "@/types/domain";

export function listBriefs(query: BriefListQuery = {}) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  const search = params.toString();

  return apiRequest<BriefItem[]>({
    path: search ? `${endpoints.portal.briefs}?${search}` : endpoints.portal.briefs
  });
}

export function getBrief(briefId: string) {
  return apiRequest<BriefDetail>({
    path: endpoints.portal.brief(briefId)
  });
}

export function toggleBriefFavorite(briefId: string, favorite: boolean) {
  return apiRequest<BriefDetail>({
    path: endpoints.portal.briefFavorite(briefId),
    method: "POST",
    body: { favorite } satisfies BriefFavoriteInput
  });
}
