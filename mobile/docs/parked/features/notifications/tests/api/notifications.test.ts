import { afterEach, describe, expect, it } from "@jest/globals";
import { setAccessTokenProvider, setApiTransport } from "../client";
import {
  getNotificationSettings,
  registerDevice,
  updateNotificationSettings,
  unregisterDevice
} from "../notifications";
import { mockTransport, resetMockTransportState } from "../mock/transport";

describe("notification API", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("registers an Expo push token for an authenticated mobile user", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(
      registerDevice({
        platform: "ios",
        expo_push_token: "ExponentPushToken[mock-ios-token]",
        device_name: "iPhone 15",
        app_version: "0.1.0"
      })
    ).resolves.toMatchObject({
      id: expect.stringMatching(/^device_mock_/),
      platform: "ios",
      expo_push_token: "ExponentPushToken[mock-ios-token]",
      device_name: "iPhone 15",
      app_version: "0.1.0",
      enabled: true,
      last_seen_at: expect.any(String)
    });
  });

  it("requires a valid session before registering a device token", async () => {
    await expect(
      registerDevice({
        platform: "android",
        expo_push_token: "ExponentPushToken[mock-android-token]"
      })
    ).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED"
    });
  });

  it("rejects unlink without a valid session", async () => {
    await expect(unregisterDevice("device_mock_001")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED"
    });
  });

  it("unregisters a previously registered device and returns not found on repeated unlink", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    const device = await registerDevice({
      platform: "ios",
      expo_push_token: "ExponentPushToken[mock-ios-token]"
    });

    await expect(unregisterDevice("device_mock_missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND"
    });

    await expect(unregisterDevice(device.id)).resolves.toEqual({ ok: true });
    await expect(unregisterDevice(device.id)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND"
    });
  });

  it("reads and updates notification preferences for the signed-in user", async () => {
    setAccessTokenProvider(() => "mock-token-user");

    await expect(getNotificationSettings()).resolves.toEqual({
      briefs: true,
      announcements: true,
      "forum-hot": true,
      newcomer: true,
      finance: false,
      documents: true,
      training: true
    });

    await expect(
      updateNotificationSettings({
        briefs: true,
        announcements: false,
        "forum-hot": false,
        newcomer: true,
        finance: false,
        documents: true,
        training: false
      })
    ).resolves.toEqual({
      briefs: true,
      announcements: false,
      "forum-hot": false,
      newcomer: true,
      finance: false,
      documents: true,
      training: false
    });

    await expect(getNotificationSettings()).resolves.toEqual({
      briefs: true,
      announcements: false,
      "forum-hot": false,
      newcomer: true,
      finance: false,
      documents: true,
      training: false
    });
  });
});
