import { registerDevice as registerDeviceApi } from "@/api/notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type * as ExpoNotifications from "expo-notifications";
import type { MobilePlatform, RegisteredDevice, RegisterDeviceRequest } from "@/types/domain";

export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

export type ExpoPushTokenResult = string | { data: string };

export type PushDeviceInfo = {
  platform: MobilePlatform;
  device_name?: string;
  app_version?: string;
};

export type PushRegistrationProviders = {
  getPermissionStatus: () => Promise<NotificationPermissionStatus>;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  getExpoPushToken: () => Promise<ExpoPushTokenResult>;
  getDeviceInfo: () => PushDeviceInfo;
  registerDevice?: (payload: RegisterDeviceRequest) => Promise<RegisteredDevice>;
};

export type PushRegistrationResult =
  | { status: "registered"; device: RegisteredDevice }
  | { status: "skipped"; reason: "permission_denied" };

let currentRegisteredDeviceId: string | null = null;

export function getCurrentRegisteredDeviceId() {
  return currentRegisteredDeviceId;
}

export function setCurrentRegisteredDeviceId(deviceId: string | null) {
  currentRegisteredDeviceId = deviceId;
}

export function clearCurrentRegisteredDeviceId() {
  currentRegisteredDeviceId = null;
}

function normalizeExpoPushToken(token: ExpoPushTokenResult) {
  return typeof token === "string" ? token : token.data;
}

export function createMockPushRegistrationProviders(options: {
  platform: MobilePlatform;
  token: string;
  device_name?: string;
  app_version?: string;
}): PushRegistrationProviders {
  return {
    getPermissionStatus: async () => "granted",
    requestPermission: async () => "granted",
    getExpoPushToken: async () => ({ data: options.token }),
    getDeviceInfo: () => ({
      platform: options.platform,
      device_name: options.device_name,
      app_version: options.app_version
    })
  };
}

type ExpoPushRegistrationOptions = {
  projectId?: string;
  platform?: MobilePlatform;
  deviceName?: string;
  appVersion?: string;
};

function permissionStatusFromExpo(status: string): NotificationPermissionStatus {
  return status === "granted" || status === "denied" ? status : "undetermined";
}

function expoProjectId() {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string }; projectId?: string } | undefined;
  return Constants.easConfig?.projectId ?? extra?.eas?.projectId ?? extra?.projectId;
}

function appVersion() {
  return Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version;
}

function currentPlatform(): MobilePlatform {
  return Platform.OS === "android" ? "android" : "ios";
}

function notificationsModule(): typeof ExpoNotifications {
  return require("expo-notifications") as typeof ExpoNotifications;
}

export function createExpoPushRegistrationProviders(options: ExpoPushRegistrationOptions = {}): PushRegistrationProviders {
  return {
    getPermissionStatus: async () => permissionStatusFromExpo((await notificationsModule().getPermissionsAsync()).status),
    requestPermission: async () => permissionStatusFromExpo((await notificationsModule().requestPermissionsAsync()).status),
    getExpoPushToken: async () => {
      const Notifications = notificationsModule();
      const projectId = options.projectId ?? expoProjectId();
      return projectId
        ? Notifications.getExpoPushTokenAsync({ projectId })
        : Notifications.getExpoPushTokenAsync();
    },
    getDeviceInfo: () => ({
      platform: options.platform ?? currentPlatform(),
      device_name: options.deviceName,
      app_version: options.appVersion ?? appVersion()
    })
  };
}

export async function registerExpoPushTokenIfAllowed(
  providers: PushRegistrationProviders
): Promise<PushRegistrationResult> {
  const initialStatus = await providers.getPermissionStatus();
  const finalStatus = initialStatus === "granted" ? initialStatus : await providers.requestPermission();

  if (finalStatus !== "granted") {
    return {
      status: "skipped",
      reason: "permission_denied"
    };
  }

  const deviceInfo = providers.getDeviceInfo();
  const payload: RegisterDeviceRequest = {
    platform: deviceInfo.platform,
    expo_push_token: normalizeExpoPushToken(await providers.getExpoPushToken())
  };

  if (deviceInfo.device_name) {
    payload.device_name = deviceInfo.device_name;
  }

  if (deviceInfo.app_version) {
    payload.app_version = deviceInfo.app_version;
  }

  const registerDevice = providers.registerDevice ?? registerDeviceApi;
  const device = await registerDevice(payload);
  setCurrentRegisteredDeviceId(device.id);

  return {
    status: "registered",
    device
  };
}
