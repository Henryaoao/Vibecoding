import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import BriefDetailScreen from "../../../app/briefs/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    replace: jest.fn(),
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

describe("BriefDetailScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "brief_20260526" });
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

  it("shows detail body source published time department read count key points and fallback date", async () => {
    renderWithQuery(<BriefDetailScreen />);

    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();
    expect(screen.getByText("展示最近已发布简报：2026-05-26")).toBeTruthy();
    expect(screen.getByText("信息平台组 · ProjectM 信息平台组")).toBeTruthy();
    expect(
      screen.getByText("发布时间：2026-05-26T08:30:00+08:00 · 阅读 186"),
    ).toBeTruthy();
    expect(screen.getByText("更新：2026-05-26T17:45:00+08:00")).toBeTruthy();
    expect(screen.getByText(/办公区网络维护安排在 18:00 后/)).toBeTruthy();
    expect(
      screen.getByText("新人训练营第 3 期报名截止到本周五。"),
    ).toBeTruthy();
  });

  it("does not expose parked favorite controls", async () => {
    renderWithQuery(<BriefDetailScreen />);

    expect(await screen.findByText("今日公司简报：网络维护提醒")).toBeTruthy();
    expect(screen.queryByText(/最近浏览|浏览历史|已读|阅读记录/)).toBeNull();
    expect(screen.queryByText(/加入收藏|已收藏|收藏状态/)).toBeNull();
  });

  it("shows not found for hidden draft or missing briefs", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "brief_draft_20260527" });

    renderWithQuery(<BriefDetailScreen />);

    expect(await screen.findByText("简报不存在")).toBeTruthy();
  });
});
