import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createFetchApiTransport } from "../fetchTransport";
import { ApiError } from "../errors";

describe("fetch ApiTransport", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("builds URLs from the configured base URL, forwards auth, and sends JSON bodies", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({
        code: "OK",
        message: "success",
        data: { saved: true },
        request_id: "req_real_1"
      })
    } as unknown as Response);
    const transport = createFetchApiTransport({ baseUrl: "https://api.example.com/root/", fetchImpl: fetchMock });

    await expect(
      transport<{ saved: boolean }>({
        path: "/api/v1/me/profile?tab=home",
        method: "PATCH",
        body: { showNewcomerOnHome: false },
        headers: { Authorization: "Bearer token-123" }
      })
    ).resolves.toEqual({
      status: 200,
      envelope: {
        code: "OK",
        message: "success",
        data: { saved: true },
        request_id: "req_real_1"
      }
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/root/api/v1/me/profile?tab=home", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer token-123",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ showNewcomerOnHome: false })
    });
  });

  it("does not add a JSON content type for bodyless requests", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ code: "OK", message: "success", data: [], request_id: "req_real_2" })
    } as unknown as Response);
    const transport = createFetchApiTransport({ baseUrl: "https://api.example.com", fetchImpl: fetchMock });

    await transport({ path: "/api/v1/documents", method: "GET", headers: {} });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/api/v1/documents", {
      method: "GET",
      headers: {}
    });
  });

  it("maps non-JSON responses into ApiError without leaking request headers", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      status: 502,
      headers: { get: () => "text/plain" },
      text: async () => "upstream token-123 failed"
    } as unknown as Response);
    const transport = createFetchApiTransport({ baseUrl: "https://api.example.com", fetchImpl: fetchMock });

    await expect(
      transport({ path: "/api/v1/auth/me", method: "GET", headers: { Authorization: "Bearer token-123" } })
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
      code: "INVALID_RESPONSE",
      message: "API response was not valid JSON"
    });
  });

  it("maps network failures into ApiError", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue(new Error("connect ECONNREFUSED token-123"));
    const transport = createFetchApiTransport({ baseUrl: "https://api.example.com", fetchImpl: fetchMock });

    await expect(transport({ path: "/api/v1/auth/me", method: "GET", headers: {} })).rejects.toBeInstanceOf(ApiError);
    await expect(transport({ path: "/api/v1/auth/me", method: "GET", headers: {} })).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Network request failed"
    });
  });
});
