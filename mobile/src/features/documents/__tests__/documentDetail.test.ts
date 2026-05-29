import { describe, expect, it } from "@jest/globals";
import { mockDocuments } from "@/api/mock/data";
import { canRequestPreview, findDocumentById } from "../documentDetail";

describe("document detail helpers", () => {
  it("finds a document by id", () => {
    expect(findDocumentById(mockDocuments, "doc_1001")).toMatchObject({
      id: "doc_1001",
      title: "员工手册 2026"
    });
  });

  it("returns null when the document id does not exist", () => {
    expect(findDocumentById(mockDocuments, "missing_doc")).toBeNull();
  });

  it("allows preview requests only for documents with preview permission", () => {
    expect(canRequestPreview(findDocumentById(mockDocuments, "doc_1001"))).toBe(true);
    expect(canRequestPreview(findDocumentById(mockDocuments, "doc_1003"))).toBe(false);
    expect(canRequestPreview(null)).toBe(false);
  });
});
