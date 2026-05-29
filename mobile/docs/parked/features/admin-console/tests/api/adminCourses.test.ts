import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  archiveAdminCourse,
  createAdminCourse,
  deleteAdminCourse,
  getAdminCourse,
  getAdminCourses,
  publishAdminCourse,
  updateAdminCourse
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  title: "移动端信息安全必修课",
  summary: "账号、设备和文档访问安全基础。",
  required: true,
  material_document_id: "admin_doc_1001",
  external_url: "https://learn.projectm.local/security"
};

describe("admin course API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin course endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminCourses()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("supports super_user single-record create, detail, update, publish, archive and soft-delete", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminCourses()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "admin_course_1001", status: "published", required: true })])
    );

    const created = await createAdminCourse(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^admin_course_mock_/),
      status: "draft",
      title: draftPayload.title,
      required: true,
      material_document_id: "admin_doc_1001",
      external_url: draftPayload.external_url,
      deleted_at: null
    });

    await expect(getAdminCourse(created.id)).resolves.toMatchObject({
      id: created.id,
      title: draftPayload.title,
      status: "draft"
    });

    await expect(updateAdminCourse(created.id, { title: "移动端信息安全必修课（更新）", required: false })).resolves.toMatchObject({
      id: created.id,
      title: "移动端信息安全必修课（更新）",
      required: false
    });

    await expect(publishAdminCourse(created.id)).resolves.toMatchObject({
      id: created.id,
      status: "published",
      published_at: expect.any(String)
    });

    await expect(archiveAdminCourse(created.id)).resolves.toMatchObject({
      id: created.id,
      status: "archived",
      archived_at: expect.any(String)
    });

    await expect(deleteAdminCourse(created.id)).resolves.toMatchObject({
      id: created.id,
      deleted_at: expect.any(String)
    });

    await expect(getAdminCourses()).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id })])
    );
  });
});
