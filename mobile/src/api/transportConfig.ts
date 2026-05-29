import type { ApiTransport } from "./client";
import { createFetchApiTransport } from "./fetchTransport";
import { mockTransport } from "./mock/transport";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type TransportConfigOptions = {
  apiBaseUrl?: string;
  fetchImpl?: FetchLike;
};

function envApiBaseUrl() {
  const globalProcess = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };

  return globalProcess.process?.env?.EXPO_PUBLIC_API_BASE_URL;
}

export function createConfiguredApiTransport(options: TransportConfigOptions = {}): ApiTransport {
  const apiBaseUrl = (options.apiBaseUrl ?? envApiBaseUrl())?.trim();

  if (!apiBaseUrl) {
    return mockTransport;
  }

  try {
    new URL(apiBaseUrl);
  } catch {
    return mockTransport;
  }

  return createFetchApiTransport({ baseUrl: apiBaseUrl, fetchImpl: options.fetchImpl });
}
