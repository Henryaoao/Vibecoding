import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { apiRequest, setAccessTokenProvider, setApiTransport, setUnauthorizedHandler } from "../client";
import type { ApiRequest, ApiTransport, ApiTransportResponse } from "../client";
import { ApiError } from "../errors";

describe("apiRequest", () => {
  afterEach(() => {
    setAccessTokenProvider(() => null);
    setUnauthorizedHandler(undefined);
  });

  it("unwraps successful API envelopes and injects bearer token", async () => {
    expect.assertions(2);
    setAccessTokenProvider(() => "token-123");
    const transport: ApiTransport = async <T,>(request: ApiRequest): Promise<ApiTransportResponse<T>> => {
      expect(request.headers.Authorization).toBe("Bearer token-123");

      return {
        status: 200,
        envelope: {
          code: "OK",
          message: "success",
          data: { ok: true } as T,
          request_id: "req_test_1"
        }
      };
    };

    setApiTransport(transport);

    await expect(apiRequest<{ ok: boolean }>({ path: "/api/v1/example" })).resolves.toEqual({ ok: true });
  });

  it("calls the unauthorized handler on 401 and preserves request id", async () => {
    const unauthorizedHandler = jest.fn();
    setUnauthorizedHandler(unauthorizedHandler);
    const transport: ApiTransport = async <T,>(): Promise<ApiTransportResponse<T>> => ({
      status: 401,
      envelope: {
        code: "UNAUTHORIZED",
        message: "登录状态已失效，请重新登录",
        data: undefined as T,
        request_id: "req_401"
      }
    });

    setApiTransport(transport);

    await expect(apiRequest({ path: "/api/v1/auth/me" })).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
      message: "登录状态已失效，请重新登录",
      requestId: "req_401"
    });
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
  });

  it("turns 403 envelopes into ApiError", async () => {
    const transport: ApiTransport = async <T,>(): Promise<ApiTransportResponse<T>> => ({
      status: 403,
      envelope: {
        code: "FORBIDDEN",
        message: "当前账号无权访问该页面",
        data: undefined as T,
        request_id: "req_403"
      }
    });

    setApiTransport(transport);

    await expect(apiRequest({ path: "/api/v1/admin/mobile/dashboard" })).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
      requestId: "req_403"
    });
  });
});
