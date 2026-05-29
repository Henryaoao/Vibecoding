import { describe, expect, it, jest } from "@jest/globals";
import { createNotificationResponseListener } from "../notificationListener";

describe("createNotificationResponseListener", () => {
  it("routes safe Expo notification data routes through the provided navigator", () => {
    const push = jest.fn<(href: string) => void>();
    const remove = jest.fn();
    const addNotificationResponseReceivedListener = jest.fn((listener: (response: unknown) => void) => {
      listener({
        notification: {
          request: {
            content: {
              data: {
                route: "/announcements/2101"
              }
            }
          }
        }
      });

      return { remove };
    });

    const cleanup = createNotificationResponseListener({
      navigator: { push },
      provider: { addNotificationResponseReceivedListener }
    });

    expect(push).toHaveBeenCalledWith("/announcements/2101");
    expect(cleanup).toEqual(expect.any(Function));
  });

  it("routes safe top-level Expo notification route payloads", () => {
    const push = jest.fn<(href: string) => void>();
    const addNotificationResponseReceivedListener = jest.fn((listener: (response: unknown) => void) => {
      listener({
        notification: {
          request: {
            content: {
              data: {
                route: "/documents/doc_001"
              }
            }
          }
        }
      });

      return { remove: jest.fn() };
    });

    createNotificationResponseListener({
      navigator: { push },
      provider: { addNotificationResponseReceivedListener }
    });

    expect(push).toHaveBeenCalledWith("/documents/doc_001");
  });

  it("ignores unsafe response routes without navigating", () => {
    const push = jest.fn<(href: string) => void>();
    const addNotificationResponseReceivedListener = jest.fn((listener: (response: unknown) => void) => {
      listener({
        notification: {
          request: {
            content: {
              data: {
                route: "/admin/users"
              }
            }
          }
        }
      });

      listener({
        notification: {
          request: {
            content: {
              data: {
                route: "https://evil.example/phish"
              }
            }
          }
        }
      });

      return { remove: jest.fn() };
    });

    createNotificationResponseListener({
      navigator: { push },
      provider: { addNotificationResponseReceivedListener }
    });

    expect(push).not.toHaveBeenCalled();
  });

  it("ignores malformed responses without throwing or navigating", () => {
    const push = jest.fn<(href: string) => void>();
    const addNotificationResponseReceivedListener = jest.fn((listener: (response: unknown) => void) => {
      expect(() => listener(null)).not.toThrow();
      expect(() => listener({ notification: {} })).not.toThrow();
      expect(() => listener({ notification: { request: { content: { data: "not-object" } } } })).not.toThrow();

      return { remove: jest.fn() };
    });

    createNotificationResponseListener({
      navigator: { push },
      provider: { addNotificationResponseReceivedListener }
    });

    expect(push).not.toHaveBeenCalled();
  });

  it("removes the Expo subscription at most once during cleanup", () => {
    const remove = jest.fn();
    const cleanup = createNotificationResponseListener({
      navigator: { push: jest.fn() },
      provider: {
        addNotificationResponseReceivedListener: jest.fn(() => ({ remove }))
      }
    });

    cleanup();
    cleanup();

    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("uses the injected provider without requiring native notification modules", () => {
    const addNotificationResponseReceivedListener = jest.fn(() => ({ remove: jest.fn() }));

    createNotificationResponseListener({
      navigator: { push: jest.fn() },
      provider: { addNotificationResponseReceivedListener }
    });

    expect(addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);
  });
});
