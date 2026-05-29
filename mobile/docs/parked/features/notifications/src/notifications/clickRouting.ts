type NotificationPayload = {
  route?: unknown;
  data?: {
    route?: unknown;
  };
};

type NotificationNavigator = {
  push: (href: string) => void;
};

const allowedRoutePatterns = [
  /^\/announcements\/[A-Za-z0-9_-]+$/,
  /^\/briefs\/[A-Za-z0-9_-]+$/,
  /^\/forum-hot\/[A-Za-z0-9_-]+$/,
  /^\/modules\/(?:briefs|announcements|forum-hot|newcomer|finance)$/,
  /^\/documents\/[A-Za-z0-9_-]+$/,
  /^\/me\/notifications$/
];

function routeFromPayload(payload: NotificationPayload) {
  if (typeof payload.route === "string") {
    return payload.route;
  }

  if (typeof payload.data?.route === "string") {
    return payload.data.route;
  }

  return null;
}

export function resolveNotificationClickRoute(payload: NotificationPayload) {
  const route = routeFromPayload(payload)?.trim();

  if (!route || route.includes("..") || route.includes("\\") || route.startsWith("//")) {
    return null;
  }

  if (!route.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(route)) {
    return null;
  }

  return allowedRoutePatterns.some((pattern) => pattern.test(route)) ? route : null;
}

export function navigateToNotificationRoute(payload: NotificationPayload, navigator: NotificationNavigator) {
  const route = resolveNotificationClickRoute(payload);

  if (!route) {
    return false;
  }

  navigator.push(route);
  return true;
}
