import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { FinanceInfoDetail, FinanceInfoItem, FinanceInfoListQuery, FinanceInfoFavoriteInput } from "@/types/domain";

export function listFinanceInfo(query: FinanceInfoListQuery = {}) {
  const params = new URLSearchParams();

  if (query.tag) {
    params.set("tag", query.tag);
  }

  const search = params.toString();

  return apiRequest<FinanceInfoItem[]>({
    path: search ? `${endpoints.portal.finance}?${search}` : endpoints.portal.finance
  });
}

export function getFinanceInfo(financeInfoId: string) {
  return apiRequest<FinanceInfoDetail>({
    path: endpoints.portal.financeInfo(financeInfoId)
  });
}

export function toggleFinanceFavorite(financeInfoId: string, favorite: boolean) {
  return apiRequest<FinanceInfoDetail>({
    path: endpoints.portal.financeFavorite(financeInfoId),
    method: "POST",
    body: { favorite } satisfies FinanceInfoFavoriteInput
  });
}
