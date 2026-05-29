import { apiGet, apiPost } from './api';
import type { ContentPayload, CurrentUser, HomePayload, SectionKey } from '../types/portal';

interface CurrentUserPayload {
  user: CurrentUser;
}

export function getHome(): Promise<HomePayload> {
  return apiGet<HomePayload>('/api/v1/home');
}

export function getContent(section: SectionKey): Promise<ContentPayload> {
  return apiGet<ContentPayload>(`/api/v1/content?section=${encodeURIComponent(section)}`);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const payload = await apiGet<CurrentUserPayload>('/api/v1/auth/me');
  return payload.user;
}

export async function logout(): Promise<void> {
  await apiPost<{ status: string }>('/api/v1/auth/logout');
}
