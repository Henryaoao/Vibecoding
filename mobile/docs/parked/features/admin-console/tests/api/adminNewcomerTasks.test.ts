import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  createAdminNewcomerTask,
  disableAdminNewcomerTask,
  enableAdminNewcomerTask,
  getAdminNewcomerTask,
  getAdminNewcomerTasks,
  updateAdminNewcomerTask
} from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const draftPayload = {
  title: "完成移动端入职材料阅读",
  description: "阅读员工手册并确认信息安全要求。",
  sort_order: 15
};

describe("admin newcomer task API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin newcomer task endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminNewcomerTasks()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("supports super_user single-record create, detail, update, enable and disable", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminNewcomerTasks()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "admin_newcomer_task_1001", enabled: true, sort_order: 10 })])
    );

    const created = await createAdminNewcomerTask(draftPayload);
    expect(created).toMatchObject({
      id: expect.stringMatching(/^admin_newcomer_task_mock_/),
      enabled: false,
      title: draftPayload.title,
      description: draftPayload.description,
      sort_order: draftPayload.sort_order,
      deleted_at: null
    });

    await expect(getAdminNewcomerTask(created.id)).resolves.toMatchObject({
      id: created.id,
      title: draftPayload.title,
      enabled: false
    });

    await expect(updateAdminNewcomerTask(created.id, { title: "完成移动端入职材料阅读（更新）", sort_order: 20 })).resolves.toMatchObject({
      id: created.id,
      title: "完成移动端入职材料阅读（更新）",
      sort_order: 20
    });

    await expect(enableAdminNewcomerTask(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: true,
      enabled_at: expect.any(String),
      disabled_at: null
    });

    await expect(disableAdminNewcomerTask(created.id)).resolves.toMatchObject({
      id: created.id,
      enabled: false,
      disabled_at: expect.any(String)
    });
  });
});
