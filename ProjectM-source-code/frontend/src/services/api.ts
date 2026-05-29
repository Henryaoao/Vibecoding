import type { ApiEnvelope } from '../types/portal';

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init.headers
    }
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok) {
    if (response.status === 401) {
      throw new UnauthorizedError(payload.message || 'authentication required');
    }
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
}
