import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { RequireAuth, RequireRole } from "../guards";
import type { Role, User } from "@/types/domain";

type AuthState = {
  user: User | null;
  isRestoring: boolean;
  hasRole: (roles: Role[]) => boolean;
};

const mockAuthState: AuthState = {
  user: null,
  isRestoring: false,
  hasRole: jest.fn(() => false)
};

jest.mock("../AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

jest.mock("expo-router", () => {
  const { Text } = require("react-native");

  return {
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>
  };
});

const user: User = {
  id: "user_1",
  name: "林小满",
  email: "user@example.com",
  department: "产品部",
  roles: ["user"]
};

describe("auth route guards", () => {
  beforeEach(() => {
    mockAuthState.user = null;
    mockAuthState.isRestoring = false;
    mockAuthState.hasRole = jest.fn(() => false);
  });

  it("shows the restoring state before making redirect decisions", () => {
    mockAuthState.isRestoring = true;

    render(
      <RequireAuth>
        <Text>protected content</Text>
      </RequireAuth>
    );

    expect(screen.getByText("正在恢复登录状态...")).toBeTruthy();
    expect(screen.queryByText("protected content")).toBeNull();
  });

  it("redirects anonymous users to the mobile login route", () => {
    render(
      <RequireAuth>
        <Text>protected content</Text>
      </RequireAuth>
    );

    expect(screen.getByText("redirect:/(auth)/login")).toBeTruthy();
  });

  it("renders protected content for signed-in users", () => {
    mockAuthState.user = user;

    render(
      <RequireAuth>
        <Text>protected content</Text>
      </RequireAuth>
    );

    expect(screen.getByText("protected content")).toBeTruthy();
  });

  it("keeps super-user-only screens behind the forbidden route for regular users", () => {
    mockAuthState.user = user;
    mockAuthState.hasRole = jest.fn(() => false);

    render(
      <RequireRole roles={["super_user"]}>
        <Text>super user content</Text>
      </RequireRole>
    );

    expect(screen.getByText("redirect:/forbidden")).toBeTruthy();
    expect(screen.queryByText("super user content")).toBeNull();
  });

  it("renders role-gated content when the current role is allowed", () => {
    mockAuthState.user = { ...user, roles: ["super_user"] };
    mockAuthState.hasRole = jest.fn(() => true);

    render(
      <RequireRole roles={["super_user"]}>
        <Text>super user content</Text>
      </RequireRole>
    );

    expect(screen.getByText("super user content")).toBeTruthy();
  });
});
