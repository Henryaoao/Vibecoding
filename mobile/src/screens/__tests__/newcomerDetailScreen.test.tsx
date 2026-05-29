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
import type { PropsWithChildren, ReactElement } from "react";
import NewcomerContentDetailScreen from "../../../app/newcomer/[id]";
import MyNewcomerTaskDetailScreen from "../../../app/me/newcomer-tasks/[id]";
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

describe("Newcomer detail screens", () => {
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

  it("shows newcomer content detail without parked favorite or read tracking controls", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "newcomer_content_1001" });

    renderWithQuery(<NewcomerContentDetailScreen />);

    expect(await screen.findByText("入职第一周必读清单")).toBeTruthy();
    expect(
      screen.getByText("新人必读 · 2026-05-27T09:30:00+08:00"),
    ).toBeTruthy();
    expect(screen.getByText(/账号安全/)).toBeTruthy();
    expect(screen.queryByText(/加入收藏|已收藏|收藏|最近浏览|浏览历史|已读|阅读记录/)).toBeNull();
  });

  it("shows my newcomer task detail and completes an enabled task", async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: "admin_newcomer_task_1002",
    });

    renderWithQuery(<MyNewcomerTaskDetailScreen />);

    expect(await screen.findByText("完成信息安全确认")).toBeTruthy();
    expect(screen.getByText("排序 20 · 未完成")).toBeTruthy();

    fireEvent.press(screen.getByText("标记完成"));
    expect(await screen.findByText("排序 20 · 已完成")).toBeTruthy();
  });

  it("shows not found for hidden newcomer content and disabled tasks", async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: "admin_newcomer_task_1003",
    });

    renderWithQuery(<MyNewcomerTaskDetailScreen />);

    expect(await screen.findByText("新人任务不存在")).toBeTruthy();
  });
});
