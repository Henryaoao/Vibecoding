import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import HomeScreen from "../../../app/(tabs)/index";
import ProfileScreen from "../../../app/(tabs)/me";
import TrainingProgressScreen from "../../../app/me/training";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { updateProfilePreferences } from "@/api/me";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn()
  }
}));

jest.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: {
      department: "产品部",
      email: "user@example.com",
      name: "林小满",
      roles: ["user"]
    },
    hasRole: jest.fn(() => false),
    signOut: jest.fn()
  })
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

describe("personal center hub screens", () => {
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

  it("routes from profile summary to active personal workflows only", async () => {
    renderWithQuery(<ProfileScreen />);

    expect(await screen.findByText("个人中心")).toBeTruthy();

    expect(screen.queryByText("我的收藏")).toBeNull();
    expect(screen.queryByText("下载记录")).toBeNull();
    expect(screen.queryByText("通知偏好")).toBeNull();
    expect(screen.queryByText("进入 Admin Console")).toBeNull();

    fireEvent.press(screen.getByText("培训进度"));
    expect(router.push).toHaveBeenCalledWith("/me/training");
  });

  it("lets a user hide the newcomer module from home through personal preferences", async () => {
    renderWithQuery(<ProfileScreen />);

    expect(await screen.findByText("首页显示新人专区：已开启")).toBeTruthy();

    fireEvent.press(screen.getByText("隐藏首页新人专区"));

    expect(await screen.findByText("首页显示新人专区：已隐藏")).toBeTruthy();
  });

  it("hides only the home newcomer module when the personal preference is disabled", async () => {
    await updateProfilePreferences({ showNewcomerOnHome: false });

    renderWithQuery(<HomeScreen />);

    expect(await screen.findByText("公司公告墙")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("新人专区")).toBeNull();
    });
    expect(screen.getByText("文档中心")).toBeTruthy();
  });

  it("routes from the pixel home menu list to active modules", async () => {
    renderWithQuery(<HomeScreen />);

    expect(await screen.findByLabelText("打开菜单")).toBeTruthy();

    fireEvent.press(await screen.findByLabelText("打开公司公告墙"));
    expect(router.push).toHaveBeenCalledWith("/modules/announcements");

    fireEvent.press(screen.getByLabelText("打开文档中心"));
    expect(router.push).toHaveBeenCalledWith("/(tabs)/documents");
  });

  it("shows training progress and opens the related course detail", async () => {
    renderWithQuery(<TrainingProgressScreen />);

    expect(await screen.findByText("我的培训进度")).toBeTruthy();
    expect(screen.getByText("信息安全与账号保护")).toBeTruthy();
    expect(screen.getByText("进度 80% · 未完成")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("查看课程 信息安全与账号保护"));
    expect(router.push).toHaveBeenCalledWith("/training/course_1001");
  });
});
