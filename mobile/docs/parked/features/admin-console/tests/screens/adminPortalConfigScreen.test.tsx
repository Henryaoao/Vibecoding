import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { PropsWithChildren, ReactElement } from "react";
import AdminDashboardScreen from "../../../app/admin/dashboard";
import AdminPortalConfigScreen from "../../../app/admin/portal-config/index";
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

describe("Admin portal config screen", () => {
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

  it("shows a portal config entry on the Admin Dashboard", async () => {
    renderWithQuery(<AdminDashboardScreen />);

    expect(await screen.findByText("Admin Console")).toBeTruthy();

    fireEvent.press(screen.getByText("进入首页栏目配置"));
    expect(router.push).toHaveBeenCalledWith("/admin/portal-config");
  });

  it("lists seven homepage columns and only offers single-column edit controls", async () => {
    renderWithQuery(<AdminPortalConfigScreen />);

    expect(await screen.findByText("首页栏目配置")).toBeTruthy();
    expect(screen.getByText("今日公司简报")).toBeTruthy();
    expect(screen.getByText("财经轻资讯")).toBeTruthy();
    expect(screen.getAllByText(/栏目 key：/)).toHaveLength(7);
    expect(screen.queryByText("批量启用")).toBeNull();
    expect(screen.queryByText("批量禁用")).toBeNull();
    expect(screen.queryByText("批量更新")).toBeNull();
  });

  it("updates one homepage column and persists the mock transport state", async () => {
    renderWithQuery(<AdminPortalConfigScreen />);

    expect(await screen.findByText("财经轻资讯")).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText("finance display order"), "70");
    fireEvent.changeText(screen.getByLabelText("finance display count"), "2");
    fireEvent.press(screen.getByText("禁用 finance"));
    fireEvent.press(screen.getByText("保存 finance"));

    expect(await screen.findByText("finance 已保存")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("状态：disabled")).toBeTruthy());
    expect(screen.getByLabelText("finance display order").props.value).toBe("70");
    expect(screen.getByLabelText("finance display count").props.value).toBe("2");
  });
});
