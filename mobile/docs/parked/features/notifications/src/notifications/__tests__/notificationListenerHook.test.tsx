import { describe, expect, it, jest } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { useNotificationResponseListener } from "../notificationListener";

const mockPush = jest.fn<(href: string) => void>();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush })
}));

function ListenerHarness({ provider }: Parameters<typeof useNotificationResponseListener>[0] extends infer Provider ? { provider: Provider } : never) {
  useNotificationResponseListener(provider);
  return null;
}

describe("useNotificationResponseListener", () => {
  it("registers injected providers with router push and cleans up on unmount", () => {
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

    const { unmount } = render(
      <ListenerHarness provider={{ addNotificationResponseReceivedListener }} />
    );

    expect(mockPush).toHaveBeenCalledWith("/announcements/2101");
    expect(addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1);

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
