import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren, ReactElement } from "react";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import type { ApiRequest, ApiTransportResponse } from "@/api/client";
import { mockTransport } from "@/api/mock/transport";
import type { PushRegistrationProviders } from "@/notifications/pushRegistration";
import {
  createExpoPushRegistrationProviders,
  createMockPushRegistrationProviders,
  registerExpoPushTokenIfAllowed
} from "@/notifications/pushRegistration";
import NotificationSettingsScreen from "../../../app/me/notifications";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    replace: jest.fn()
  }
}));

jest.mock("@/notifications/pushRegistration", () => ({
  createExpoPushRegistrationProviders: jest.fn(),
  createMockPushRegistrationProviders: jest.fn(),
  registerExpoPushTokenIfAllowed: jest.fn()
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

const realPushProviders: PushRegistrationProviders = {
  getPermissionStatus: async () => "granted",
  requestPermission: async () => "granted",
  getExpoPushToken: async () => "ExponentPushToken[real-default]",
  getDeviceInfo: () => ({ platform: "ios" })
};

const deterministicPushProviders: PushRegistrationProviders = {
  getPermissionStatus: async () => "granted",
  requestPermission: async () => "granted",
  getExpoPushToken: async () => "ExponentPushToken[test-deterministic]",
  getDeviceInfo: () => ({ platform: "android" })
};

describe("NotificationSettingsScreen", () => {
  beforeEach(() => {
    setAccessTokenProvider(() => "mock-token-user");
    setApiTransport(mockTransport);
    jest.mocked(createExpoPushRegistrationProviders).mockReturnValue(realPushProviders);
    jest.mocked(createMockPushRegistrationProviders).mockReturnValue(deterministicPushProviders);
    jest.mocked(registerExpoPushTokenIfAllowed).mockResolvedValue({
      status: "registered",
      device: {
        id: "device_real_default",
        user_id: "user_001",
        platform: "ios",
        expo_push_token: "ExponentPushToken[real-default]",
        enabled: true,
        last_seen_at: "2026-05-27T10:00:00+08:00"
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
  });


  it("shows a retry action when notification preferences fail to load and recovers", async () => {
    let settingsRequests = 0;
    setApiTransport(async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      if (request.path === "/api/v1/me/notification-settings") {
        settingsRequests += 1;

        if (settingsRequests === 1) {
          return {
            status: 500,
            envelope: {
              code: "INTERNAL_ERROR",
              message: "temporary notification settings outage",
              data: null as T,
              request_id: "req_notification_settings_retry"
            }
          };
        }
      }

      return mockTransport<T>(request);
    });

    renderWithQuery(<NotificationSettingsScreen />);

    expect(await screen.findByText("通知偏好加载失败，请稍后重试")).toBeTruthy();

    fireEvent.press(screen.getByText("重试"));

    expect(await screen.findByText("通知偏好")).toBeTruthy();
    expect(settingsRequests).toBe(2);
  });

  it("updates notification preferences and registers the current device with real push providers by default", async () => {
    renderWithQuery(<NotificationSettingsScreen />);

    expect(await screen.findByText("通知偏好")).toBeTruthy();

    fireEvent(screen.getByLabelText("公司公告墙通知"), "valueChange", false);

    await waitFor(() => {
      expect(screen.getByText("公司公告墙通知已关闭")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("注册当前设备"));

    expect(await screen.findByText("设备已注册：ios")).toBeTruthy();
    expect(createExpoPushRegistrationProviders).toHaveBeenCalledTimes(1);
    expect(createMockPushRegistrationProviders).not.toHaveBeenCalled();
    expect(registerExpoPushTokenIfAllowed).toHaveBeenCalledWith(realPushProviders);
  });

  it("keeps deterministic push registration injectable for tests", async () => {
    jest.mocked(registerExpoPushTokenIfAllowed).mockResolvedValueOnce({
      status: "registered",
      device: {
        id: "device_test_deterministic",
        user_id: "user_001",
        platform: "android",
        expo_push_token: "ExponentPushToken[test-deterministic]",
        enabled: true,
        last_seen_at: "2026-05-27T10:00:00+08:00"
      }
    });
    const createPushRegistrationProviders = jest.fn(() => deterministicPushProviders);

    renderWithQuery(<NotificationSettingsScreen createPushRegistrationProviders={createPushRegistrationProviders} />);

    expect(await screen.findByText("通知偏好")).toBeTruthy();

    fireEvent.press(screen.getByText("注册当前设备"));

    expect(await screen.findByText("设备已注册：android")).toBeTruthy();
    expect(createPushRegistrationProviders).toHaveBeenCalledTimes(1);
    expect(createExpoPushRegistrationProviders).not.toHaveBeenCalled();
    expect(registerExpoPushTokenIfAllowed).toHaveBeenCalledWith(deterministicPushProviders);
  });

  it("describes real push readiness instead of mock-only registration", async () => {
    renderWithQuery(<NotificationSettingsScreen />);

    expect(await screen.findByText("通知偏好")).toBeTruthy();
    expect(screen.getByText("管理移动端推送入口；真实系统推送将在开发构建与真机阶段验证。"));
    expect(screen.getByText("使用真实 Expo 推送注册通道；测试仍可注入确定性 provider，真机权限将在开发构建中弹出。"));
    expect(screen.queryByText("第一版使用 mock provider 验证 Expo push token 注册契约，不依赖真实系统推送权限。")).toBeNull();
  });
});
