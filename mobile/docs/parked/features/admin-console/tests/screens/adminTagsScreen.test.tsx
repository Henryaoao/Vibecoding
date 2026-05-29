import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminTagsScreen from "../../../app/admin/tags/index";
import AdminTagDetailScreen from "../../../app/admin/tags/[id]";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "admin_tag_1001" }));

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

describe("Admin tag management screens", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
    mockUseLocalSearchParams.mockReturnValue({ id: "admin_tag_1001" });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("shows a tag management entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("进入标签管理"));
    expect(router.push).toHaveBeenCalledWith("/admin/tags");
  });

  it("lists tag records and links to create/detail screens without batch controls", async () => {
    renderWithQuery(<AdminTagsScreen />);

    expect(await screen.findByText("标签管理")).toBeTruthy();
    expect(screen.getByText("移动端")).toBeTruthy();
    expect(screen.queryByText("批量启用")).toBeNull();
    expect(screen.queryByText("批量禁用")).toBeNull();
    expect(screen.queryByText("批量删除")).toBeNull();
    expect(screen.queryByText("软删除")).toBeNull();

    fireEvent.press(screen.getByText("新建标签"));
    expect(router.push).toHaveBeenCalledWith("/admin/tags/new");

    fireEvent.press(screen.getByText("移动端"));
    expect(router.push).toHaveBeenCalledWith("/admin/tags/admin_tag_1001");
  });

  it("creates a tag and supports enable and disable for one tag", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminTagDetailScreen />);

    expect(await screen.findByText("新建标签")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("名称"), "移动端标签");
    fireEvent.changeText(screen.getByPlaceholderText("说明"), "用于移动端 Admin 单条标签管理测试。");
    fireEvent.changeText(screen.getByLabelText("排序"), "15");
    fireEvent.press(screen.getByText("保存标签"));

    expect(await screen.findByText("标签已保存"));
    expect(screen.getByText("状态：disabled")).toBeTruthy();

    fireEvent.press(screen.getByText("启用"));
    await waitFor(() => expect(screen.getByText("状态：enabled")).toBeTruthy());

    fireEvent.press(screen.getByText("禁用"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
  });

  it("requires confirmation before disabling one existing 标签", async () => {
    renderWithQuery(<AdminTagDetailScreen />);

    expect(await screen.findByText("编辑标签")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("禁用"));
    expect(screen.getByText("确认禁用标签")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("取消"));
    expect(screen.queryByText("确认禁用标签")).toBeNull();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("禁用"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
  });

});
