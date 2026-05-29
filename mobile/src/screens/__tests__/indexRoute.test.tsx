import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import IndexRoute from "../../../app/index";
import type { User } from "@/types/domain";

const mockAuthState: { user: User | null; isRestoring: boolean } = {
  user: null,
  isRestoring: false
};

jest.mock("expo-router", () => {
  const { Text } = require("react-native");

  return {
    Redirect: ({ href }: { href: string }) => <Text>{`redirect:${href}`}</Text>
  };
});

jest.mock("@/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

const user: User = {
  id: "user_1",
  name: "林小满",
  email: "user@example.com",
  department: "产品部",
  roles: ["user"]
};

describe("app launch route", () => {
  beforeEach(() => {
    mockAuthState.user = null;
    mockAuthState.isRestoring = false;
  });

  it("shows the ProjectM loading state while auth is restoring", () => {
    mockAuthState.isRestoring = true;

    render(<IndexRoute />);

    expect(screen.getByText("正在进入 ProjectM...")).toBeTruthy();
  });

  it("sends anonymous users to login", () => {
    render(<IndexRoute />);

    expect(screen.getByText("redirect:/(auth)/login")).toBeTruthy();
  });

  it("sends signed-in users to the tab home shell", () => {
    mockAuthState.user = user;

    render(<IndexRoute />);

    expect(screen.getByText("redirect:/(tabs)")).toBeTruthy();
  });
});
