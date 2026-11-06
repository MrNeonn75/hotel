import api from './api';
import { Hotel } from '@/types/hotel';

export interface BookingCreatePayload {
  hotelId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialRequests?: string;
}

export interface BookingItemResponse {
  id: string;
  reference: string;
  hotel?: Partial<Hotel> | null;
  hotelSnapshot?: {
    name: string;
    address: string;
    image: string;
  } | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  pricePerNight: number;
  discountAmount: number;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialRequests?: string | null;
  hotelId?: string | null;
  cancelledAt?: string | null;
}

export interface AvailabilityResponse {
  available: boolean;
  roomsLeft: number;
}

/**
 * Yeni rezervasiya yaradır. Idempotency-Key ilə dublikatların qarşısı alınır.
 */
export async function createBooking(
  payload: BookingCreatePayload,
  idempotencyKey: string
): Promise<BookingItemResponse> {
  return await api.post<BookingItemResponse>('/bookings', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
}

/**
 * İstifadəçinin bütün rezervasiya tarixçəsini gətirir.
 */
export async function getBookings(
  statusFilter?: 'confirmed' | 'cancelled' | 'completed'
): Promise<BookingItemResponse[]> {
  const params: Record<string, any> = {};
  if (statusFilter) {
    params.status = statusFilter;
  }
  const items = await api.get<BookingItemResponse[]>('/bookings', { params });
  return items || [];
}

/**
 * Tək bir rezervasiyanı ID və ya arayış koduna (reference) görə gətirir.
 */
export async function getBookingById(bookingId: string): Promise<BookingItemResponse> {
  return await api.get<BookingItemResponse>(`/bookings/${bookingId}`);
}

/**
 * Rezervasiyanı ləğv edir. (Yalnız girişə ən azı 24 saat qalmışsa mümkündür)
 */
export async function cancelBooking(bookingId: string): Promise<BookingItemResponse> {
  return await api.post<BookingItemResponse>(`/bookings/${bookingId}/cancel`);
}

/**
 * Otelin seçilmiş tarixlərdə boş otaq sayını yoxlayır.
 */
export async function checkAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: number = 1
): Promise<AvailabilityResponse> {
  return await api.get<AvailabilityResponse>(`/hotels/${hotelId}/availability`, {
    params: {
      checkIn,
      checkOut,
      guests,
    },
  });
}

export const bookingService = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
};

export default bookingService;

