import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { getAdminPortalConfig, updateAdminPortalConfigColumn } from "../admin";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("admin portal config API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("rejects normal user access to admin portal config endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getAdminPortalConfig()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN"
    });
  });

  it("lets super_user get seven columns and persist one column update", async () => {
    setAccessTokenProvider(() => "mock-token-super-user");

    const initial = await getAdminPortalConfig();
    expect(initial.columns).toHaveLength(7);
    expect(initial.columns.map((column) => column.key)).toEqual([
      "briefs",
      "announcements",
      "forum-hot",
      "newcomer",
      "finance",
      "documents",
      "training"
    ]);

    await expect(
      updateAdminPortalConfigColumn({
        key: "finance",
        enabled: false,
        display_order: 70,
        display_count: 2
      })
    ).resolves.toMatchObject({
      key: "finance",
      title: "财经轻资讯",
      enabled: false,
      display_order: 70,
      display_count: 2
    });

    const afterUpdate = await getAdminPortalConfig();
    expect(afterUpdate.columns.find((column) => column.key === "finance")).toMatchObject({
      key: "finance",
      enabled: false,
      display_order: 70,
      display_count: 2
    });
    expect(afterUpdate.columns.filter((column) => column.enabled)).toHaveLength(6);
  });
});
