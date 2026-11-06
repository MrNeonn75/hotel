import { AmenityKey, Booking, Collection, Hotel, HotelCategory, Review, Room } from '@/types/hotel';

export interface BackendRoomItem {
  id: string;
  hotelId?: string;
  name: string;
  capacity: number;
  bedType: string;
  breakfastPolicy: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  features: string[];
}

export interface BackendHotelItem {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  images?: string[];
  rating: number;
  reviewCount?: number;
  description?: string;
  standardPrice: number;
  discountedPrice: number;
  discountPercent?: number;
  currency?: string;
  amenities?: string[];
  advantages?: string[];
  rules?: string[];
  importantInfo?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  distanceKm?: number | null;
  isActive?: boolean;
  rooms?: BackendRoomItem[];
}

export interface BackendBookingItem {
  id: string;
  reference: string;
  hotel?: { name?: string; address?: string; image?: string } | null;
  hotelSnapshot?: { name?: string; address?: string; image?: string } | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  pricePerNight: number;
  discountAmount?: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialRequests?: string | null;
  hotelId?: string | null;
}

export interface BackendReviewItem {
  id: string;
  hotelId: string;
  userName: string;
  userAvatar?: string | null;
  userCountry?: string;
  rating: number;
  date: string;
  comment: string;
  roomType?: string | null;
}

export interface BackendCollectionItem {
  id: string;
  slug?: string | null;
  title: string;
  subtitle: string;
  image: string;
  hotelIds: string[];
  hotelCount: number;
}

/**
 * Bakı ünvanından rayonu çıxarır
 */
function extractDistrict(address: string): string {
  const lower = address.toLowerCase();
  if (lower.includes('səbail') || lower.includes('sabail')) return 'Səbail';
  if (lower.includes('nəsimi') || lower.includes('nasimi')) return 'Nəsimi';
  if (lower.includes('yasamal')) return 'Yasamal';
  if (lower.includes('nərimanov') || lower.includes('narimanov')) return 'Nərimanov';
  if (lower.includes('xətai') || lower.includes('khatai')) return 'Xətai';
  if (lower.includes('pirallahı')) return 'Pirallahı';
  if (lower.includes('sabunçu')) return 'Sabunçu';
  return 'Mərkəz';
}

/**
 * Otel adından və ya reytinqindən kateqoriyanı təyin edir
 */
function inferCategory(name: string, rating: number, price: number): HotelCategory {
  const lower = name.toLowerCase();
  if (lower.includes('boutique') || lower.includes('butik')) return 'Butik';
  if (lower.includes('resort') || lower.includes('spa')) return 'Resort';
  if (price > 250 || rating >= 4.8) return 'Lüks';
  if (lower.includes('inn') || lower.includes('express') || price < 100) return 'Büdcə';
  return 'Biznes';
}

/**
 * Backend otel obyektini frontend Hotel tipinə çevirir
 */
export function mapBackendHotelToFrontend(item: BackendHotelItem): Hotel {
  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'];

  const district = extractDistrict(item.address);
  const category = inferCategory(item.name, item.rating, item.discountedPrice);

  const rooms: Room[] = (item.rooms && item.rooms.length > 0)
    ? item.rooms.map((r) => ({
        id: r.id,
        name: r.name,
        capacity: r.capacity || 2,
        bedType: r.bedType,
        breakfastPolicy: r.breakfastPolicy,
        price: r.price,
        originalPrice: r.originalPrice ?? undefined,
        image: r.image || images[0],
        features: r.features || [],
      }))
    : [
        {
          id: `room-${item.id}-std`,
          name: 'Standart King Otaq',
          capacity: 2,
          bedType: '1 böyük iki nəfərlik çarpayı',
          breakfastPolicy: item.amenities?.includes('breakfast') ? 'Səhər yeməyi daxildir' : 'Səhər yeməyi əlavə 25 ₼',
          price: item.discountedPrice,
          originalPrice: item.standardPrice,
          image: images[0],
          features: ['28 m²', 'Şəhər mənzərəsi', 'Pulsuz Wi-Fi', 'Kondisioner', 'Mini-bar'],
        },
        {
          id: `room-${item.id}-dlx`,
          name: 'Deluxe Suite Dəniz Mənzərəsi',
          capacity: 3,
          bedType: '1 King çarpayı + 1 divan',
          breakfastPolicy: 'Səhər yeməyi daxildir',
          price: Math.round(item.discountedPrice * 1.35),
          originalPrice: Math.round(item.standardPrice * 1.35),
          image: images[1] || images[0],
          features: ['45 m²', 'Dəniz panoraması', 'Balkon', 'Jakuzi', 'Nespresso maşını'],
        },
      ];

  return {
    id: item.id,
    name: item.name,
    category,
    address: item.address,
    district,
    city: item.city || 'Bakı',
    coordinates: {
      latitude: item.latitude,
      longitude: item.longitude,
    },
    rating: item.rating,
    reviewCount: item.reviewCount || 0,
    description: item.description || `${item.name} Bakının mərkəzində yüksək komfort və xidmət təklif edir.`,
    images,
    amenities: (item.amenities || ['wifi', 'parking', 'ac', 'restaurant']) as AmenityKey[],
    rules: item.rules && item.rules.length > 0 ? item.rules : [
      'Giriş (check-in) saatı 14:00-dan başlayır',
      'Çıxış (check-out) saatı 12:00-dəkdir',
      'Otaqlarda siqaret çəkmək qadağandır',
    ],
    cancellationPolicy: 'Girişə 24 saat qalmışadək pulsuz ləğvetmə. 100% geri qaytarılma.',
    checkInTime: item.checkInTime || '14:00',
    checkOutTime: item.checkOutTime || '12:00',
    standardPrice: item.standardPrice,
    discountedPrice: item.discountedPrice,
    discountPercent: item.discountPercent || Math.max(0, Math.round(((item.standardPrice - item.discountedPrice) / item.standardPrice) * 100)),
    isTonightOffer: (item.discountPercent || 0) > 0,
    taxNote: 'Bütün vergilər daxildir',
    rooms,
  };
}

/**
 * Backend rezervasiya obyektini frontend Booking tipinə çevirir
 */
export function mapBackendBookingToFrontend(item: BackendBookingItem): Booking {
  const hotelName = item.hotel?.name || item.hotelSnapshot?.name || 'Otel';
  const hotelAddress = item.hotel?.address || item.hotelSnapshot?.address || 'Bakı şəhəri';
  const hotelImage = item.hotel?.image || item.hotelSnapshot?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

  let status: 'confirmed' | 'completed' | 'cancelled' = 'confirmed';
  if (item.status === 'cancelled') status = 'cancelled';
  else if (item.status === 'completed') status = 'completed';

  return {
    id: item.id,
    hotelId: item.hotelId || 'h1',
    hotelName,
    hotelImage,
    hotelAddress,
    roomType: 'Standart King Otaq',
    checkInDate: item.checkIn,
    checkOutDate: item.checkOut,
    nights: item.nights || 1,
    guests: {
      adults: item.adults || 1,
      children: item.children || 0,
      rooms: 1,
    },
    guestInfo: {
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || '',
      phone: item.phone || '',
      specialRequests: item.specialRequests || '',
    },
    totalPrice: item.totalPrice,
    status,
    bookingCode: item.reference || `SN-${item.id.slice(0, 6).toUpperCase()}`,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

/**
 * Backend review obyektini frontend Review tipinə çevirir
 */
export function mapBackendReviewToFrontend(item: BackendReviewItem): Review {
  return {
    id: item.id,
    hotelId: item.hotelId,
    userName: item.userName,
    userAvatar: item.userAvatar || undefined,
    userCountry: item.userCountry || 'Azərbaycan',
    rating: item.rating,
    date: item.date,
    comment: item.comment,
    roomType: item.roomType || undefined,
  };
}

/**
 * Backend collection obyektini frontend Collection tipinə çevirir
 */
export function mapBackendCollectionToFrontend(item: BackendCollectionItem): Collection {
  return {
    id: item.slug || item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
    hotelIds: item.hotelIds || [],
    hotelCount: item.hotelCount || (item.hotelIds ? item.hotelIds.length : 0),
  };
}
