import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { readFileSync } from "node:fs";
import path from "node:path";

jest.mock(
  "expo-notifications",
  () => ({
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    getExpoPushTokenAsync: jest.fn()
  }),
  { virtual: true }
);
import {
  clearCurrentRegisteredDeviceId,
  createExpoPushRegistrationProviders,
  createMockPushRegistrationProviders,
  getCurrentRegisteredDeviceId,
  registerExpoPushTokenIfAllowed
} from "../pushRegistration";
import type { RegisteredDevice, RegisterDeviceRequest } from "@/types/domain";
import * as Notifications from "expo-notifications";

describe("registerExpoPushTokenIfAllowed", () => {
  afterEach(() => {
    clearCurrentRegisteredDeviceId();
  });
  it("registers the normalized Expo token when notification permission is already granted", async () => {
    const requestPermission = jest.fn<() => Promise<"granted">>();
    const registerDevice = jest.fn(async (payload: RegisterDeviceRequest): Promise<RegisteredDevice> => ({
      id: "device_mock_1",
      user_id: "user_001",
      enabled: true,
      last_seen_at: "2026-05-27T10:00:00+08:00",
      ...payload
    }));

    const result = await registerExpoPushTokenIfAllowed({
      getPermissionStatus: async () => "granted",
      requestPermission,
      getExpoPushToken: async () => ({ data: "ExponentPushToken[mock-ios-token]" }),
      getDeviceInfo: () => ({
        platform: "ios",
        device_name: "iPhone 15",
        app_version: "0.1.0"
      }),
      registerDevice
    });

    expect(result).toMatchObject({
      status: "registered",
      device: {
        expo_push_token: "ExponentPushToken[mock-ios-token]",
        platform: "ios"
      }
    });
    expect(requestPermission).not.toHaveBeenCalled();
    expect(registerDevice).toHaveBeenCalledWith({
      platform: "ios",
      expo_push_token: "ExponentPushToken[mock-ios-token]",
      device_name: "iPhone 15",
      app_version: "0.1.0"
    });
  });


  it("stores the current registered device id for later unlink", async () => {
    await registerExpoPushTokenIfAllowed({
      getPermissionStatus: async () => "granted",
      requestPermission: async () => "granted",
      getExpoPushToken: async () => "ExponentPushToken[mock-ios-token]",
      getDeviceInfo: () => ({ platform: "ios" }),
      registerDevice: async (payload): Promise<RegisteredDevice> => ({
        id: "device_mock_current",
        user_id: "user_001",
        enabled: true,
        last_seen_at: "2026-05-27T10:00:00+08:00",
        ...payload
      })
    });

    expect(getCurrentRegisteredDeviceId()).toBe("device_mock_current");
  });

  it("skips token lookup and registration when permission is denied", async () => {
    const getExpoPushToken = jest.fn<() => Promise<string>>();
    const registerDevice = jest.fn(async (_payload: RegisterDeviceRequest): Promise<RegisteredDevice> => {
      throw new Error("registerDevice should not be called");
    });

    const result = await registerExpoPushTokenIfAllowed({
      getPermissionStatus: async () => "undetermined",
      requestPermission: async () => "denied",
      getExpoPushToken,
      getDeviceInfo: () => ({
        platform: "android"
      }),
      registerDevice
    });

    expect(result).toEqual({
      status: "skipped",
      reason: "permission_denied"
    });
    expect(getExpoPushToken).not.toHaveBeenCalled();
    expect(registerDevice).not.toHaveBeenCalled();
  });

  it("keeps deterministic mock providers injectable alongside expo-notifications", async () => {
    const providers = createMockPushRegistrationProviders({
      platform: "android",
      token: "ExponentPushToken[mock-android-contract-token]"
    });

    await expect(providers.getPermissionStatus()).resolves.toBe("granted");
    await expect(providers.requestPermission()).resolves.toBe("granted");
    await expect(providers.getExpoPushToken()).resolves.toEqual({
      data: "ExponentPushToken[mock-android-contract-token]"
    });
    expect(providers.getDeviceInfo()).toMatchObject({
      platform: "android"
    });

    const packageJson = JSON.parse(
      readFileSync(path.join(__dirname, "../../../package.json"), "utf8")
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

    expect(packageJson.dependencies).toHaveProperty("expo-notifications");
    expect(packageJson.devDependencies).not.toHaveProperty("expo-notifications");
  });

  it("creates real Expo providers that normalize permissions, pass the configured project id, and return metadata", async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ status: "undetermined" } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ status: "granted" } as Awaited<ReturnType<typeof Notifications.requestPermissionsAsync>>);
    jest.mocked(Notifications.getExpoPushTokenAsync).mockResolvedValueOnce({
      type: "expo",
      data: "ExponentPushToken[real-provider-token]"
    });

    const providers = createExpoPushRegistrationProviders({
      projectId: "eas-project-123",
      platform: "ios",
      deviceName: "iPhone 16",
      appVersion: "0.1.0-test"
    });

    await expect(providers.getPermissionStatus()).resolves.toBe("undetermined");
    await expect(providers.requestPermission()).resolves.toBe("granted");
    await expect(providers.getExpoPushToken()).resolves.toEqual({
      type: "expo",
      data: "ExponentPushToken[real-provider-token]"
    });
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: "eas-project-123"
    });
    expect(providers.getDeviceInfo()).toEqual({
      platform: "ios",
      device_name: "iPhone 16",
      app_version: "0.1.0-test"
    });
  });

});
