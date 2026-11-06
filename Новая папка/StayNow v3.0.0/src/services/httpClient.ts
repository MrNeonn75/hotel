import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { API_BASE_URL, API_TIMEOUT_MS } from '@/config/env';
import { useAuthStore } from '@/store';

let cachedDeviceId: string | null = null;

/**
 * Cihaz üçün unikal UUID v4 oxuyur və ya generasiya edib SecureStore-da saxlayır
 */
export async function getOrCreateDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    let deviceId = await SecureStore.getItemAsync('staynow_device_id');
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync('staynow_device_id', deviceId);
    }
    cachedDeviceId = deviceId;
    return deviceId;
  } catch {
    if (!cachedDeviceId) {
      cachedDeviceId = Crypto.randomUUID();
    }
    return cachedDeviceId;
  }
}

/**
 * JWT Auth tokenini oxuyur
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('staynow_auth_token');
  } catch {
    return null;
  }
}

/**
 * JWT Auth tokenini yadda saxlayır və ya silir
 */
export async function setAuthToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await SecureStore.setItemAsync('staynow_auth_token', token);
    } else {
      await SecureStore.deleteItemAsync('staynow_auth_token');
    }
  } catch {
    // fallback
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
  idempotencyKey?: string;
}

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: any[];

  constructor(message: string, code = 'API_ERROR', statusCode = 500, details?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Backend xətalarını istifadəçi üçün Azərbaycan dilində tək mesaja çevirir
 */
function parseBackendErrorMessage(data: any, statusCode: number): string {
  if (data?.error?.message) {
    return data.error.message;
  }
  if (typeof data?.detail === 'string') {
    return data.detail;
  }
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail.map((d: any) => d.msg || 'Daxil edilən məlumat yanlışdır').join(', ');
  }
  if (statusCode === 401) return 'Daxil olma müddətiniz bitib. Zəhmət olmasa yenidən daxil olun.';
  if (statusCode === 404) return 'Axtarılan məlumat və ya otel tapılmadı.';
  if (statusCode === 409) return 'Rezervasiya ləğv edilə bilməz və ya otaq artıq doludur.';
  if (statusCode >= 500) return 'Serverdə müvəqqəti xəta baş verdi. Zəhmət olmasa bir qədər sonra cəhd edin.';
  return 'Şəbəkə sorğusu zamanı xəta baş verdi.';
}

/**
 * Əsas HTTP sorğu funksiyası
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs = API_TIMEOUT_MS,
    skipAuth = false,
    idempotencyKey,
    headers: customHeaders = {},
    ...rest
  } = options;

  const deviceId = await getOrCreateDeviceId();
  const token = skipAuth ? null : await getAuthToken();

  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Device-Id': deviceId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    ...(customHeaders as Record<string, string>),
  };

  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      if (res.status === 401) {
        // Auto logout on 401
        useAuthStore.getState().logout().catch(() => {});
      }

      const message = parseBackendErrorMessage(data, res.status);
      const code = data?.error?.code || (res.status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR');
      throw new ApiError(message, code, res.status, data?.error?.details);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') {
      throw new ApiError('Server cavab vermədi. Sorğu vaxtı bitdi.', 'TIMEOUT', 408);
    }
    throw new ApiError(
      err.message || 'İnternet bağlantısı yoxdur və ya server əlçatan deyil.',
      'NETWORK_ERROR',
      0
    );
  }
}

