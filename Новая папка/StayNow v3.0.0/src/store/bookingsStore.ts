import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingDraft } from '@/types/hotel';
import { MOCK_BOOKINGS } from '@/data/mock/bookings';

interface BookingsState {
  bookings: Booking[];
  bookingDraft: BookingDraft | null;
  selectedRooms: Record<string, string>; // hotelId -> roomId
  reviews: Record<string, { rating: number; comment: string; date: string }>; // bookingId -> review
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  getBookingById: (bookingId: string) => Booking | undefined;
  setBookingDraft: (draft: BookingDraft | null) => void;
  setSelectedRoom: (hotelId: string, roomId: string) => void;
  getSelectedRoomId: (hotelId: string) => string | undefined;
  addReview: (bookingId: string, rating: number, comment: string) => void;
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: MOCK_BOOKINGS,
      bookingDraft: null,
      selectedRooms: {},
      reviews: {},

      addBooking: (booking: Booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),

      cancelBooking: (bookingId: string) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        })),

      getBookingById: (bookingId: string) => {
        return get().bookings.find((b) => b.id === bookingId);
      },

      setBookingDraft: (draft: BookingDraft | null) =>
        set({ bookingDraft: draft }),

      setSelectedRoom: (hotelId: string, roomId: string) =>
        set((state) => ({
          selectedRooms: {
            ...state.selectedRooms,
            [hotelId]: roomId,
          },
        })),

      getSelectedRoomId: (hotelId: string) => {
        return get().selectedRooms[hotelId];
      },

      addReview: (bookingId: string, rating: number, comment: string) =>
        set((state) => ({
          reviews: {
            ...state.reviews,
            [bookingId]: {
              rating,
              comment,
              date: new Date().toLocaleDateString('az-AZ'),
            },
          },
        })),
    }),
    {
      name: 'staynow_bookings_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


