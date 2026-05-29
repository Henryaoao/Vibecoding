import { afterEach, describe, expect, it } from "@jest/globals";
import { getAdminDashboard, updateAdminPortalConfigColumn } from "../admin";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { completeCourse } from "../courses";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("admin dashboard API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("returns PRD 8.1 metrics derived from current mock state", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await expect(getAdminDashboard()).resolves.toMatchObject({
      contentCount: 3,
      pendingPublishCount: 3,
      readCount: 918,
      documentDownloadCount: 2,
      trainingCompletionRate: 0,
      recentActions: ["发布内容：端午节值班安排", "禁用用户：赵宁"]
    });
  });

  it("updates training completion rate after a user completes training", async () => {
    setAccessTokenProvider(() => "mock-token-user");
    await completeCourse("course_1003");

    setAccessTokenProvider(() => "mock-token-super-user");
    await expect(getAdminDashboard()).resolves.toMatchObject({
      trainingCompletionRate: 17
    });
  });

  it("shows the newest audit summary after a successful super_user portal config write", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    await updateAdminPortalConfigColumn({
      key: "documents",
      enabled: false,
      display_order: 6,
      display_count: 12
    });

    await expect(getAdminDashboard()).resolves.toMatchObject({
      recentActions: expect.arrayContaining(["更新首页栏目配置：文档中心"])
    });
  });
});
