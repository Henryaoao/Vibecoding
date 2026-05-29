import { useEffect } from "react";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import type * as ExpoNotifications from "expo-notifications";
import { navigateToNotificationRoute } from "./clickRouting";

type NotificationResponse = {
  notification?: {
    request?: {
      content?: {
        data?: unknown;
      };
    };
  };
};

type NotificationSubscription = {
  remove: () => void;
};

type NotificationResponseListener = (response: unknown) => void;

export type NotificationResponseListenerProvider = {
  addNotificationResponseReceivedListener: (listener: NotificationResponseListener) => NotificationSubscription;
};

type NotificationNavigator = {
  push: (href: string) => void;
};

type NotificationResponseListenerOptions = {
  navigator: NotificationNavigator;
  provider?: NotificationResponseListenerProvider;
};

function notificationsModule(): NotificationResponseListenerProvider {
  return require("expo-notifications") as typeof ExpoNotifications;
}

function isNotificationResponse(response: unknown): response is NotificationResponse {
  return response !== null && typeof response === "object";
}

function payloadFromResponse(response: unknown) {
  if (!isNotificationResponse(response)) {
    return {};
  }

  const data = response.notification?.request?.content?.data;
  return data && typeof data === "object" ? data : {};
}

export function createNotificationResponseListener({
  navigator,
  provider = notificationsModule()
}: NotificationResponseListenerOptions) {
  const subscription = provider.addNotificationResponseReceivedListener((response) => {
    navigateToNotificationRoute(payloadFromResponse(response), navigator);
  });
  let removed = false;

  return () => {
    if (removed) {
      return;
    }

    removed = true;
    subscription.remove();
  };
}

export function useNotificationResponseListener(provider?: NotificationResponseListenerProvider) {
  const router = useRouter();

  useEffect(() => {
    return createNotificationResponseListener({
      navigator: {
        push: (href) => router.push(href as Href)
      },
      provider
    });
  }, [provider, router]);
}
