import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  createAdminCategory,
  disableAdminCategory,
  enableAdminCategory,
  getAdminCategories,
  getAdminCategory,
  updateAdminCategory
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  name: "移动端分类",
  description: "用于移动端 Admin 单条分类管理测试。",
  sort_order: 15
};

describe("admin category API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin category endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminCategories()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("supports super_user single-record create, detail, update, enable and disable", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminCategories()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "admin_category_1001", enabled: true, sort_order: 10 })])
    );

    const created = await createAdminCategory(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^admin_category_mock_/),
      enabled: false,
      name: draftPayload.name,
      description: draftPayload.description,
      sort_order: draftPayload.sort_order,
      deleted_at: null
    });

    await expect(getAdminCategory(created.id)).resolves.toMatchObject({
      id: created.id,
      name: draftPayload.name,
      enabled: false
    });

    await expect(updateAdminCategory(created.id, { name: "移动端分类（更新）", sort_order: 20 })).resolves.toMatchObject({
      id: created.id,
      name: "移动端分类（更新）",
      sort_order: 20
    });

    await expect(enableAdminCategory(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: true,
      enabled_at: expect.any(String),
      disabled_at: null
    });

    await expect(disableAdminCategory(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: false,
      disabled_at: expect.any(String)
    });
  });
});
