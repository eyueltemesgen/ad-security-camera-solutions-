// Central fetch-based API client. Stores the JWT in localStorage,
// attaches it to every request, and surfaces friendly error messages.

const TOKEN_KEY = 'ad_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — session simply won't persist
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
}

export async function api<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  const token = opts.auth === false ? null : getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method: opts.method ?? 'GET',
      headers,
      body,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your internet connection and try again.');
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Request failed (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return payload as T;
}

export const apiGet = <T = any>(path: string, auth = true) => api<T>(path, { auth });
export const apiPost = <T = any>(path: string, body?: unknown, auth = true) =>
  api<T>(path, { method: 'POST', body, auth });
export const apiPut = <T = any>(path: string, body?: unknown, auth = true) =>
  api<T>(path, { method: 'PUT', body, auth });
export const apiPatch = <T = any>(path: string, body?: unknown, auth = true) =>
  api<T>(path, { method: 'PATCH', body, auth });
export const apiDelete = <T = any>(path: string, auth = true) =>
  api<T>(path, { method: 'DELETE', auth });

/** Upload a file with the auth token attached. */
export async function apiUpload<T = any>(path: string, formData: FormData, auth = true): Promise<T> {
  return api<T>(path, { method: 'POST', formData, auth });
}