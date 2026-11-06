export type AmenityKey =
  | 'wifi'
  | 'breakfast'
  | 'parking'
  | 'gym'
  | 'pool'
  | 'spa'
  | 'ac'
  | 'restaurant'
  | 'reception24'
  | 'bar'
  | 'airportShuttle'
  | 'petFriendly';

export type HotelCategory = 'Butik' | 'Biznes' | 'Lüks' | 'Büdcə' | 'Resort';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  bedType: string;
  breakfastPolicy: string;
  price: number;
  originalPrice?: number;
  image: string;
  features: string[];
}

export interface Hotel {
  id: string;
  name: string;
  category: HotelCategory;
  address: string;
  district: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  amenities: AmenityKey[];
  rules: string[];
  cancellationPolicy: string;
  checkInTime: string;
  checkOutTime: string;
  standardPrice: number;
  discountedPrice: number;
  discountPercent: number;
  isTonightOffer: boolean;
  taxNote: string;
  rooms: Room[];
}

export interface Review {
  id: string;
  hotelId: string;
  userName: string;
  userAvatar?: string;
  userCountry: string;
  rating: number;
  date: string;
  comment: string;
  roomType?: string;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  hotelIds: string[];
  hotelCount: number;
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  hotelAddress: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  totalPrice: number;
  status: BookingStatus;
  bookingCode: string;
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface SearchState {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
}

export type SortOption =
  | 'recommended'
  | 'price_low'
  | 'price_high'
  | 'rating'
  | 'distance'
  | 'discount';

export interface FilterState {
  priceRange: [number, number];
  minRating: number | null;
  amenities: AmenityKey[];
  categories: HotelCategory[];
  tonightOnly: boolean;
  sortBy: SortOption;
}

export interface BookingDraft {
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  hotelAddress: string;
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  nightlyPrice: number;
  basePrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  savings: number;
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
    estimatedArrivalTime?: string;
  };
}


