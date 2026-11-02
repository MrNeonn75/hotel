export * from './hotel';

export type PreferredLanguage = 'AZ' | 'EN' | 'RU';
export type PreferredTheme = 'system' | 'light' | 'dark';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate?: string;
  nationality?: string;
  documentNumber?: string;
  city?: string;
  address?: string;
  preferredLanguage?: PreferredLanguage;
  preferredTheme?: PreferredTheme;
}

export interface BookingHistoryItem {
  id: string; // e.g. "SN-2026-9481"
  hotelId: string;
  hotel: {
    id: string;
    name: string;
    city: string;
    address: string;
    image: string;
    rating: number;
    discountedPrice: number;
  };
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  adultsCount: number;
  childrenCount: number;
  totalPrice: number;
  specialRequests?: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export type Booking = BookingHistoryItem;

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  preferredCurrency: string;
  language: string;
}
