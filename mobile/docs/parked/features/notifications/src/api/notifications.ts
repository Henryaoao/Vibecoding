import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { NotificationSettings, RegisteredDevice, RegisterDeviceRequest } from "@/types/domain";

export function registerDevice(payload: RegisterDeviceRequest) {
  return apiRequest<RegisteredDevice>({
    path: endpoints.me.devices,
    method: "POST",
    body: payload
  });
}

export function unregisterDevice(deviceId: string) {
  return apiRequest<{ ok: true }>({
    path: endpoints.me.device(deviceId),
    method: "DELETE"
  });
}

export function getNotificationSettings() {
  return apiRequest<NotificationSettings>({
    path: endpoints.me.notificationSettings
  });
}

export function updateNotificationSettings(payload: NotificationSettings) {
  return apiRequest<NotificationSettings>({
    path: endpoints.me.notificationSettings,
    method: "PUT",
    body: payload
  });
}
