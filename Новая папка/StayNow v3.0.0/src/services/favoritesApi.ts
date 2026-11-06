import { USE_MOCK } from '@/config/env';
import { request } from './httpClient';
import { delay } from './apiClient';

export const favoritesApi = {
  /**
   * Favorit otellərin yalnız ID siyahısını qaytarır
   */
  async getFavoriteIds(): Promise<string[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<string[]>('/api/v1/favorites/ids');
        if (Array.isArray(res)) {
          return res;
        }
      } catch {
        // Fallback
      }
    }
    return [];
  },

  /**
   * Oteli favoritlərə əlavə edir (PUT /api/v1/favorites/{hotel_id})
   */
  async addFavorite(hotelId: string): Promise<boolean> {
    if (!USE_MOCK) {
      try {
        await request<any>(`/api/v1/favorites/${hotelId}`, {
          method: 'PUT',
        });
        return true;
      } catch {
        // Fallback
      }
    }
    await delay(100, 200);
    return true;
  },

  /**
   * Oteli favoritlərdən silir (DELETE /api/v1/favorites/{hotel_id})
   */
  async removeFavorite(hotelId: string): Promise<boolean> {
    if (!USE_MOCK) {
      try {
        await request<any>(`/api/v1/favorites/${hotelId}`, {
          method: 'DELETE',
        });
        return true;
      } catch {
        // Fallback
      }
    }
    await delay(100, 200);
    return true;
  },

  /**
   * Lokal favoritləri serverlə birləşdirir (POST /api/v1/favorites/sync)
   */
  async syncFavorites(hotelIds: string[]): Promise<string[]> {
    if (!USE_MOCK && hotelIds.length > 0) {
      try {
        const res = await request<string[]>('/api/v1/favorites/sync', {
          method: 'POST',
          body: JSON.stringify({ hotelIds }),
        });
        if (Array.isArray(res)) {
          return res;
        }
      } catch {
        // Fallback
      }
    }
    return hotelIds;
  },
};

