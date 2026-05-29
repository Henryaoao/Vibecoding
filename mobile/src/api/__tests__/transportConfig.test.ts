import { describe, expect, it, jest } from "@jest/globals";
import { createConfiguredApiTransport } from "../transportConfig";
import { mockTransport } from "../mock/transport";

describe("API transport config", () => {
  it("uses the mock transport when no API base URL is configured", async () => {
    expect(createConfiguredApiTransport({ apiBaseUrl: undefined })).toBe(mockTransport);
    expect(createConfiguredApiTransport({ apiBaseUrl: "   " })).toBe(mockTransport);
  });

  it("uses a fetch-backed transport when an API base URL is configured", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ code: "OK", message: "success", data: { ok: true }, request_id: "req_config_1" })
    } as unknown as Response);

    const transport = createConfiguredApiTransport({ apiBaseUrl: "https://api.example.com", fetchImpl: fetchMock });
    await transport({ path: "/api/v1/ping", method: "GET", headers: {} });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/api/v1/ping", {
      method: "GET",
      headers: {}
    });
  });
});
