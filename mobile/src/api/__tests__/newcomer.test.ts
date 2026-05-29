import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  completeMyNewcomerTask,
  getMyNewcomerTask,
  getNewcomerContent,
  listMyNewcomerTasks,
  listNewcomerContent,
  toggleNewcomerContentFavorite
} from "../newcomer";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("newcomer API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists and searches only published newcomer content", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listNewcomerContent();

    expect(items.map((item) => item.id)).toEqual(["newcomer_content_1001", "newcomer_content_1002"]);
    expect(items[0]).toMatchObject({
      title: "入职第一周必读清单",
      category: "新人必读",
      favorite: false,
      publishedAt: "2026-05-27T09:30:00+08:00"
    });
    expect(items.some((item) => item.id.includes("draft") || item.id.includes("archived") || item.id.includes("deleted"))).toBe(false);

    await expect(listNewcomerContent({ search: "账号" })).resolves.toEqual([
      expect.objectContaining({ id: "newcomer_content_1001" })
    ]);
  });

  it("returns content detail and persists favorite toggles for this mock session only", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getNewcomerContent("newcomer_content_1001")).resolves.toMatchObject({
      id: "newcomer_content_1001",
      body: expect.stringContaining("账号安全"),
      favorite: false
    });

    await expect(toggleNewcomerContentFavorite("newcomer_content_1001", true)).resolves.toMatchObject({
      id: "newcomer_content_1001",
      favorite: true
    });
    await expect(listNewcomerContent()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "newcomer_content_1001", favorite: true })])
    );

    resetMockTransportState();
    await expect(getNewcomerContent("newcomer_content_1001")).resolves.toMatchObject({ favorite: false });
  });

  it("lists only enabled personal tasks sorted by sort_order and completes own tasks", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const tasks = await listMyNewcomerTasks();

    expect(tasks.map((task) => task.id)).toEqual(["admin_newcomer_task_1001", "admin_newcomer_task_1002"]);
    expect(tasks.map((task) => task.sort_order)).toEqual([10, 20]);
    expect(tasks.some((task) => task.id === "admin_newcomer_task_1003")).toBe(false);
    expect(tasks[0]).toMatchObject({ completed: false, completed_at: null });

    await expect(getMyNewcomerTask("admin_newcomer_task_1001")).resolves.toMatchObject({
      id: "admin_newcomer_task_1001",
      description: expect.stringContaining("身份证明"),
      enabled: true
    });

    await expect(completeMyNewcomerTask("admin_newcomer_task_1001")).resolves.toMatchObject({
      id: "admin_newcomer_task_1001",
      completed: true,
      completed_at: "2026-05-27T10:30:00+08:00"
    });
    await expect(listMyNewcomerTasks()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "admin_newcomer_task_1001", completed: true })])
    );
  });

  it("hides disabled tasks and hidden content from direct normal user access", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getMyNewcomerTask("admin_newcomer_task_1003")).rejects.toMatchObject({ status: 404 });
    await expect(completeMyNewcomerTask("admin_newcomer_task_1003")).rejects.toMatchObject({ status: 404 });
    await expect(getNewcomerContent("newcomer_content_draft_1003")).rejects.toMatchObject({ status: 404 });
  });
});
