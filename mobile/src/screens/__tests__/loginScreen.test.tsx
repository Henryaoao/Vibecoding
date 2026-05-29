import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import LoginScreen from "../../../app/(auth)/login";
import { ApiError } from "@/api/errors";
import type { Role } from "@/types/domain";

const mockReplace = jest.fn();
const mockSignIn = jest.fn<(role: Role) => Promise<void>>();

jest.mock("expo-router", () => ({
  router: {
    replace: (href: string) => mockReplace(href)
  }
}));

jest.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    signIn: mockSignIn
  })
}));

describe("login screen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSignIn.mockReset();
    mockSignIn.mockResolvedValue(undefined);
  });

  it("signs in as a regular user and routes to the mobile home shell", async () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("普通用户登录"));

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith("user"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("signs in as a super user without exposing an admin-console route", async () => {
    render(<LoginScreen />);

    expect(screen.queryByText("Admin Console")).toBeNull();
    fireEvent.press(screen.getByText("超级用户登录"));

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith("super_user"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("shows API login failures without navigating away", async () => {
    mockSignIn.mockRejectedValueOnce(new ApiError({ status: 401, code: "UNAUTHORIZED", message: "登录凭证无效" }));

    render(<LoginScreen />);

    fireEvent.press(screen.getByText("普通用户登录"));

    expect(await screen.findByText("登录凭证无效")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
