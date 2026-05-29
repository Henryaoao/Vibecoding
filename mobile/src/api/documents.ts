import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { DocumentDownload, DocumentItem, DocumentListQuery, DocumentPreviewUrl } from "@/types/domain";

export function listDocuments(query: DocumentListQuery = {}) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.category?.trim()) {
    params.set("category", query.category.trim());
  }

  if (query.tag?.trim()) {
    params.set("tag", query.tag.trim());
  }

  if (query.fileType?.trim()) {
    params.set("file_type", query.fileType.trim());
  }

  const search = params.toString();

  return apiRequest<DocumentItem[]>({
    path: search ? `${endpoints.portal.documents}?${search}` : endpoints.portal.documents
  });
}

export function getDocument(documentId: string) {
  return apiRequest<DocumentItem>({
    path: endpoints.portal.document(documentId)
  });
}

export function getDocumentPreviewUrl(documentId: string) {
  return apiRequest<DocumentPreviewUrl>({
    path: endpoints.portal.documentPreviewUrl(documentId),
    method: "POST"
  });
}

export function getDocumentDownload(documentId: string) {
  return apiRequest<DocumentDownload>({
    path: endpoints.portal.documentDownload(documentId)
  });
}
