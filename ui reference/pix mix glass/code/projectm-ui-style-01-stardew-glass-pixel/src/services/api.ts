import type { ApiEnvelope } from '../types/portal';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      'X-ProjectM-User': 'demo-user'
    }
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
}
