import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import { getFinanceInfo, listFinanceInfo, toggleFinanceFavorite } from "../finance";
import { mockTransport, resetMockTransportState } from "../mock/transport";

const prohibitedAdvicePattern = /买入|卖出|推荐股票|个股预测|收益承诺|稳赚|必涨/;

describe("finance info API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("lists super_user curated finance items with required compliance fields", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(listFinanceInfo()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "finance_1001",
          title: "财经早知道：宏观日历提醒",
          source: "ProjectM 财经内容组",
          publishedAt: "2026-05-27",
          curatedByRole: "super_user",
          disclaimer: expect.stringContaining("不构成投资建议"),
          tags: expect.arrayContaining(["财经早知道"]),
          favorite: false
        })
      ])
    );
  });

  it("filters finance items by tag on the mock endpoint", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const items = await listFinanceInfo({ tag: "反诈提醒" });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "finance_1003", tags: expect.arrayContaining(["反诈提醒"]) });
  });

  it("returns detail body and keeps content inside the compliance boundary", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const detail = await getFinanceInfo("finance_1001");

    expect(detail).toMatchObject({
      id: "finance_1001",
      body: expect.stringContaining("内部资讯阅读"),
      disclaimer: expect.stringContaining("不构成投资建议"),
      curatedByRole: "super_user"
    });
    expect(`${detail.title} ${detail.summary} ${detail.body} ${detail.disclaimer}`).not.toMatch(prohibitedAdvicePattern);
  });

  it("persists favorite toggles for the current mock session only", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(toggleFinanceFavorite("finance_1002", true)).resolves.toMatchObject({ id: "finance_1002", favorite: true });
    await expect(getFinanceInfo("finance_1002")).resolves.toMatchObject({ favorite: true });
    await expect(listFinanceInfo()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "finance_1002", favorite: true })])
    );

    resetMockTransportState();
    await expect(getFinanceInfo("finance_1002")).resolves.toMatchObject({ favorite: false });
  });
});
