import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    push: jest.fn(),
    replace: jest.fn()
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

describe("Admin Dashboard screen", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("displays PRD 8.1 metric labels, recent operations, and Admin module entries", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();
    expect(screen.getByText("内容数量：3")).toBeTruthy();
    expect(screen.getByText("待发布数量：3")).toBeTruthy();
    expect(screen.getByText("阅读量：918")).toBeTruthy();
    expect(screen.getByText("文档下载量：2")).toBeTruthy();
    expect(screen.getByText("培训完成率：0%")).toBeTruthy();
    expect(screen.getByText("发布内容：端午节值班安排")).toBeTruthy();
    expect(screen.getByText("进入内容管理")).toBeTruthy();
    expect(screen.getByText("进入文档管理")).toBeTruthy();
    expect(screen.getByText("进入课程管理")).toBeTruthy();
  });
});
