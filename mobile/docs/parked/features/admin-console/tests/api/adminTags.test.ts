import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  createAdminTag,
  disableAdminTag,
  enableAdminTag,
  getAdminTags,
  getAdminTag,
  updateAdminTag
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  name: "移动端标签",
  description: "用于移动端 Admin 单条标签管理测试。",
  sort_order: 15
};

describe("admin tag API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin tag endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminTags()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("supports super_user single-record create, detail, update, enable and disable", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminTags()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "admin_tag_1001", enabled: true, sort_order: 10 })])
    );

    const created = await createAdminTag(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^admin_tag_mock_/),
      enabled: false,
      name: draftPayload.name,
      description: draftPayload.description,
      sort_order: draftPayload.sort_order,
      deleted_at: null
    });

    await expect(getAdminTag(created.id)).resolves.toMatchObject({
      id: created.id,
      name: draftPayload.name,
      enabled: false
    });

    await expect(updateAdminTag(created.id, { name: "移动端标签（更新）", sort_order: 20 })).resolves.toMatchObject({
      id: created.id,
      name: "移动端标签（更新）",
      sort_order: 20
    });

    await expect(enableAdminTag(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: true,
      enabled_at: expect.any(String),
      disabled_at: null
    });

    await expect(disableAdminTag(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: false,
      disabled_at: expect.any(String)
    });
  });
});
