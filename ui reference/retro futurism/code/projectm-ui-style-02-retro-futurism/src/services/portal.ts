import { apiGet } from './api';
import type { ContentPayload, HomePayload, SectionKey } from '../types/portal';

export function getHome(): Promise<HomePayload> {
  return apiGet<HomePayload>('/api/v1/home');
}

export function getContent(section: SectionKey): Promise<ContentPayload> {
  return apiGet<ContentPayload>(`/api/v1/content?section=${encodeURIComponent(section)}`);
}
