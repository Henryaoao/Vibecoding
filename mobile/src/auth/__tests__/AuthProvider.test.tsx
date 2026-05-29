import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { Pressable, Text } from "react-native";
import { setAccessTokenProvider, setApiTransport } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { mockTransport, resetMockTransportState } from "@/api/mock/transport";
import { AuthProvider, useAuth } from "../AuthProvider";

jest.mock("@/storage/secureTokenStorage", () => ({
  getStoredAccessToken: jest.fn(async () => "mock-token-user"),
  saveAccessToken: jest.fn(async () => undefined),
  clearAccessToken: jest.fn(async () => undefined)
}));

function Probe() {
  const { user, signOut } = useAuth();

  return (
    <>
      <Text>{user ? user.name : "signed-out"}</Text>
      <Pressable accessibilityRole="button" onPress={() => void signOut()}>
        <Text>Sign out</Text>
      </Pressable>
    </>
  );
}

function renderAuthProvider() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity }
    }
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
    { wrapper: Wrapper }
  );
}

describe("AuthProvider signOut", () => {
  beforeEach(() => {
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  afterEach(() => {
    jest.clearAllMocks();
    setAccessTokenProvider(() => null);
    setApiTransport(mockTransport);
    resetMockTransportState();
  });

  it("calls logout before clearing auth state", async () => {
    const calls: string[] = [];
    setApiTransport(async (request) => {
      if (request.path === endpoints.auth.logout) {
        calls.push("logout");
      }
      return mockTransport(request);
    });

    renderAuthProvider();

    expect(await screen.findByText("林一鸣")).toBeTruthy();
    fireEvent.press(screen.getByText("Sign out"));

    await waitFor(() => expect(screen.getByText("signed-out")).toBeTruthy());
    expect(calls).toEqual(["logout"]);
  });

  it("still clears auth when logout fails", async () => {
    const calls: string[] = [];
    setApiTransport(async (request) => {
      if (request.path === endpoints.auth.logout) {
        calls.push("logout");
        throw new Error("logout failed");
      }
      return mockTransport(request);
    });

    renderAuthProvider();

    expect(await screen.findByText("林一鸣")).toBeTruthy();
    fireEvent.press(screen.getByText("Sign out"));

    await waitFor(() => expect(screen.getByText("signed-out")).toBeTruthy());
    expect(calls).toEqual(["logout"]);
  });
});
