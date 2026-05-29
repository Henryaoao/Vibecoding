import { apiErrorFromEnvelope, ApiError } from "./errors";
import type { ApiEnvelope } from "./envelope";
import { createConfiguredApiTransport } from "./transportConfig";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequest = {
  path: string;
  method: HttpMethod;
  body?: unknown;
  headers: Record<string, string>;
};

export type ApiTransportResponse<T> = {
  status: number;
  envelope: ApiEnvelope<T>;
};

export type ApiTransport = <T>(request: ApiRequest) => Promise<ApiTransportResponse<T>>;

type TokenProvider = () => string | null | Promise<string | null>;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: (() => void) | undefined;
let transport: ApiTransport = createConfiguredApiTransport();

export function setAccessTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  unauthorizedHandler = handler;
}

export function setApiTransport(nextTransport: ApiTransport) {
  transport = nextTransport;
}

export async function apiRequest<T>(options: {
  path: string;
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
}) {
  const token = options.auth === false ? null : await tokenProvider();
  const response = await transport<T>({
    path: options.path,
    method: options.method ?? "GET",
    body: options.body,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (response.status < 200 || response.status >= 300) {
    throw apiErrorFromEnvelope(response.status, response.envelope);
  }

  if (response.envelope.code !== "OK") {
    throw new ApiError({
      status: response.status,
      code: response.envelope.code,
      message: response.envelope.message,
      requestId: response.envelope.request_id
    });
  }

  return response.envelope.data;
}
