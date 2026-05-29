import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminUsersScreen from "../../../app/admin/users/index";
import AdminUserDetailScreen from "../../../app/admin/users/[id]";
import { setAccessTokenProvider, setApiTransport, type ApiTransport } from "@/api/client";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "admin_user_1001" }));

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

describe("Admin user management screens", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-super-user");
    setApiTransport(mockTransport);
    resetMockTransportState();
    mockUseLocalSearchParams.mockReturnValue({ id: "admin_user_1001" });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("shows a user management entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("进入用户管理"));
    expect(router.push).toHaveBeenCalledWith("/admin/users");
  });

  it("lists user records and links to create/detail screens without batch controls", async () => {
    renderWithQuery(<AdminUsersScreen />);

    expect(await screen.findByText("用户管理")).toBeTruthy();
    expect(screen.getByText("林一鸣")).toBeTruthy();
    expect(screen.getAllByText(/角色：(user|super_user)/).length).toBeGreaterThan(0);
    expect(screen.queryByText("批量启用")).toBeNull();
    expect(screen.queryByText("批量禁用")).toBeNull();
    expect(screen.queryByText("批量删除")).toBeNull();

    fireEvent.press(screen.getByText("新建用户"));
    expect(router.push).toHaveBeenCalledWith("/admin/users/new");

    fireEvent.press(screen.getByText("林一鸣"));
    expect(router.push).toHaveBeenCalledWith("/admin/users/admin_user_1001");
  });

  it("creates one user, assigns exactly one allowed role, and disables that user", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "new" });
    renderWithQuery(<AdminUserDetailScreen />);

    expect(await screen.findByText("新建用户")).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("姓名"), "周明");
    fireEvent.changeText(screen.getByPlaceholderText("邮箱"), "zhou.ming@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("部门"), "移动研发部");
    fireEvent.press(screen.getByText("选择超级用户"));
    fireEvent.press(screen.getByText("保存用户"));

    expect(await screen.findByText("用户已保存")).toBeTruthy();
    expect(screen.getByText("角色：super_user")).toBeTruthy();

    fireEvent.press(screen.getByText("设为普通用户"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("角色：user")).toBeTruthy());

    fireEvent.press(screen.getByText("禁用用户"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
  });

  it("requires confirmation before changing an existing user role or disabling the user", async () => {
    renderWithQuery(<AdminUserDetailScreen />);

    expect(await screen.findByText("编辑用户")).toBeTruthy();
    expect(screen.getByText("角色：user")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("设为超级用户"));
    expect(screen.getByText("确认修改用户角色")).toBeTruthy();
    expect(screen.getByText("角色：user")).toBeTruthy();

    fireEvent.press(screen.getByText("取消"));
    expect(screen.queryByText("确认修改用户角色")).toBeNull();
    expect(screen.getByText("角色：user")).toBeTruthy();

    fireEvent.press(screen.getByText("设为超级用户"));
    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("角色：super_user")).toBeTruthy());

    fireEvent.press(screen.getByText("禁用用户"));
    expect(screen.getByText("确认禁用用户")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("确认执行"));
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
  });

  it("surfaces backend validation when the last enabled super_user role change is rejected", async () => {
    const validationMessage = "至少保留一个启用状态的 super_user";
    const rejectingLastSuperUserTransport: ApiTransport = async (request) => {
      if (request.path === "/api/v1/admin/users/admin_user_1002/roles" && request.method === "POST") {
        return {
          status: 400,
          envelope: {
            code: "VALIDATION_ERROR",
            message: validationMessage,
            data: undefined as never,
            request_id: "request-last-super-user-role"
          }
        };
      }

      return mockTransport(request);
    };

    mockUseLocalSearchParams.mockReturnValue({ id: "admin_user_1002" });
    setApiTransport(rejectingLastSuperUserTransport);
    renderWithQuery(<AdminUserDetailScreen />);

    expect(await screen.findByText("编辑用户")).toBeTruthy();
    expect(screen.getByText("角色：super_user")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("设为普通用户"));
    fireEvent.press(screen.getByText("确认执行"));

    expect(await screen.findByText(validationMessage)).toBeTruthy();
    expect(screen.getByText("角色：super_user")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();
    expect(screen.queryByText("角色已更新")).toBeNull();
  });

  it("surfaces backend validation when disabling the last enabled super_user is rejected", async () => {
    const validationMessage = "至少保留一个启用状态的 super_user";
    const rejectingLastSuperUserTransport: ApiTransport = async (request) => {
      if (request.path === "/api/v1/admin/users/admin_user_1002/disable" && request.method === "POST") {
        return {
          status: 400,
          envelope: {
            code: "VALIDATION_ERROR",
            message: validationMessage,
            data: undefined as never,
            request_id: "request-last-super-user-disable"
          }
        };
      }

      return mockTransport(request);
    };

    mockUseLocalSearchParams.mockReturnValue({ id: "admin_user_1002" });
    setApiTransport(rejectingLastSuperUserTransport);
    renderWithQuery(<AdminUserDetailScreen />);

    expect(await screen.findByText("编辑用户")).toBeTruthy();
    expect(screen.getByText("角色：super_user")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();

    fireEvent.press(screen.getByText("禁用用户"));
    fireEvent.press(screen.getByText("确认执行"));

    expect(await screen.findByText(validationMessage)).toBeTruthy();
    expect(screen.getByText("角色：super_user")).toBeTruthy();
    expect(screen.getByText("状态：enabled")).toBeTruthy();
    expect(screen.queryByText("用户已禁用")).toBeNull();
  });

});
