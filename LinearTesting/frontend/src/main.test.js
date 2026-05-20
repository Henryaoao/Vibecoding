import { beforeEach, describe, expect, it, vi } from "vitest";

describe("vanilla Ajax frontend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    mockLocalStorage();
    window.history.pushState({}, "", "/login");
    document.body.innerHTML = `<div id="root"></div>`;
  });

  it("renders the vanilla login page", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await import("./main.js");

    expect(document.querySelector("h1").textContent).toBe("Log in");
    expect(document.querySelector("input[name='email']")).not.toBeNull();
    expect(document.querySelector("input[name='password']")).not.toBeNull();
  });

  it("logs in through the REST session endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          token: "test-token",
          user: {
            email: "user@example.com",
            role: "user",
            username: "example_user",
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await import("./main.js");
    document.querySelector("input[name='email']").value = "user@example.com";
    document.querySelector("input[name='password']").value = "secure-password";
    document.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true }));

    await vi.waitFor(() => {
      expect(document.querySelector("h1").textContent).toBe("Welcome, example_user");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(window.localStorage.getItem("auth_token")).toBe("test-token");
  });
});

function mockLocalStorage() {
  const values = new Map();

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, String(value)),
    },
  });
}
