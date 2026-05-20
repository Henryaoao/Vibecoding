import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../auth/authStore.js";
import { Login } from "./Login.jsx";

vi.mock("../auth/api.js", () => ({
  fetchCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the login page", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("shows validation errors", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Email and password are required.");
  });
});

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

