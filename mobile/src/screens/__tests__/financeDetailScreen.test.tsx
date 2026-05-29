import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import FinanceDetailScreen from "../../../app/finance/[id]";
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

describe("FinanceDetailScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "finance_1001" });
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

  it("shows finance detail with body, source, date, tags, curator role, and disclaimer", async () => {
    renderWithQuery(<FinanceDetailScreen />);

    expect(await screen.findByText("财经早知道：宏观日历提醒")).toBeTruthy();
    expect(screen.getByText("ProjectM 财经内容组 · 2026-05-27")).toBeTruthy();
    expect(screen.getByText("财经早知道 / 财经日历")).toBeTruthy();
    expect(screen.getByText("发布确认：super_user 人工发布")).toBeTruthy();
    expect(screen.getByText(/本篇汇总公开发布/)).toBeTruthy();
    expect(screen.getByText(/不构成投资建议/)).toBeTruthy();
    expect(screen.queryByText(/买入|卖出|收益承诺|个股预测/)).toBeNull();
  });

  it("does not expose parked favorite controls", async () => {
    renderWithQuery(<FinanceDetailScreen />);

    expect(await screen.findByText("财经早知道：宏观日历提醒")).toBeTruthy();
    expect(screen.queryByText(/加入收藏|已收藏|收藏状态/)).toBeNull();
  });

  it("shows not found for missing finance items", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "missing_finance" });

    renderWithQuery(<FinanceDetailScreen />);

    expect(await screen.findByText("资讯不存在")).toBeTruthy();
  });
});
