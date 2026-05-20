import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "./authStore.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { Dashboard } from "../pages/Dashboard.jsx";
import { Login } from "../pages/Login.jsx";

import { fetchCurrentUser, logoutUser } from "./api.js";

vi.mock("./api.js", () => ({
  fetchCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("redirects logged-out users to login", async () => {
    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });

  it("shows current user for logged-in users and clears auth on logout", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("auth_token", "valid-token");
    fetchCurrentUser.mockResolvedValue({
      user: {
        email: "user@example.com",
        id: "usr_000001",
        role: "user",
        username: "example_user",
      },
    });
    logoutUser.mockResolvedValue({ logged_out: true });

    renderApp("/dashboard");

    expect(await screen.findByRole("heading", { name: "Welcome, example_user" })).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("auth_token")).toBeNull();
    });
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });
});

function renderApp(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

