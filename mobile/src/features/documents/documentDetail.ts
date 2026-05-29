import type { DocumentItem } from "@/types/domain";

export function findDocumentById(documents: DocumentItem[] | undefined, documentId: string | undefined) {
  if (!documents || !documentId) {
    return null;
  }

  return documents.find((document) => document.id === documentId) ?? null;
}

export function canRequestPreview(document: DocumentItem | null) {
  return Boolean(document?.canPreview);
}
