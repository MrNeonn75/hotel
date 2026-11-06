import {
  AmenityKey,
  Collection,
  Hotel,
  HotelCategory,
  Review,
  SortOption,
} from '@/types/hotel';
import { USE_MOCK } from '@/config/env';
import { MOCK_COLLECTIONS } from '@/data/mock/collections';
import { MOCK_HOTELS } from '@/data/mock/hotels';
import { MOCK_REVIEWS } from '@/data/mock/reviews';
import { request } from './httpClient';
import {
  BackendCollectionItem,
  BackendHotelItem,
  BackendReviewItem,
  mapBackendCollectionToFrontend,
  mapBackendHotelToFrontend,
  mapBackendReviewToFrontend,
} from './mappers';
import { delay } from './apiClient';

export interface HotelSearchParams {
  query?: string;
  category?: string;
  categories?: HotelCategory[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number | null;
  amenities?: AmenityKey[];
  tonightOnly?: boolean;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedHotelsResponse {
  hotels: Hotel[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

const BAKU_CENTER = {
  latitude: 40.3695,
  longitude: 49.84,
};

function getDistanceToCenter(lat: number, lng: number): number {
  const dLat = lat - BAKU_CENTER.latitude;
  const dLng = lng - BAKU_CENTER.longitude;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function filterAndSortMockHotels(params: HotelSearchParams): Hotel[] {
  let results = [...MOCK_HOTELS];

  if (params.query) {
    const q = params.query.toLowerCase().trim();
    results = results.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q)
    );
  }

  if (params.categories && params.categories.length > 0) {
    results = results.filter((h) => params.categories!.includes(h.category));
  } else if (params.category) {
    results = results.filter((h) => h.category === params.category);
  }

  if (params.tonightOnly) {
    results = results.filter((h) => h.isTonightOffer);
  }

  if (params.minPrice !== undefined) {
    results = results.filter((h) => h.discountedPrice >= (params.minPrice ?? 0));
  }

  if (params.maxPrice !== undefined) {
    results = results.filter((h) => h.discountedPrice <= (params.maxPrice ?? Infinity));
  }

  if (params.minRating !== undefined && params.minRating !== null) {
    const threshold = params.minRating > 5 ? params.minRating / 2 : params.minRating;
    results = results.filter((h) => h.rating >= threshold);
  }

  if (params.amenities && params.amenities.length > 0) {
    results = results.filter((h) =>
      params.amenities!.every((a) => h.amenities.includes(a))
    );
  }

  // Sort
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'price_low':
        results.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'price_high':
        results.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        results.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'distance':
        results.sort(
          (a, b) =>
            getDistanceToCenter(a.coordinates.latitude, a.coordinates.longitude) -
            getDistanceToCenter(b.coordinates.latitude, b.coordinates.longitude)
        );
        break;
      case 'recommended':
      default:
        results.sort((a, b) => {
          if (a.isTonightOffer !== b.isTonightOffer) {
            return a.isTonightOffer ? -1 : 1;
          }
          return b.rating - a.rating;
        });
        break;
    }
  }

  return results;
}

export const hotelsApi = {
  /**
   * Bütün otelləri qaytarır (Backend: GET /api/v1/hotels)
   */
  async getHotels(): Promise<Hotel[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<{ items: BackendHotelItem[] }>('/api/v1/hotels?pageSize=50');
        if (res.items && res.items.length > 0) {
          return res.items.map(mapBackendHotelToFrontend);
        }
      } catch {
        // Fallback to mock on connection error
      }
    }

    await delay(250, 400);
    return [...MOCK_HOTELS];
  },

  /**
   * ID üzrə tək otel detalını qaytarır
   */
  async getHotelById(id: string): Promise<Hotel | null> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendHotelItem>(`/api/v1/hotels/${id}`);
        if (res && res.id) {
          return mapBackendHotelToFrontend(res);
        }
      } catch {
        // Fallback to mock
      }
    }

    await delay(200, 350);
    const hotel = MOCK_HOTELS.find((h) => h.id === id);
    return hotel ? { ...hotel } : null;
  },

  /**
   * Çoxsaylı ID-lər üzrə otelləri qaytarır (Seçilmişlər üçün)
   */
  async getHotelsByIds(ids: string[]): Promise<Hotel[]> {
    if (ids.length === 0) return [];

    if (!USE_MOCK) {
      try {
        const res = await request<BackendHotelItem[]>(
          `/api/v1/hotels/by-ids?ids=${encodeURIComponent(ids.join(','))}`
        );
        if (Array.isArray(res)) {
          return res.map(mapBackendHotelToFrontend);
        }
      } catch {
        // Fallback to mock
      }
    }

    await delay(200, 350);
    return MOCK_HOTELS.filter((h) => ids.includes(h.id));
  },

  /**
   * "Bu gecə" üçün xüsusi təklifləri qaytarır
   */
  async getTonightOffers(): Promise<Hotel[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<{ items: BackendHotelItem[] }>(
          '/api/v1/hotels?hasDiscount=true&sort=discount_desc&pageSize=10'
        );
        if (res.items && res.items.length > 0) {
          return res.items.map(mapBackendHotelToFrontend);
        }
      } catch {
        // Fallback to mock
      }
    }

    await delay(250, 400);
    return MOCK_HOTELS.filter((h) => h.isTonightOffer);
  },

  /**
   * Bütün kolleksiyaları qaytarır (Backend: GET /api/v1/collections)
   */
  async getCollections(): Promise<Collection[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendCollectionItem[]>('/api/v1/collections');
        if (Array.isArray(res) && res.length > 0) {
          return res.map(mapBackendCollectionToFrontend);
        }
      } catch {
        // Fallback
      }
    }

    await delay(200, 350);
    return [...MOCK_COLLECTIONS];
  },

  /**
   * ID üzrə kolleksiyanı qaytarır (Backend: GET /api/v1/collections/{id})
   */
  async getCollectionById(id: string): Promise<Collection | null> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendCollectionItem>(`/api/v1/collections/${id}`);
        if (res && res.id) {
          return mapBackendCollectionToFrontend(res);
        }
      } catch {
        // Fallback
      }
    }

    await delay(200, 350);
    const col = MOCK_COLLECTIONS.find((c) => c.id === id);
    return col ? { ...col } : null;
  },

  /**
   * Kolleksiyaya daxil olan otelləri qaytarır (Backend: GET /api/v1/collections/{id}/hotels)
   */
  async getHotelsByCollection(collectionId: string): Promise<Hotel[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendHotelItem[]>(`/api/v1/collections/${collectionId}/hotels`);
        if (Array.isArray(res) && res.length > 0) {
          return res.map(mapBackendHotelToFrontend);
        }
      } catch {
        // Fallback
      }
    }

    await delay(250, 400);
    const col = MOCK_COLLECTIONS.find((c) => c.id === collectionId);
    if (!col) return [];
    return MOCK_HOTELS.filter((h) => col.hotelIds.includes(h.id));
  },

  /**
   * Otelə aid rəyləri qaytarır (Backend: GET /api/v1/hotels/{id}/reviews)
   */
  async getHotelReviews(hotelId: string): Promise<Review[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<{ items: BackendReviewItem[]; total: number }>(`/api/v1/hotels/${hotelId}/reviews`);
        if (res && Array.isArray(res.items)) {
          return res.items.map(mapBackendReviewToFrontend);
        }
      } catch {
        // Fallback
      }
    }

    await delay(200, 350);
    return MOCK_REVIEWS.filter((r) => r.hotelId === hotelId);
  },

  /**
   * Filtrlərə uyğun gələn otellərin sayını qaytarır
   */
  async countMatchingHotels(params: HotelSearchParams): Promise<number> {
    if (!USE_MOCK) {
      try {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('q', params.query);
        if (params.minPrice !== undefined) queryParams.append('minPrice', String(params.minPrice));
        if (params.maxPrice !== undefined) queryParams.append('maxPrice', String(params.maxPrice));
        if (params.minRating) queryParams.append('minRating', String(params.minRating));
        if (params.tonightOnly) queryParams.append('hasDiscount', 'true');
        if (params.amenities && params.amenities.length > 0) {
          queryParams.append('amenities', params.amenities.join(','));
        }
        queryParams.append('page', '1');
        queryParams.append('pageSize', '1');

        const res = await request<{ total: number }>(`/api/v1/hotels?${queryParams.toString()}`);
        if (typeof res.total === 'number') {
          return res.total;
        }
      } catch {
        // Fallback
      }
    }

    const list = filterAndSortMockHotels(params);
    return list.length;
  },

  /**
   * Axtarış və filtrləmə (Bütün nəticələr)
   */
  async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
    const res = await this.searchHotelsPaginated(params, 1, 50);
    return res.hotels;
  },

  /**
   * Səhifələmə (Infinite scroll)
   */
  async searchHotelsPaginated(
    params: HotelSearchParams,
    page = 1,
    limit = 6
  ): Promise<PaginatedHotelsResponse> {
    if (!USE_MOCK) {
      try {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('q', params.query);
        if (params.minPrice !== undefined) queryParams.append('minPrice', String(params.minPrice));
        if (params.maxPrice !== undefined) queryParams.append('maxPrice', String(params.maxPrice));
        if (params.minRating) queryParams.append('minRating', String(params.minRating));
        if (params.tonightOnly) queryParams.append('hasDiscount', 'true');

        if (params.sortBy) {
          const sortMap: Record<string, string> = {
            price_low: 'price_asc',
            price_high: 'price_desc',
            rating: 'rating_desc',
            discount: 'discount_desc',
            recommended: 'recommended',
          };
          queryParams.append('sort', sortMap[params.sortBy] || 'recommended');
        }

        if (params.amenities && params.amenities.length > 0) {
          queryParams.append('amenities', params.amenities.join(','));
        }

        queryParams.append('page', String(page));
        queryParams.append('pageSize', String(limit));

        const res = await request<{
          items: BackendHotelItem[];
          total: number;
          page: number;
          pageSize: number;
        }>(`/api/v1/hotels?${queryParams.toString()}`);

        if (res && Array.isArray(res.items)) {
          const total = res.total;
          const totalPages = Math.ceil(total / limit);
          return {
            hotels: res.items.map(mapBackendHotelToFrontend),
            total,
            page,
            totalPages,
            hasMore: page < totalPages,
          };
        }
      } catch {
        // Fallback to mock
      }
    }

    await delay(300, 450);
    const allFiltered = filterAndSortMockHotels(params);
    const total = allFiltered.length;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const hotels = allFiltered.slice(0, startIndex + limit);

    return {
      hotels,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  },
};
