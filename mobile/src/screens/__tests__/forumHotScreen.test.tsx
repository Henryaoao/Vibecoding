import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import ForumHotScreen from "../../../app/modules/forum-hot";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import type { ApiRequest, ApiTransportResponse } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn()
  }
}));

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity }
    }
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper });
}

describe("ForumHotScreen", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("renders hot posts with required fields and hotness sorted order", async () => {
    renderWithQuery(<ForumHotScreen />);

    const first = await screen.findByText("每周讨论：AI 辅助需求评审经验");
    const second = screen.getByText("移动端门户模块建议集中帖");
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(screen.getByText("员工论坛热帖 · 4 条")).toBeTruthy();
    expect(screen.getAllByText("当前筛选：全部热帖 / 排序：热度优先")).toHaveLength(1);
    expect(screen.getByText("刘思琪 · 发布时间 2026-05-26T16:20:00+08:00")).toBeTruthy();
    expect(screen.getByText("最新回复 2026-05-27T12:05:00+08:00 · 浏览 530 · 评论 41 · 点赞 68 · 热度 789")).toBeTruthy();
    expect(screen.getAllByLabelText(/^(查看热帖|打开外部热帖) /).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/热度/).length).toBeGreaterThanOrEqual(3);
  });

  it("adds search filter sort summary empty copy and reset controls", async () => {
    renderWithQuery(<ForumHotScreen />);

    expect(await screen.findByText("每周讨论：AI 辅助需求评审经验")).toBeTruthy();
    expect(screen.getAllByText("当前筛选：全部热帖 / 排序：热度优先")).toHaveLength(1);
    expect(screen.getAllByLabelText("筛选站内详情热帖")).toHaveLength(1);
    expect(screen.getAllByLabelText("筛选外部链接热帖")).toHaveLength(1);
    expect(screen.getAllByLabelText("热帖按热度优先排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("热帖按最新回复排序")).toHaveLength(1);
    expect(screen.getAllByLabelText("重置热帖筛选和排序")).toHaveLength(1);

    fireEvent.press(screen.getByLabelText("筛选外部链接热帖"));
    expect(screen.getAllByText("当前筛选：外部论坛链接 / 排序：热度优先")).toHaveLength(1);
    expect(screen.getByText("财务共享中心报销答疑汇总")).toBeTruthy();
    expect(screen.queryByText("移动端门户模块建议集中帖")).toBeNull();

    fireEvent.press(screen.getByLabelText("热帖按最新回复排序"));
    expect(screen.getAllByText("当前筛选：外部论坛链接 / 排序：最新回复")).toHaveLength(1);

    fireEvent.changeText(screen.getByPlaceholderText("搜索标题、摘要或作者"), "不存在的热帖");
    expect(await screen.findByText("没有匹配的热帖")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("重置热帖筛选和排序"));
    expect(await screen.findByText("每周讨论：AI 辅助需求评审经验")).toBeTruthy();
    expect(screen.getAllByText("当前筛选：全部热帖 / 排序：热度优先")).toHaveLength(1);
  });

  it("opens internal detail routes and safe external links", async () => {
    renderWithQuery(<ForumHotScreen />);

    expect(await screen.findByText("移动端门户模块建议集中帖")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("查看热帖 移动端门户模块建议集中帖"));
    expect(router.push).toHaveBeenCalledWith("/forum-hot/forum_hot_1001");

    fireEvent.press(screen.getByLabelText("打开外部热帖 财务共享中心报销答疑汇总"));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith("https://forum.projectm.local/topics/weekly-finance-ops"));
  });



  it("rejects unsafe external forum URL schemes before asking the OS to open them", async () => {
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      const response = await mockTransport(request);
      if (request.path === "/api/v1/mobile/forum-hot" && Array.isArray(response.envelope.data)) {
        return {
          status: 200,
          envelope: {
            ...response.envelope,
            data: response.envelope.data.map((item) =>
              item.id === "forum_hot_1003" ? { ...item, externalUrl: "projectm://forum/unsafe" } : item
            ) as T
          }
        };
      }

      return response as ApiTransportResponse<T>;
    });

    renderWithQuery(<ForumHotScreen />);

    const unsafeLink = await screen.findByLabelText("打开外部热帖 财务共享中心报销答疑汇总");
    jest.clearAllMocks();

    fireEvent.press(unsafeLink);

    expect(await screen.findByText("外部链接暂不可用，请稍后在公司论坛中查看。")).toBeTruthy();
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it("shows a safe error when external link is unavailable", async () => {
    jest.mocked(Linking.canOpenURL).mockResolvedValue(false);
    renderWithQuery(<ForumHotScreen />);

    expect(await screen.findByText("财务共享中心报销答疑汇总")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("打开外部热帖 财务共享中心报销答疑汇总"));

    expect(await screen.findByText("外部链接暂不可用，请稍后在公司论坛中查看。" )).toBeTruthy();
  });
});
