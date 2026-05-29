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
import BriefsScreen from "../../../app/modules/briefs";
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

describe("BriefsScreen", () => {
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

  it("renders published brief cards with fallback marker, updated time, and key points", async () => {
    renderWithQuery(<BriefsScreen />);

    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();
    expect(screen.getByText("今日公司简报 · 2 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部简报")).toBeTruthy();
    expect(screen.getByText("展示最近已发布简报：2026-05-26")).toBeTruthy();
    expect(
      screen.getByText("简报日期 2026-05-26 · 更新 2026-05-26T17:45:00+08:00"),
    ).toBeTruthy();
    expect(
      screen.getByText("办公区 18:00 后进行网络维护，请提前保存在线文档。"),
    ).toBeTruthy();
    expect(screen.queryByText(/草稿|归档|软删除/)).toBeNull();
  });

  it("searches brief content and opens detail", async () => {
    renderWithQuery(<BriefsScreen />);

    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();

    fireEvent.changeText(
      screen.getByPlaceholderText("搜索标题、摘要、正文、来源或部门"),
      "行政部",
    );

    expect(await screen.findByText("公司简报：行政服务提醒")).toBeTruthy();
    expect(screen.getByText("今日公司简报 · 1 条")).toBeTruthy();
    expect(screen.getByText("当前筛选：关键词：行政部")).toBeTruthy();
    expect(screen.queryByText("今日公司简报：网络维护提醒")).toBeNull();

    fireEvent.press(screen.getByLabelText("清除今日公司简报筛选"));
    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("查看简报 公司简报：行政服务提醒"));
    expect(router.push).toHaveBeenCalledWith("/briefs/brief_20260525");
  });

  it("unifies sort summary empty copy and reset controls", async () => {
    renderWithQuery(<BriefsScreen />);

    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部简报 / 排序：最新优先")).toBeTruthy();
    expect(screen.getAllByLabelText("简报按最新优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("简报按最早优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("重置简报筛选和排序")).toHaveLength(1);

    fireEvent.press(screen.getByLabelText("简报按最早优先排序"));
    expect(screen.getByText("当前筛选：全部简报 / 排序：最早优先")).toBeTruthy();

    fireEvent.changeText(
      screen.getByPlaceholderText("搜索标题、摘要、正文、来源或部门"),
      "不存在的简报",
    );
    expect(await screen.findByText("没有匹配的简报")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("重置简报筛选和排序"));
    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();
    expect(screen.getByText("当前筛选：全部简报 / 排序：最新优先")).toBeTruthy();
  });

  it("does not expose parked favorites or browsing history controls", async () => {
    renderWithQuery(<BriefsScreen />);

    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();
    expect(screen.queryByLabelText(/收藏/)).toBeNull();
    expect(screen.queryByText(/收藏|已收藏|最近浏览|浏览历史|已读|阅读记录/)).toBeNull();
  });
});
