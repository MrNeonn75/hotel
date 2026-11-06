export type AmenityKey =
  | 'wifi'
  | 'breakfast'
  | 'parking'
  | 'gym'
  | 'pool'
  | 'spa'
  | 'ac'
  | 'restaurant'
  | 'airportShuttle'
  | 'petFriendly';

export type HTCategory =
  | 'LUXE'
  | 'HIP'
  | 'SOLID'
  | 'BASIC'
  | 'CHARMING'
  | 'CRASHPAD'
  | 'HIGHROLLER';

export interface RoomOption {
  id: string;
  name: string;
  bedType: string;
  capacity: number;
  pricePerNight: number;
  originalPrice: number;
  image: string;
  amenities: string[];
  freeCancellation: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  starRating: number; // 1-5
  rating: number; // 0-10 miqyası, məs. 8.7
  reviewLabel: string; // "Müstəsna", "Mükəmməl", "Çox yaxşı", "Yaxşı"
  reviewCount: number;
  tagline: string; // 1 cümləlik "Nəyə görə seçməlisiniz" mətni
  description: string;
  standardPrice: number;
  discountedPrice: number;
  discountPercent: number;
  currency: 'AZN';
  amenities: AmenityKey[];
  advantages: string[];
  rules: string[];
  importantInfo: string[];
  checkInTime: string;
  checkOutTime: string;
  freeCancellation: boolean;
  roomsLeft: number | null;
  dealLabel: string | null; // məs. "Bu gecənin təklifi"
  htCategory?: HTCategory; // HotelTonight Tier
  whyWeLikeIt?: string[]; // HotelTonight 3 signature perks
  theVibe?: string; // HotelTonight vibe description
  roomOptions?: RoomOption[];
}

export type SortOption =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'discount_desc';

export interface HotelSearchParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: AmenityKey[];
  starRatings?: number[];
  minRating?: number;
  freeCancellationOnly?: boolean;
  dealsOnly?: boolean;
  searchQuery?: string;
  sortBy?: SortOption;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  page?: number;
  pageSize?: number;
  category?: HTCategory | 'ALL';
}