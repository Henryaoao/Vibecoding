import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import ForumHotDetailScreen from "../../../app/forum-hot/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams()
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

describe("ForumHotDetailScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "forum_hot_1001" });
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

  it("renders internal forum hot detail without write controls", async () => {
    renderWithQuery(<ForumHotDetailScreen />);

    expect(await screen.findByText("移动端门户模块建议集中帖")).toBeTruthy();
    expect(screen.getByText("张晨 · 发布时间 2026-05-27T08:45:00+08:00")).toBeTruthy();
    expect(screen.getByText("最新回复 2026-05-27T11:20:00+08:00 · 浏览 640 · 评论 36 · 点赞 52 · 热度 852")).toBeTruthy();
    expect(screen.getByText(/移动端只聚合展示/)).toBeTruthy();
    expect(screen.queryByLabelText(/发帖|发表评论|私信|举报|维护|管理/)).toBeNull();
  });

  it("hides unpublished forum hot posts from ordinary users", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "forum_hot_draft_1005" });

    renderWithQuery(<ForumHotDetailScreen />);

    expect(await screen.findByText("热帖不存在")).toBeTruthy();
  });
});
