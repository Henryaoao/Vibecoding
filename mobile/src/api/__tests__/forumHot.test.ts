import { afterEach, describe, expect, it } from "@jest/globals";
import { endpoints } from "../endpoints";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { getForumHotPost, listForumHotPosts } from "../forumHot";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const prohibitedForumFinanceAdvicePattern = /买入|卖出|推荐股票|个股预测|收益承诺|稳赚|必涨/;

describe("forum hot API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists at least three published hot posts sorted by default hotness score", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listForumHotPosts();

    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.id)).toEqual(["forum_hot_1001", "forum_hot_1002", "forum_hot_1003", "forum_hot_1004"]);
    expect(items[0]).toMatchObject({
      title: "移动端门户模块建议集中帖",
      author: "张晨",
      viewCount: 640,
      commentCount: 36,
      likeCount: 52,
      hotnessScore: 852,
      linkType: "detail"
    });
    expect(items.every((item) => item.status === "published")).toBe(true);
  });

  it("returns detail fields for internal hot posts and hides drafts", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getForumHotPost("forum_hot_1001")).resolves.toMatchObject({
      id: "forum_hot_1001",
      body: expect.stringContaining("移动端只聚合展示"),
      publishedAt: "2026-05-27T08:45:00+08:00",
      latestReplyAt: "2026-05-27T11:20:00+08:00",
      commentCount: 36,
      likeCount: 52,
      viewCount: 640,
      hotnessScore: 852
    });
    await expect(getForumHotPost("forum_hot_draft_1005")).rejects.toMatchObject({ status: 404 });
  });

  it("keeps aggregation MVP read-only with no post comment private-message report or moderation endpoints", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(listForumHotPosts()).resolves.toEqual(expect.any(Array));
    await expect(getForumHotPost("forum_hot_1003")).resolves.toMatchObject({
      linkType: "external",
      externalUrl: "https://forum.projectm.local/topics/weekly-finance-ops"
    });

    await expect(
      mockTransport({
        path: endpoints.portal.forumHot,
        method: "POST",
        body: { title: "普通用户发帖" },
        headers: { Authorization: "Bearer mock-token-user" }
      })
    ).resolves.toMatchObject({ status: 404, envelope: { code: "NOT_FOUND" } });
    await expect(
      mockTransport({
        path: endpoints.portal.forumHotPost("forum_hot_1001"),
        method: "PATCH",
        body: { title: "普通用户维护热帖" },
        headers: { Authorization: "Bearer mock-token-user" }
      })
    ).resolves.toMatchObject({ status: 404, envelope: { code: "NOT_FOUND" } });
    await expect(
      mockTransport({
        path: `${endpoints.portal.forumHotPost("forum_hot_1001")}/comments`,
        method: "POST",
        body: { body: "评论" },
        headers: { Authorization: "Bearer mock-token-user" }
      })
    ).resolves.toMatchObject({ status: 404, envelope: { code: "NOT_FOUND" } });
  });

  it("keeps finance-adjacent forum hot content informational and non-advisory", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listForumHotPosts();
    const financeRelated = items.find((item) => item.id === "forum_hot_1003");

    expect(financeRelated).toMatchObject({ title: "财务共享中心报销答疑汇总" });
    expect(JSON.stringify(financeRelated)).not.toMatch(prohibitedForumFinanceAdvicePattern);
    await expect(getForumHotPost("forum_hot_1003")).resolves.toEqual(
      expect.not.objectContaining({ body: expect.stringMatching(prohibitedForumFinanceAdvicePattern) })
    );
  });
});
