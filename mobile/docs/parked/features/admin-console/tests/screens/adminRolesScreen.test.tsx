import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminRolesScreen from "../../../app/admin/roles";
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

describe("Admin role permissions screen", () => {
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

  it("shows a role permissions entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("角色权限"));
    expect(router.push).toHaveBeenCalledWith("/admin/roles");
  });

  it("lists exactly user and super_user boundaries without mutation controls or legacy roles", async () => {
    renderWithQuery(<AdminRolesScreen />);
    const inactiveAdminRolePattern = new RegExp(["content", "department", "system"].map((scope) => `${scope}_admin`).join("|"));
    const mutationControlPattern = new RegExp([
      ...["新建", "编辑", "删除"].map((action) => `${action}角色`),
      ["批", "量"].join("")
    ].join("|"));

    expect(await screen.findByText("角色权限")).toBeTruthy();
    expect(screen.getByText("user")).toBeTruthy();
    expect(screen.getByText("super_user")).toBeTruthy();
    expect(screen.getByText("普通员工可访问首页、资讯、文档、培训和个人中心，不能进入 Admin Console。")).toBeTruthy();
    expect(screen.getByText("超级用户可进入 Admin Console，执行单条后台管理操作并查看只读权限边界。")).toBeTruthy();
    expect(screen.getAllByText(/^(user|super_user)$/)).toHaveLength(2);

    expect(screen.queryByText(inactiveAdminRolePattern)).toBeNull();
    expect(screen.queryByText(mutationControlPattern)).toBeNull();
  });
});
