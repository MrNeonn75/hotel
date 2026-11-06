import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Booking {
  id: string;
  bookingNumber: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  neighborhood: string;
  city: string;
  starRating: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  specialRequests?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface HistoryState {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  clearHistory: () => void;
}

const sampleBookings: Booking[] = [
  {
    id: 'booking-demo-1',
    bookingNumber: 'SN-492810',
    hotelId: 'hotel-1',
    hotelName: 'JW Marriott Absheron Baku',
    hotelImage:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    neighborhood: 'Sahil',
    city: 'Bakı',
    starRating: 5,
    checkIn: '2026-11-05',
    checkOut: '2026-11-07',
    nights: 2,
    guests: { adults: 2, children: 0 },
    totalPrice: 494,
    guestName: 'Elşən Məmmədov',
    guestPhone: '+994 50 123 45 67',
    guestEmail: 'elshan@example.com',
    specialRequests: 'Dəniz mənzərəli otaq',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      bookings: sampleBookings,
      addBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),
      cancelBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        })),
      clearHistory: () => set({ bookings: [] }),
    }),
    {
      name: 'staynow_history_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useHistoryStore;