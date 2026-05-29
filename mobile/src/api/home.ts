import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { HomeSummary } from "@/types/domain";

export function getHomeSummary() {
  return apiRequest<HomeSummary>({
    path: endpoints.portal.home
  });
}
