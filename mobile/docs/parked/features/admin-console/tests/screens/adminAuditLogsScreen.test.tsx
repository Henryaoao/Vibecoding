import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminAuditLogsScreen from "../../../app/admin/audit-logs";
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

describe("Admin audit logs screen", () => {
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

  it("shows an audit log entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("查看审计日志"));
    expect(router.push).toHaveBeenCalledWith("/admin/audit-logs");
  });

  it("renders actor, action, resource, IP, User-Agent, and time for each audit log", async () => {
    renderWithQuery(<AdminAuditLogsScreen />);

    expect(await screen.findByText("审计日志")).toBeTruthy();
    expect(screen.getAllByText("陈思远").length).toBeGreaterThan(0);
    expect(screen.queryByText("批量删除")).toBeNull();
    expect(screen.queryByText("导出全部")).toBeNull();

    fireEvent.changeText(screen.getByPlaceholderText("搜索操作者、动作或资源 ID"), "林一鸣");
    fireEvent.changeText(screen.getByLabelText("动作过滤"), "disable");
    fireEvent.press(screen.getByText("应用筛选"));

    await waitFor(() => expect(screen.getByText("林一鸣")).toBeTruthy());
    expect(screen.queryByText("陈思远")).toBeNull();

    fireEvent.press(screen.getByText("林一鸣"));
    expect(await screen.findByText(/资源 ID：admin_user_1003/)).toBeTruthy();
    expect(screen.getByText(/IP：203\.0\.113\.11/)).toBeTruthy();
    expect(screen.queryByText(/password|token|JWT|DB|请求正文|文件内容/i)).toBeNull();
  });
});
