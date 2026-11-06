import { useQuery } from '@tanstack/react-query';
import { hotelsApi, HotelSearchParams } from './hotelsApi';
import { bookingsApi } from './bookingsApi';

export const QUERY_KEYS = {
  hotels: ['hotels'] as const,
  hotel: (id: string) => ['hotels', id] as const,
  hotelsByIds: (ids: string[]) => ['hotels', 'by-ids', ...ids] as const,
  tonightOffers: ['hotels', 'tonight'] as const,
  collections: ['collections'] as const,
  collection: (id: string) => ['collections', id] as const,
  collectionHotels: (id: string) => ['collections', id, 'hotels'] as const,
  reviews: (hotelId: string) => ['reviews', hotelId] as const,
  search: (params: HotelSearchParams) => ['hotels', 'search', params] as const,
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
};

export function useHotelsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.hotels,
    queryFn: () => hotelsApi.getHotels(),
  });
}

export function useHotelQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.hotel(id),
    queryFn: () => hotelsApi.getHotelById(id),
    enabled: Boolean(id),
  });
}

export function useHotelsByIdsQuery(ids: string[]) {
  return useQuery({
    queryKey: QUERY_KEYS.hotelsByIds(ids),
    queryFn: () => hotelsApi.getHotelsByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useTonightOffersQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.tonightOffers,
    queryFn: () => hotelsApi.getTonightOffers(),
  });
}

export function useCollectionsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.collections,
    queryFn: () => hotelsApi.getCollections(),
  });
}

export function useCollectionQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.collection(id),
    queryFn: () => hotelsApi.getCollectionById(id),
    enabled: Boolean(id),
  });
}

export function useHotelsByCollectionQuery(collectionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.collectionHotels(collectionId),
    queryFn: () => hotelsApi.getHotelsByCollection(collectionId),
    enabled: Boolean(collectionId),
  });
}

export function useHotelReviewsQuery(hotelId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews(hotelId),
    queryFn: () => hotelsApi.getHotelReviews(hotelId),
    enabled: Boolean(hotelId),
  });
}

export function useSearchHotelsQuery(params: HotelSearchParams) {
  return useQuery({
    queryKey: QUERY_KEYS.search(params),
    queryFn: () => hotelsApi.searchHotels(params),
  });
}

export function useSearchHotelsPaginatedQuery(params: HotelSearchParams, page = 1, limit = 6) {
  return useQuery({
    queryKey: ['hotels', 'paginated', params, page, limit],
    queryFn: () => hotelsApi.searchHotelsPaginated(params, page, limit),
  });
}

export function useCountHotelsQuery(params: HotelSearchParams) {
  return useQuery({
    queryKey: ['hotels', 'count', params],
    queryFn: () => hotelsApi.countMatchingHotels(params),
  });
}

export function useBookingsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.bookings,
    queryFn: () => bookingsApi.getBookings(),
  });
}

export function useBookingQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.booking(id),
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: Boolean(id),
  });
}

