import type { ApiResponse } from '@/types';

const BASE_URL = '/api';

async function getAuthToken(): Promise<string | null> {
  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...rest,
      headers: finalHeaders,
    });
  } catch (error) {
    console.error('[Request] Network error:', error);
    throw new Error('网络连接失败，请检查网络设置');
  }

  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`请求失败 (HTTP ${response.status})`);
  }

  if (!response.ok || !data.success) {
    if (response.status === 401) {
      localStorage.removeItem('auth');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    throw new Error(data.error || data.message || '请求失败');
  }

  return data.data as T;
}

export function get<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'GET' });
}

export function post<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function put<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return request<T>(url, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function del<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, { ...options, method: 'DELETE' });
}
