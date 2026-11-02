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

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  rating: number;
  reviewCount: number;
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
}

