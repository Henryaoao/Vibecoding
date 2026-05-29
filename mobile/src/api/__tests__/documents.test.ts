import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import type { ApiRequest, ApiTransportResponse } from "../client";
import { getDocument, getDocumentDownload, getDocumentPreviewUrl, listDocuments } from "../documents";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("document API", () => {
  afterEach(() => {
    resetMockTransportState();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
  });


  it("builds encoded query filters for document lists", async () => {
    const requests: ApiRequest[] = [];
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      requests.push(request);

      return {
        status: 200,
        envelope: {
          code: "OK",
          message: "ok",
          data: [] as T,
          request_id: "req_document_filters"
        }
      };
    });

    await listDocuments({ search: "员工 手册", category: "制度规范", tag: "入职必读", fileType: "pdf" });

    expect(requests).toEqual([
      expect.objectContaining({
        path: "/api/v1/mobile/documents?search=%E5%91%98%E5%B7%A5+%E6%89%8B%E5%86%8C&category=%E5%88%B6%E5%BA%A6%E8%A7%84%E8%8C%83&tag=%E5%85%A5%E8%81%8C%E5%BF%85%E8%AF%BB&file_type=pdf",
        method: "GET",
        headers: { Authorization: "Bearer mock-token-user" }
      })
    ]);
  });

  it("filters normal user document lists without disclosing unauthorized document metadata", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(listDocuments({ search: "手册", category: "制度规范", tag: "入职必读", fileType: "pdf" })).resolves.toEqual([
      expect.objectContaining({
        id: "doc_1001",
        title: "员工手册 2026",
        category: "制度规范",
        fileType: "pdf",
        tags: expect.arrayContaining(["入职必读"])
      })
    ]);

    const documents = await listDocuments();
    expect(documents).toEqual(expect.not.arrayContaining([expect.objectContaining({ id: "doc_1003" })]));
    expect(documents).toEqual(expect.not.arrayContaining([expect.objectContaining({ title: "信息安全入门指南" })]));

    await expect(listDocuments({ tag: "安全合规" })).resolves.toEqual([]);
    await expect(listDocuments({ category: "安全合规" })).resolves.toEqual([]);
    await expect(listDocuments({ fileType: "docx" })).resolves.toEqual([]);
    await expect(listDocuments({ search: "信息安全" })).resolves.toEqual([]);
  });

  it("allows super users to list restricted documents for admin verification", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(listDocuments({ tag: "安全合规" })).resolves.toEqual([
      expect.objectContaining({ id: "doc_1003", tags: expect.arrayContaining(["安全合规"]) })
    ]);
  });

  it("returns authorized document details to normal users", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getDocument("doc_1001")).resolves.toMatchObject({
      id: "doc_1001",
      title: "员工手册 2026",
      category: "制度规范",
      fileType: "pdf",
      canPreview: true
    });
  });

  it("does not disclose unauthorized document detail metadata to normal users", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getDocument("doc_1003")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND"
    });
  });

  it("allows super users to open restricted document details for admin verification", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getDocument("doc_1003")).resolves.toMatchObject({
      id: "doc_1003",
      title: "信息安全入门指南",
      tags: expect.arrayContaining(["安全合规"])
    });
  });
  it("requests a short-lived preview URL for authorized users", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getDocumentPreviewUrl("doc_1001")).resolves.toMatchObject({
      document_id: "doc_1001",
      preview_url: expect.stringContaining("/previews/doc_1001"),
      file_name: "employee-handbook-2026.pdf",
      mime_type: "application/pdf",
      file_type: "pdf"
    });
  });

  it("requests a typed short-lived download URL for authorized users", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getDocumentDownload("doc_1001")).resolves.toEqual({
      document_id: "doc_1001",
      download_url: expect.stringContaining("/downloads/doc_1001"),
      file_name: "employee-handbook-2026.pdf",
      mime_type: "application/pdf",
      expires_at: "2026-05-27T10:15:00+08:00"
    });
  });

  it("uses the typed GET download contract with encoded document ids", async () => {
    const requests: ApiRequest[] = [];
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      requests.push(request);

      return {
        status: 200,
        envelope: {
          code: "OK",
          message: "ok",
          data: {
            document_id: "doc 1001",
            download_url: "https://mock.projectm.local/downloads/doc%201001?expires=900",
            file_name: "employee-handbook-2026.pdf",
            mime_type: "application/pdf",
            expires_at: "2026-05-27T10:15:00+08:00"
          } as T,
          request_id: "req_download_contract"
        }
      };
    });

    await expect(getDocumentDownload("doc 1001")).resolves.toMatchObject({
      document_id: "doc 1001",
      download_url: expect.stringContaining("/downloads/doc%201001")
    });

    expect(requests).toEqual([
      expect.objectContaining({
        path: "/api/v1/documents/doc%201001/download",
        method: "GET",
        headers: { Authorization: "Bearer mock-token-user" }
      })
    ]);
  });

  it("does not return preview or download metadata without a valid session", async () => {
    await expect(getDocumentPreviewUrl("doc_1001")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED"
    });
    await expect(getDocumentDownload("doc_1001")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED"
    });
  });

  it("does not return preview or download metadata for unauthorized documents", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getDocumentPreviewUrl("doc_1003")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND"
    });
    await expect(getDocumentDownload("doc_1003")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND"
    });
  });
});
