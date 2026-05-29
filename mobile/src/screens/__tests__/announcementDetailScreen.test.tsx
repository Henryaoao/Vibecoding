import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import AnnouncementDetailScreen from "../../../app/announcements/[id]";
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

describe("AnnouncementDetailScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "announcement_1001" });
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

  it("shows title summary body attachments department validity published time and read count", async () => {
    renderWithQuery(<AnnouncementDetailScreen />);

    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();
    expect(screen.getByText("行政部 · 办公通知")).toBeTruthy();
    expect(screen.getByText("置顶 · 重要")).toBeTruthy();
    expect(screen.getByText("有效期：2026-05-27 至 2026-06-10")).toBeTruthy();
    expect(
      screen.getByText("发布时间：2026-05-27T09:20:00+08:00 · 阅读 128"),
    ).toBeTruthy();
    expect(screen.getByText(/端午节期间办公区/)).toBeTruthy();
    expect(screen.getByText("端午节办公区开放安排.pdf · 156 KB")).toBeTruthy();
  });

  it("does not expose parked favorite controls", async () => {
    renderWithQuery(<AnnouncementDetailScreen />);

    expect(await screen.findByText("端午节办公区开放安排")).toBeTruthy();
    expect(screen.queryByText(/最近浏览|浏览历史|已读|阅读记录/)).toBeNull();
    expect(screen.queryByText(/加入收藏|已收藏|收藏状态/)).toBeNull();
  });

  it("shows not found for hidden draft or missing announcements", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "announcement_draft_1004" });

    renderWithQuery(<AnnouncementDetailScreen />);

    expect(await screen.findByText("公告不存在")).toBeTruthy();
  });
});
