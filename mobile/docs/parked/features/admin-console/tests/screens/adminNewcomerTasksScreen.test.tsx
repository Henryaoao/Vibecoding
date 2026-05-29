import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminNewcomerTasksScreen from "../../../app/admin/newcomer-tasks/index";
import AdminNewcomerTaskDetailScreen from "../../../app/admin/newcomer-tasks/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "admin_newcomer_task_1001" }));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    push: jest.fn(),
    replace: jest.fn()
  },
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

describe("Admin newcomer task management screens", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
    mockUseLocalSearchParams.mockReturnValue({ id: "admin_newcomer_task_1001" });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("shows a newcomer task management entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("进入新人任务管理"));
    expect(router.push).toHaveBeenCalledWith("/admin/newcomer-tasks");
  });

  it("lists newcomer task records and links to create/detail screens without batch controls", async () => {
    renderWithQuery(<AdminNewcomerTasksScreen />);

    expect(await screen.findByText("新人任务管理")).toBeTruthy();
    expect(screen.getByText("提交入职资料")).toBeTruthy();
    expect(screen.queryByText("批量启用")).toBeNull();
    expect(screen.queryByText("批量禁用")).toBeNull();
    expect(screen.queryByText("批量删除")).toBeNull();

    fireEvent.press(screen.getByText("新建新人任务"));
    expect(router.push).toHaveBeenCalledWith("/admin/newcomer-tasks/new");

    fireEvent.press(screen.getByText("提交入职资料"));
    expect(router.push).toHaveBeenCalledWith("/admin/newcomer-tasks/admin_newcomer_task_1001");
  });

  it("creates a task and supports enable and disable for one newcomer task", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminNewcomerTaskDetailScreen />);

    expect(await screen.findByText("新建新人任务")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("标题"), "完成移动端入职材料阅读");
    fireEvent.changeText(screen.getByPlaceholderText("说明"), "阅读员工手册并确认信息安全要求。");
    fireEvent.changeText(screen.getByLabelText("排序"), "15");
    fireEvent.press(screen.getByText("保存任务"));

    expect(await screen.findByText("新人任务已保存"));
    expect(screen.getByText("状态：disabled")).toBeTruthy();

    fireEvent.press(screen.getByText("启用"));
    await waitFor(() => expect(screen.getByText("状态：enabled")).toBeTruthy());

    fireEvent.press(screen.getByText("禁用"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
  });

  it("requires confirmation before disabling one existing 新人任务", async () => {
    renderWithQuery(<AdminNewcomerTaskDetailScreen />);

    expect(await screen.findByText("编辑新人任务")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("禁用"));
    expect(screen.getByText("确认禁用新人任务")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("取消"));
    expect(screen.queryByText("确认禁用新人任务")).toBeNull();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("禁用"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
  });

});
