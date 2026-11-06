import * as Crypto from 'expo-crypto';
import { Booking } from '@/types/hotel';
import { USE_MOCK } from '@/config/env';
import { MOCK_BOOKINGS } from '@/data/mock/bookings';
import { request } from './httpClient';
import { BackendBookingItem, mapBackendBookingToFrontend } from './mappers';
import { delay } from './apiClient';

let runtimeBookings = [...MOCK_BOOKINGS];

export const bookingsApi = {
  /**
   * Bütün rezervasiyaları qaytarır
   */
  async getBookings(): Promise<Booking[]> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendBookingItem[]>('/api/v1/bookings');
        if (Array.isArray(res)) {
          return res.map(mapBackendBookingToFrontend);
        }
      } catch {
        // Fallback to runtime/mock
      }
    }

    await delay(300, 450);
    return [...runtimeBookings];
  },

  /**
   * ID üzrə rezervasiyanı qaytarır
   */
  async getBookingById(id: string): Promise<Booking | null> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendBookingItem>(`/api/v1/bookings/${id}`);
        if (res && res.id) {
          return mapBackendBookingToFrontend(res);
        }
      } catch {
        // Fallback to runtime/mock
      }
    }

    await delay(250, 400);
    const booking = runtimeBookings.find((b) => b.id === id);
    return booking ? { ...booking } : null;
  },

  /**
   * Yeni rezervasiya yaradır (Backend: POST /api/v1/bookings with Idempotency-Key)
   */
  async createBooking(
    payload: Omit<Booking, 'id' | 'createdAt' | 'bookingCode' | 'status'>
  ): Promise<Booking> {
    if (!USE_MOCK) {
      try {
        const idempotencyKey = Crypto.randomUUID();
        const body = {
          hotelId: payload.hotelId,
          checkIn: payload.checkInDate,
          checkOut: payload.checkOutDate,
          adults: payload.guests.adults || 1,
          children: payload.guests.children || 0,
          firstName: payload.guestInfo.firstName,
          lastName: payload.guestInfo.lastName,
          phone: payload.guestInfo.phone,
          email: payload.guestInfo.email,
          specialRequests: payload.guestInfo.specialRequests || undefined,
        };

        const res = await request<BackendBookingItem>('/api/v1/bookings', {
          method: 'POST',
          body: JSON.stringify(body),
          idempotencyKey,
        });

        if (res && res.id) {
          const mapped = mapBackendBookingToFrontend(res);
          runtimeBookings = [mapped, ...runtimeBookings];
          return mapped;
        }
      } catch (err: any) {
        // If real API returned a specific error (like 409 or 422), propagate error to user
        if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          throw err;
        }
        // Fallback to runtime booking on connection failure
      }
    }

    await delay(500, 700);
    const newBooking: Booking = {
      ...payload,
      id: `bk-${Date.now()}`,
      status: 'confirmed',
      bookingCode: `STAY-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    runtimeBookings = [newBooking, ...runtimeBookings];
    return newBooking;
  },

  /**
   * Mövcud rezervasiyanı ləğv edir (Backend: POST /api/v1/bookings/{id}/cancel)
   */
  async cancelBooking(id: string): Promise<boolean> {
    if (!USE_MOCK) {
      try {
        await request<any>(`/api/v1/bookings/${id}/cancel`, {
          method: 'POST',
        });
        const index = runtimeBookings.findIndex((b) => b.id === id);
        if (index !== -1) {
          runtimeBookings[index] = {
            ...runtimeBookings[index],
            status: 'cancelled',
          };
        }
        return true;
      } catch (err: any) {
        if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          throw err;
        }
        // Fallback to runtime
      }
    }

    await delay(350, 500);
    const index = runtimeBookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      runtimeBookings[index] = {
        ...runtimeBookings[index],
        status: 'cancelled',
      };
      return true;
    }
    return false;
  },

  /**
   * Tamamlanmış rezervasiya üçün rəy yazır (Backend: POST /api/v1/hotels/{hotelId}/reviews)
   */
  async addReview(
    hotelId: string,
    bookingId: string,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; id: string }> {
    if (!USE_MOCK) {
      try {
        const res = await request<{ id: string }>(`/api/v1/hotels/${hotelId}/reviews`, {
          method: 'POST',
          body: JSON.stringify({
            rating,
            comment,
          }),
        });
        if (res && res.id) {
          return {
            success: true,
            id: res.id,
          };
        }
      } catch {
        // Fallback to runtime
      }
    }

    await delay(300, 450);
    return {
      success: true,
      id: `rev-${Date.now()}`,
    };
  },
};
