/**
 * StayNow Mühit Konfiqurasiyası
 * 
 * Baza URL:
 * - Real server (HTTP): 'http://207.180.233.253:18000'
 * - Real server (HTTPS): 'https://207.180.233.253:18443'
 * - Android Emulator lokal test: 'http://10.0.2.2:8000'
 * - iOS Simulator / Web lokal test: 'http://localhost:8000'
 */

export const API_BASE_URL = 'http://207.180.233.253:18000';

/**
 * Mock rejimi bayrağı:
 * - false: Real backend API ilə işləyir (server xətası olduqda zərif şəkildə mock fallback verir)
 * - true: Yalnız lokal mock data ilə işləyir
 */
export const USE_MOCK = false;

/**
 * Sorğunun maksimum gözləmə müddəti (millisaniyə)
 */
export const API_TIMEOUT_MS = 15000;
