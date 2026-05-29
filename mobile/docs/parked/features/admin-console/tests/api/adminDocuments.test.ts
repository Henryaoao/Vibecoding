import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  archiveAdminDocument,
  createAdminDocument,
  deleteAdminDocument,
  getAdminDocument,
  getAdminDocuments,
  publishAdminDocument,
  updateAdminDocument
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  title: "移动端报销材料模板",
  category: "财务流程",
  file_type: "pdf" as const,
  size_label: "420 KB"
};

describe("admin document API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin document endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminDocuments()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("rejects unsupported file types before creating admin document state", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");
    const before = await getAdminDocuments();

    await expect(
      createAdminDocument({
        ...draftPayload,
        file_type: "exe" as never,
        size_label: "420 KB"
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "仅支持 pdf、docx、xlsx、pptx 文件"
    });

    await expect(getAdminDocuments()).resolves.toHaveLength(before.length);
  });

  it("rejects files over 50 MB before updating admin document state", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(
      updateAdminDocument("admin_doc_1001", {
        file_type: "pdf",
        size_label: "50.1 MB"
      })
    ).rejects.toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "单个文件大小不能超过 50 MB"
    });

    await expect(getAdminDocument("admin_doc_1001")).resolves.toMatchObject({
      id: "admin_doc_1001",
      file_type: "pdf",
      size_label: "2.4 MB"
    });
  });

  it("accepts supported files at the 50 MB MVP limit", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(createAdminDocument({ ...draftPayload, size_label: "50 MB" })).resolves.toMatchObject({
      id: expect.stringMatching(/^admin_doc_mock_/),
      file_type: "pdf",
      size_label: "50 MB"
    });
  });

  it("supports super_user single-record create, detail, update, publish, archive and soft-delete", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminDocuments()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "admin_doc_1001", status: "published" })
      ])
    );

    const created = await createAdminDocument(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^admin_doc_mock_/),
      status: "draft",
      title: draftPayload.title,
      deleted_at: null
    });

    await expect(getAdminDocument(created.id)).resolves.toMatchObject({
      id: created.id,
      title: draftPayload.title,
      status: "draft"
    });

    await expect(updateAdminDocument(created.id, { title: "移动端报销材料模板（更新）" })).resolves.toMatchObject({
      id: created.id,
      title: "移动端报销材料模板（更新）"
    });

    await expect(publishAdminDocument(created.id)).resolves.toMatchObject({
      id: created.id,
      status: "published",
      published_at: expect.any(String)
    });

    await expect(archiveAdminDocument(created.id)).resolves.toMatchObject({
      id: created.id,
      status: "archived",
      archived_at: expect.any(String)
    });

    await expect(deleteAdminDocument(created.id)).resolves.toMatchObject({
      id: created.id,
      deleted_at: expect.any(String)
    });

    await expect(getAdminDocuments()).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id })])
    );
  });
});
