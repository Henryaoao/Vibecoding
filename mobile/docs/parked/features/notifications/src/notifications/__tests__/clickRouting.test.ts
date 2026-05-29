import { describe, expect, it, jest } from "@jest/globals";
import { navigateToNotificationRoute, resolveNotificationClickRoute } from "../clickRouting";

describe("resolveNotificationClickRoute", () => {
  it("accepts safe app routes from notification payloads", () => {
    expect(resolveNotificationClickRoute({ route: "/announcements/2101" })).toBe("/announcements/2101");
    expect(resolveNotificationClickRoute({ route: "/briefs/brief_20260526" })).toBe("/briefs/brief_20260526");
    expect(resolveNotificationClickRoute({ route: "/forum-hot/forum_hot_1001" })).toBe("/forum-hot/forum_hot_1001");
    expect(resolveNotificationClickRoute({ data: { route: "/announcements/2101" } })).toBe("/announcements/2101");
    expect(resolveNotificationClickRoute({ data: { route: "/modules/announcements" } })).toBe("/modules/announcements");
    expect(resolveNotificationClickRoute({ route: "/documents/doc_001" })).toBe("/documents/doc_001");
  });

  it("rejects external and unsafe notification routes", () => {
    expect(resolveNotificationClickRoute({ route: "https://evil.example/phish" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "//evil.example/phish" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "/../admin/users" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "/admin/users" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "/me/../admin/users" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "mailto:security@example.com" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "/(tabs)/me" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "/(bad)" })).toBeNull();
    expect(resolveNotificationClickRoute({ route: "\\..\\evil" })).toBeNull();
  });

  it("pushes only resolved safe routes", () => {
    const push = jest.fn<(href: string) => void>();

    expect(navigateToNotificationRoute({ route: "/announcements/2101" }, { push })).toBe(true);
    expect(push).toHaveBeenCalledWith("/announcements/2101");

    expect(navigateToNotificationRoute({ route: "projectm://admin/users" }, { push })).toBe(false);
    expect(push).toHaveBeenCalledTimes(1);
  });
});
