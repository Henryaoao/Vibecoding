import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type {
  MeTrainingProgressItem,
  ProfilePreferenceUpdateInput,
  ProfileSummary
} from "@/types/domain";

export function getProfileSummary() {
  return apiRequest<ProfileSummary>({
    path: endpoints.me.profile
  });
}

export function updateProfilePreferences(preferences: ProfilePreferenceUpdateInput) {
  return apiRequest<ProfileSummary>({
    path: endpoints.me.profile,
    method: "PUT",
    body: { preferences }
  });
}

export function listMyTrainingProgress() {
  return apiRequest<MeTrainingProgressItem[]>({
    path: endpoints.me.trainingProgress
  });
}
