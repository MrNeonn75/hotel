import { HOTELS } from '@/data/hotels';
import { Hotel, HotelSearchParams } from '@/types/hotel';
import api from './api';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';

export interface HotelPageResponse {
  items: Hotel[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface CityItem {
  name: string;
  hotelCount: number;
  description?: string;
}

const DEFAULT_MOCK_CITIES: CityItem[] = [
  { name: 'Bakı', hotelCount: 10, description: 'Paytaxt, dəniz sahili və zəngin gecə həyatı' },
  { name: 'Qəbələ', hotelCount: 6, description: 'Tufandağ, təbiət qoynunda istirahət' },
  { name: 'Şahdağ', hotelCount: 4, description: 'Qış xizək kurortu və dağ mənzərəsi' },
  { name: 'Quba', hotelCount: 5, description: 'Alma bağları və Qəçrəş meşələri' },
  { name: 'Şəki', hotelCount: 4, description: 'Xan Sarayı və tarixi karvansaralar' },
  { name: 'Lənkəran', hotelCount: 3, description: 'Sitrus bağları və subtropik təbiət' },
];

/**
 * Mock data üçün yerli filtrləmə (yalnız EXPO_PUBLIC_USE_MOCK=1 olduqda işləyir).
 */
function filterMockHotels(params?: HotelSearchParams): Hotel[] {
  let result = [...HOTELS];
  if (!params) return result;

  if (params.city && params.city.trim() !== '') {
    const qCity = params.city.trim().toLowerCase();
    result = result.filter((h) => h.city.toLowerCase().includes(qCity));
  }
  if (typeof params.minPrice === 'number') {
    result = result.filter((h) => h.discountedPrice >= params.minPrice!);
  }
  if (typeof params.maxPrice === 'number') {
    result = result.filter((h) => h.discountedPrice <= params.maxPrice!);
  }
  if (params.amenities && params.amenities.length > 0) {
    result = result.filter((h) =>
      params.amenities!.every((a) => h.amenities.includes(a))
    );
  }
  if (params.starRatings && params.starRatings.length > 0) {
    result = result.filter((h) => params.starRatings!.includes(h.starRating));
  }
  if (typeof params.minRating === 'number') {
    result = result.filter((h) => h.rating >= params.minRating!);
  }
  if (params.freeCancellationOnly) {
    result = result.filter((h) => h.freeCancellation);
  }
  if (params.dealsOnly) {
    result = result.filter((h) => Boolean(h.dealLabel));
  }
  if (params.category && params.category !== 'ALL') {
    result = result.filter((h) => h.htCategory === params.category);
  }
  if (params.searchQuery && params.searchQuery.trim() !== '') {
    const q = params.searchQuery.trim().toLowerCase();
    result = result.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.neighborhood.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
    );
  }
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'rating_desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount_desc':
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'recommended':
      default:
        result.sort((a, b) => {
          if (a.dealLabel && !b.dealLabel) return -1;
          if (!a.dealLabel && b.dealLabel) return 1;
          return b.rating - a.rating;
        });
        break;
    }
  }

  return result;
}

/**
 * Axtarış parametrlərini backend URL query parametrlərinə çevirir.
 */
function buildQueryParams(params?: HotelSearchParams, page = 1, pageSize = 20): Record<string, any> {
  const queryParams: Record<string, any> = {
    page,
    pageSize,
  };

  if (!params) return queryParams;

  if (params.city && params.city.trim()) queryParams.city = params.city.trim();
  if (params.searchQuery && params.searchQuery.trim()) queryParams.q = params.searchQuery.trim();
  if (typeof params.minPrice === 'number') queryParams.minPrice = params.minPrice;
  if (typeof params.maxPrice === 'number') queryParams.maxPrice = params.maxPrice;
  if (typeof params.minRating === 'number') queryParams.minRating = params.minRating;
  if (params.starRatings && params.starRatings.length > 0) {
    queryParams.minStars = Math.min(...params.starRatings);
  }
  if (params.amenities && params.amenities.length > 0) {
    queryParams.amenities = params.amenities.join(',');
  }
  if (params.dealsOnly) {
    queryParams.hasDiscount = true;
  }
  if (params.sortBy) {
    queryParams.sort = params.sortBy;
  }
  if (params.checkIn) queryParams.checkIn = params.checkIn;
  if (params.checkOut) queryParams.checkOut = params.checkOut;
  if (typeof params.guests === 'number') queryParams.guests = params.guests;

  return queryParams;
}

/**
 * Otellər siyahısını filtr və çeşidləmə parametrləri ilə gətirir.
 * Mövcud imza dəyişməz saxlanılır: getHotels(params?: HotelSearchParams): Promise<Hotel[]>
 */
export async function getHotels(params?: HotelSearchParams): Promise<Hotel[]> {
  if (USE_MOCK) {
    return filterMockHotels(params);
  }

  try {
    const queryParams = buildQueryParams(params, params?.page || 1, params?.pageSize || 20);
    const data = await api.get<{
      items: Hotel[];
      page: number;
      pageSize: number;
      total: number;
    }>('/hotels', { params: queryParams });

    let items = data?.items || [];

    if (params?.starRatings && params.starRatings.length > 0) {
      items = items.filter((h) => params.starRatings!.includes(h.starRating));
    }
    if (params?.freeCancellationOnly) {
      items = items.filter((h) => h.freeCancellation);
    }

    return items;
  } catch (error) {
    console.warn('API getHotels failed, falling back to local data:', error);
    return filterMockHotels(params);
  }
}

/**
 * Səhifələmə (infinite scroll) üçün otellər səhifəsini gətirir.
 */
export async function fetchHotelsPage(
  params?: HotelSearchParams,
  page = 1,
  pageSize = 10
): Promise<HotelPageResponse> {
  if (USE_MOCK) {
    const all = filterMockHotels(params);
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return {
      items,
      page,
      pageSize,
      total: all.length,
      hasNextPage: start + pageSize < all.length,
    };
  }

  try {
    const queryParams = buildQueryParams(params, page, pageSize);
    const data = await api.get<{
      items: Hotel[];
      page: number;
      pageSize: number;
      total: number;
    }>('/hotels', { params: queryParams });

    const total = data?.total || 0;
    let items = data?.items || [];

    if (params?.starRatings && params.starRatings.length > 0) {
      items = items.filter((h) => params.starRatings!.includes(h.starRating));
    }
    if (params?.freeCancellationOnly) {
      items = items.filter((h) => h.freeCancellation);
    }

    return {
      items,
      page: data?.page || page,
      pageSize: data?.pageSize || pageSize,
      total,
      hasNextPage: page * pageSize < total,
    };
  } catch (error) {
    console.warn('API fetchHotelsPage failed, falling back to local data:', error);
    const all = filterMockHotels(params);
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return {
      items,
      page,
      pageSize,
      total: all.length,
      hasNextPage: start + pageSize < all.length,
    };
  }
}

/**
 * Tək bir oteli ID-yə görə gətirir.
 * Mövcud imza dəyişməz saxlanılır: getHotelById(id: string): Promise<Hotel | null>
 */
export async function getHotelById(
  id: string,
  checkIn?: string,
  checkOut?: string
): Promise<Hotel | null> {
  if (USE_MOCK) {
    const found = HOTELS.find((h) => h.id === id);
    return found ? { ...found } : null;
  }

  try {
    const params: Record<string, any> = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;

    const data = await api.get<Hotel>(`/hotels/${id}`, { params });
    return data || null;
  } catch (error: any) {
    if (error?.status === 404 || error?.code === 'HOTEL_NOT_FOUND') {
      const found = HOTELS.find((h) => h.id === id);
      return found ? { ...found } : null;
    }
    const found = HOTELS.find((h) => h.id === id);
    return found ? { ...found } : null;
  }
}

/**
 * ID siyahısına görə otelləri gətirir (məs. Favoritlər, Tarixçə).
 * Mövcud imza dəyişməz saxlanılır: getHotelsByIds(ids: string[]): Promise<Hotel[]>
 */
export async function getHotelsByIds(ids: string[]): Promise<Hotel[]> {
  if (!ids || ids.length === 0) return [];

  if (USE_MOCK) {
    const idSet = new Set(ids);
    return HOTELS.filter((h) => idSet.has(h.id));
  }

  try {
    const items = await api.get<Hotel[]>('/hotels/by-ids', {
      params: { ids: ids.join(',') },
    });
    return items || [];
  } catch {
    // Şəbəkə xətası halında yerli keş və ya mock fallback
    const idSet = new Set(ids);
    return HOTELS.filter((h) => idSet.has(h.id));
  }
}

/**
 * Aktiv otellərin yerləşdiyi şəhərlər siyahısını serverdən gətirir.
 */
export async function getCities(): Promise<CityItem[]> {
  if (USE_MOCK) {
    return DEFAULT_MOCK_CITIES;
  }

  try {
    const serverCities = await api.get<{ name: string; hotelCount: number }[]>('/cities');
    if (serverCities && serverCities.length > 0) {
      // Mövcud təsvirləri əlavə et
      return serverCities.map((sc) => {
        const foundMock = DEFAULT_MOCK_CITIES.find(
          (m) => m.name.toLowerCase() === sc.name.toLowerCase()
        );
        return {
          name: sc.name,
          hotelCount: sc.hotelCount,
          description: foundMock?.description || `${sc.hotelCount} aktiv otel`,
        };
      });
    }
    return DEFAULT_MOCK_CITIES;
  } catch {
    return DEFAULT_MOCK_CITIES;
  }
}

export const hotelService = {
  getHotels,
  fetchHotelsPage,
  getHotelById,
  getHotelsByIds,
  getCities,
};

export default hotelService;
