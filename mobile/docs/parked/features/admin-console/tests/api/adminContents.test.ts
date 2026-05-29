import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  archiveAdminContent,
  createAdminContent,
  deleteAdminContent,
  getAdminContent,
  getAdminContents,
  publishAdminContent,
  updateAdminContent
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  type: "announcement" as const,
  title: "端午节值班安排",
  summary: "值班表与办公区开放时间",
  body: "端午节期间办公区开放时间为 09:00-18:00。",
  category: "公司公告"
};

describe("admin content API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin content endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminContents()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("supports super_user single-record create, detail, update, publish, archive and soft-delete", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminContents()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "content_1001", status: "published" })
      ])
    );

    const created = await createAdminContent(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^content_mock_/),
      status: "draft",
      title: draftPayload.title,
      deleted_at: null
    });

    await expect(getAdminContent(created.id)).resolves.toMatchObject({
      id: created.id,
      title: draftPayload.title,
      status: "draft"
    });

    await expect(updateAdminContent(created.id, { title: "端午节值班安排（更新）" })).resolves.toMatchObject({
      id: created.id,
      title: "端午节值班安排（更新）"
    });

    await expect(publishAdminContent(created.id)).resolves.toMatchObject({
      id: created.id,
      status: "published",
      published_at: expect.any(String)
    });

    await expect(archiveAdminContent(created.id)).resolves.toMatchObject({
      id: created.id,
      status: "archived",
      archived_at: expect.any(String)
    });

    await expect(deleteAdminContent(created.id)).resolves.toMatchObject({
      id: created.id,
      deleted_at: expect.any(String)
    });

    await expect(getAdminContents()).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id })])
    );
  });
});
