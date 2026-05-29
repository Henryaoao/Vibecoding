import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { getAnnouncement, listAnnouncements, toggleAnnouncementFavorite } from "../announcements";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("announcements API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists published announcements with pinned important metadata and hides drafts", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listAnnouncements();

    expect(items.map((item) => item.id)).toEqual(["announcement_1001", "announcement_1002", "announcement_1003"]);
    expect(items[0]).toMatchObject({
      title: "端午节办公区开放安排",
      category: "办公通知",
      pinned: true,
      important: true,
      department: "行政部",
      readCount: 128,
      favorite: false
    });
    expect(items.some((item) => item.id === "announcement_draft_1004")).toBe(false);
  });

  it("searches title summary body and department while keeping expired announcements queryable", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(listAnnouncements({ search: "福利" })).resolves.toEqual([
      expect.objectContaining({ id: "announcement_1002", category: "福利通知" })
    ]);
    await expect(listAnnouncements({ search: "财务共享中心" })).resolves.toEqual([
      expect.objectContaining({ id: "announcement_1003", expired: true })
    ]);
  });

  it("filters by category without excluding expired published announcements", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listAnnouncements({ category: "制度提醒" });

    expect(items).toEqual([expect.objectContaining({ id: "announcement_1003", expired: true })]);
  });

  it("returns detail fields including body attachments valid period published time and read count display", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const detail = await getAnnouncement("announcement_1001");

    expect(detail).toMatchObject({
      id: "announcement_1001",
      body: expect.stringContaining("端午节期间"),
      attachments: [expect.objectContaining({ fileName: "端午节办公区开放安排.pdf" })],
      validFrom: "2026-05-27",
      validUntil: "2026-06-10",
      publishedAt: "2026-05-27T09:20:00+08:00",
      readCount: 128
    });
  });

  it("persists favorite toggles for the current mock session only", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(toggleAnnouncementFavorite("announcement_1002", true)).resolves.toMatchObject({
      id: "announcement_1002",
      favorite: true
    });
    await expect(getAnnouncement("announcement_1002")).resolves.toMatchObject({ favorite: true });
    await expect(listAnnouncements()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "announcement_1002", favorite: true })])
    );

    resetMockTransportState();
    await expect(getAnnouncement("announcement_1002")).resolves.toMatchObject({ favorite: false });
  });
});
