import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import FinanceScreen from "../../../app/modules/finance";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe("FinanceScreen", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("renders curated finance cards with source, date, tags, and no-investment-advice signal", async () => {
    renderWithQuery(<FinanceScreen />);

    expect(await screen.findByText("财经早知道：宏观日历提醒")).toBeTruthy();
    expect(screen.getByText("财经轻资讯 · 3 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部资讯")).toBeTruthy();
    expect(
      screen.getByText("super_user 人工发布；不构成投资建议，不提供股票推荐或买卖建议。"),
    ).toBeTruthy();
    expect(screen.getByText("ProjectM 财经内容组 · 2026-05-27")).toBeTruthy();
    expect(screen.getByText("财经早知道 / 财经日历")).toBeTruthy();
    expect(screen.getAllByText("非投资建议").length).toBeGreaterThan(0);
    expect(screen.queryByText(/买入|卖出|收益承诺|个股预测|推荐股票/)).toBeNull();
  });

  it("filters by tag and opens detail", async () => {
    renderWithQuery(<FinanceScreen />);

    expect(
      await screen.findByText("指数概览：主要指数信息口径说明"),
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText("按反诈提醒筛选财经资讯"));

    expect(
      await screen.findByText("反诈提醒：陌生链接与荐股群风险"),
    ).toBeTruthy();
    expect(screen.getByText("财经轻资讯 · 1 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：标签：反诈提醒")).toBeTruthy();
    expect(screen.queryByText("指数概览：主要指数信息口径说明")).toBeNull();

    fireEvent.press(screen.getByLabelText("清除财经轻资讯筛选"));
    expect(
      await screen.findByText("指数概览：主要指数信息口径说明"),
    ).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("查看财经资讯 反诈提醒：陌生链接与荐股群风险"),
    );

    expect(router.push).toHaveBeenCalledWith("/finance/finance_1003");
  });

  it("adds search sort summary empty copy and reset controls", async () => {
    renderWithQuery(<FinanceScreen />);

    expect(await screen.findByText("财经早知道：宏观日历提醒")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部财经资讯 / 排序：最新优先")).toBeTruthy();
    expect(screen.getAllByLabelText("财经资讯按最新优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("财经资讯按来源名称排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("重置财经资讯筛选和排序")).toHaveLength(1);

    fireEvent.press(screen.getByLabelText("财经资讯按来源名称排序"));
    expect(screen.getByText("当前筛选：全部财经资讯 / 排序：来源名称")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("搜索标题、摘要、来源或标签"), "陌生链接");
    expect(await screen.findByText("反诈提醒：陌生链接与荐股群风险")).toBeTruthy();
    expect(screen.queryByText("财经早知道：宏观日历提醒")).toBeNull();

    fireEvent.changeText(screen.getByPlaceholderText("搜索标题、摘要、来源或标签"), "不存在的资讯");
    expect(await screen.findByText("没有匹配的财经资讯")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("重置财经资讯筛选和排序"));
    expect(await screen.findByText("财经早知道：宏观日历提醒")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部财经资讯 / 排序：最新优先")).toBeTruthy();
  });

  it("keeps parked favorites out of the active finance UI", async () => {
    renderWithQuery(<FinanceScreen />);

    expect(await screen.findByText("财经早知道：宏观日历提醒")).toBeTruthy();
    expect(screen.queryByLabelText(/收藏/)).toBeNull();
    expect(screen.queryByText(/收藏|已收藏/)).toBeNull();
  });
});
