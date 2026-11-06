import api from './api';
import { Hotel } from '@/types/hotel';

export interface FavoriteActionResponse {
  hotelId: string;
  isFavorite: boolean;
  message: string;
}

/**
 * Cari istifadəçinin bütün favorit otellərini gətirir.
 */
export async function getFavorites(): Promise<Hotel[]> {
  const items = await api.get<Hotel[]>('/favorites');
  return items || [];
}

/**
 * UI-dakı ürək ikonlarını sürətli göstərmək üçün yalnız favorit otel ID-lərini gətirir.
 */
export async function getFavoriteIds(): Promise<string[]> {
  const ids = await api.get<string[]>('/favorites/ids');
  return ids || [];
}

/**
 * Oteli favoritlərə əlavə edir.
 */
export async function addFavorite(hotelId: string): Promise<FavoriteActionResponse> {
  return await api.put<FavoriteActionResponse>(`/favorites/${hotelId}`);
}

/**
 * Oteli favoritlərdən silir.
 */
export async function removeFavorite(hotelId: string): Promise<void> {
  await api.delete(`/favorites/${hotelId}`);
}

/**
 * Lokal keşlənmiş favoritləri serverlə birləşdirir (union).
 */
export async function syncFavorites(hotelIds: string[]): Promise<string[]> {
  const merged = await api.post<string[]>('/favorites/sync', { hotelIds });
  return merged || [];
}

export const favoriteService = {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
  syncFavorites,
};

export default favoriteService;

