export type SectionKey =
  | 'briefs'
  | 'announcements'
  | 'forum'
  | 'newcomer'
  | 'finance'
  | 'documents'
  | 'training';

export interface ContentItem {
  id: string;
  section: SectionKey;
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
  status: string;
  pinned: boolean;
  publishedAt: string;
  meta: string[];
}

export interface SectionSummary {
  section: SectionKey;
  label: string;
  count: number;
  items: ContentItem[];
}

export interface HomePayload {
  generatedAt: string;
  sections: SectionSummary[];
  pinned: ContentItem[];
  latest: ContentItem[];
}

export interface CurrentUser {
  userId: string;
  email: string;
  displayName: string;
  roleCode: 'user' | 'super_user';
  department: string;
  title: string;
  accountStatus: string;
}

export interface ContentPayload {
  section: SectionKey;
  label: string;
  items: ContentItem[];
}

export interface ApiEnvelope<T> {
  code: string;
  message: string;
  requestId: string;
  data: T;
}
