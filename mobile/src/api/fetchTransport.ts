import type { ApiRequest, ApiTransport, ApiTransportResponse } from "./client";
import type { ApiEnvelope } from "./envelope";
import { ApiError } from "./errors";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type FetchApiTransportConfig = {
  baseUrl: string;
  fetchImpl?: FetchLike;
};

function joinBaseUrlAndPath(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function isJsonResponse(response: Response) {
  return response.headers.get("content-type")?.toLowerCase().includes("application/json") ?? false;
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  if (!isJsonResponse(response)) {
    throw new ApiError({
      status: response.status,
      code: "INVALID_RESPONSE",
      message: "API response was not valid JSON"
    });
  }

  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError({
      status: response.status,
      code: "INVALID_RESPONSE",
      message: "API response was not valid JSON"
    });
  }
}

export function createFetchApiTransport(config: FetchApiTransportConfig): ApiTransport {
  const fetchImpl = config.fetchImpl ?? fetch;

  return async function fetchApiTransport<T>(request: ApiRequest): Promise<ApiTransportResponse<T>> {
    const headers: Record<string, string> = { ...request.headers };
    const init: RequestInit = {
      method: request.method,
      headers
    };

    if (request.body !== undefined) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      init.body = JSON.stringify(request.body);
    }

    let response: Response;
    try {
      response = await fetchImpl(joinBaseUrlAndPath(config.baseUrl, request.path), init);
    } catch {
      throw new ApiError({
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network request failed"
      });
    }

    return {
      status: response.status,
      envelope: await readEnvelope<T>(response)
    };
  };
}
