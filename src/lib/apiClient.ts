import type { ApiErrorEnvelope } from '@/types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/v1';
const API_KEY = import.meta.env.VITE_API_KEY ?? 'demo-partner-key';

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: ApiErrorEnvelope | null;

  constructor(message: string, status: number, body: ApiErrorEnvelope | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let body: ApiErrorEnvelope | T | null = null;

  if (text) {
    try {
      body = JSON.parse(text) as ApiErrorEnvelope | T;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const envelope = body as ApiErrorEnvelope | null;
    const message =
      envelope?.error?.message ??
      envelope?.message ??
      `Request failed: ${response.status} ${response.statusText}`;
    throw new ApiClientError(message, response.status, envelope);
  }

  return body as T;
}
