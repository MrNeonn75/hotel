import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'staynow_device_id';
const DEFAULT_TIMEOUT_MS = 15000;

// Base API URL from environment
const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://207.180.233.253:18000/api/v1';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

// In-memory cache for device ID
let cachedDeviceId: string | null = null;

/**
 * Cihaz ID-sini (UUID v4) SecureStore və ya AsyncStorage-dən oxuyur.
 * Əgər hələ yoxdursa, yeni UUID yaradıb yaddaşda saxlayır.
 */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    let storedId: string | null = null;

    if (Platform.OS !== 'web') {
      const isSecureAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isSecureAvailable) {
        storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY).catch(() => null);
      }
    }

    if (!storedId) {
      storedId = await AsyncStorage.getItem(DEVICE_ID_KEY).catch(() => null);
    }

    if (storedId && storedId.trim().length > 0) {
      cachedDeviceId = storedId.trim();
      return cachedDeviceId;
    }
  } catch {
    // Storage read error fallback
  }

  // Yeni UUID yarat
  const newId = Crypto.randomUUID();
  cachedDeviceId = newId;

  // Hər iki depoda asinxron saxla
  try {
    if (Platform.OS !== 'web') {
      const isSecureAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isSecureAvailable) {
        await SecureStore.setItemAsync(DEVICE_ID_KEY, newId).catch(() => {});
      }
    }
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId).catch(() => {});
  } catch {
    // Ignore storage write errors
  }

  return newId;
}

/**
 * Xəta kodlarının istifadəçi üçün aydın Azərbaycan dilində tərcüməsi.
 */
export const ERROR_MESSAGES_AZ: Record<string, string> = {
  NO_AVAILABILITY: 'Təəssüf ki, seçilmiş tarixlər üçün bu oteldə boş otaq qalmayıb.',
  CANCELLATION_NOT_ALLOWED:
    'Rezervasiyanı yalnız giriş vaxtına ən azı 24 saat qalana qədər ləğv etmək mümkündür.',
  HOTEL_NOT_FOUND: 'Axtardığınız otel tapılmadı.',
  BOOKING_NOT_FOUND: 'Rezervasiya tapılmadı.',
  PROFILE_NOT_FOUND: 'Profil məlumatı tapılmadı.',
  RATE_LIMIT_EXCEEDED: 'Çox sayda sorğu göndərildi. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
  NETWORK_ERROR: 'İnternet bağlantınızı yoxlayın və ya bir az sonra yenidən cəhd edin.',
  TIMEOUT_ERROR: 'Sorğu vaxtı bitdi. İnternet bağlantınızı yoxlayın və yenidən cəhd edin.',
  VALIDATION_ERROR: 'Daxil edilən məlumatlarda uyğunsuzluq var. Zəhmət olmasa yoxlayın.',
  INTERNAL_ERROR: 'Serverdə gözlənilməz xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.',
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any[];
  isNetworkError: boolean;

  constructor(code: string, message: string, status: number = 400, details?: any[], isNetworkError: boolean = false) {
    const userFriendlyMessage = ERROR_MESSAGES_AZ[code] || message || 'Gözlənilməz xəta baş verdi.';
    super(userFriendlyMessage);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeoutMs?: number;
}

/**
 * Əsas HTTP sorğu funksiyası.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, timeoutMs = DEFAULT_TIMEOUT_MS, headers: customHeaders, ...fetchOptions } = options;

  // Parametrləri URL-ə əlavə et
  let fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.append(key, value.join(','));
        }
      } else {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Device ID əldə et
  const deviceId = await getDeviceId();

  // Header-ləri hazırla
  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Device-Id', deviceId);

  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((val, key) => headers.set(key, val));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, val]) => headers.set(key, val));
    } else {
      Object.entries(customHeaders).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          headers.set(key, String(val));
        }
      });
    }
  }

  // AbortController ilə 15 saniyəlik timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!response.ok) {
      let errorCode = `HTTP_${response.status}`;
      let errorMessage = response.statusText || 'Sorğu uğursuz oldu';
      let details: any[] | undefined;

      if (isJson) {
        try {
          const errorBody = await response.json();
          if (errorBody && errorBody.error) {
            errorCode = errorBody.error.code || errorCode;
            errorMessage = errorBody.error.message || errorMessage;
            details = errorBody.error.details;
          } else if (errorBody && errorBody.detail) {
            if (typeof errorBody.detail === 'string') {
              errorMessage = errorBody.detail;
            } else if (Array.isArray(errorBody.detail)) {
              errorCode = 'VALIDATION_ERROR';
              details = errorBody.detail;
            }
          }
        } catch {
          // JSON parsing failed
        }
      }

      throw new ApiError(errorCode, errorMessage, response.status, details);
    }

    if (isJson) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      throw new ApiError(
        'TIMEOUT_ERROR',
        ERROR_MESSAGES_AZ.TIMEOUT_ERROR,
        408,
        undefined,
        true
      );
    }

    // Şəbəkə / Offline xətası
    throw new ApiError(
      'NETWORK_ERROR',
      ERROR_MESSAGES_AZ.NETWORK_ERROR,
      0,
      undefined,
      true
    );
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;

