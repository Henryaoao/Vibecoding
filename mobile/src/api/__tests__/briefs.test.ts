import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { getBrief, listBriefs, toggleBriefFavorite } from "../briefs";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("briefs API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists published brief summaries with title date updated time and 3-6 key points only", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listBriefs();

    expect(items.map((item) => item.id)).toEqual(["brief_20260526", "brief_20260525"]);
    expect(items[0]).toMatchObject({
      id: "brief_20260526",
      title: "今日公司简报：网络维护提醒",
      briefDate: "2026-05-26",
      updatedAt: "2026-05-26T17:45:00+08:00",
      favorite: false,
      isLatestFallback: true
    });
    expect(items[0].keyPoints.length).toBeGreaterThanOrEqual(3);
    expect(items[0].keyPoints.length).toBeLessThanOrEqual(6);
    expect(items.some((item) => item.id.includes("draft") || item.id.includes("archived") || item.id.includes("deleted"))).toBe(false);
  });

  it("searches title summary body source and department", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(listBriefs({ search: "新人训练营" })).resolves.toEqual([
      expect.objectContaining({ id: "brief_20260526" })
    ]);
    await expect(listBriefs({ search: "行政部" })).resolves.toEqual([
      expect.objectContaining({ id: "brief_20260525" })
    ]);
    await expect(listBriefs({ search: "信息平台组" })).resolves.toEqual([
      expect.objectContaining({ id: "brief_20260526" })
    ]);
  });

  it("returns detail body source published time department read count key points and fallback marker", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const detail = await getBrief("brief_20260526");

    expect(detail).toMatchObject({
      id: "brief_20260526",
      body: expect.stringContaining("办公区网络维护"),
      source: "ProjectM 信息平台组",
      publishedAt: "2026-05-26T08:30:00+08:00",
      department: "信息平台组",
      readCount: 186,
      briefDate: "2026-05-26",
      updatedAt: "2026-05-26T17:45:00+08:00",
      isLatestFallback: true
    });
    expect(detail.keyPoints).toHaveLength(3);
  });

  it("persists favorite toggles for the current mock session only", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(toggleBriefFavorite("brief_20260525", true)).resolves.toMatchObject({ id: "brief_20260525", favorite: true });
    await expect(getBrief("brief_20260525")).resolves.toMatchObject({ favorite: true });
    await expect(listBriefs()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "brief_20260525", favorite: true })])
    );

    resetMockTransportState();
    await expect(getBrief("brief_20260525")).resolves.toMatchObject({ favorite: false });
  });

  it("hides draft archived and soft-deleted briefs from normal module APIs", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getBrief("brief_draft_20260527")).rejects.toMatchObject({ status: 404 });
    await expect(getBrief("brief_archived_20260524")).rejects.toMatchObject({ status: 404 });
    await expect(getBrief("brief_deleted_20260523")).rejects.toMatchObject({ status: 404 });
  });
});
