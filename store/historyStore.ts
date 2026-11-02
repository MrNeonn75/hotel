import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingHistoryItem } from '@/types';

interface HistoryState {
  bookings: BookingHistoryItem[];
  addBooking: (booking: BookingHistoryItem) => void;
  cancelBooking: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      bookings: [],

      addBooking: (booking: BookingHistoryItem) => {
        set({
          bookings: [booking, ...get().bookings],
        });
      },

      cancelBooking: (id: string) => {
        set({
          bookings: get().bookings.map((item) =>
            item.id === id ? { ...item, status: 'cancelled' as const } : item
          ),
        });
      },
    }),
    {
      name: '@staynow_history_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useHistoryStore;

