import { beforeEach, describe, expect, it, vi } from "vitest";

describe("auth Ajax helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    mockLocalStorage();
  });

  it("calls the REST session endpoint and stores no page markup", async () => {
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

    const { loginUser, setToken } = await import("./auth-api.js");
    const data = await loginUser({
      email: "user@example.com",
      password: "secure-password",
    });
    setToken(data.token);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sessions",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(window.localStorage.getItem("auth_token")).toBe("test-token");
  });

  it("shows API error details in the page error slot", async () => {
    document.body.innerHTML = `<p data-error hidden></p>`;
    const { showError } = await import("./auth-api.js");

    showError("Invalid request");

    expect(document.querySelector("[data-error]").hidden).toBe(false);
    expect(document.querySelector("[data-error]").textContent).toBe("Invalid request");
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
