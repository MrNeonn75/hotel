import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchState } from '@/types/hotel';
import { getDefaultDates } from '@/utils/format';

interface SearchActions {
  setLocation: (location: string) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: Partial<SearchState['guests']>) => void;
  resetSearch: () => void;
}

const defaultDates = getDefaultDates();

const initialSearchState: SearchState = {
  location: 'Bakı, Azərbaycan',
  checkInDate: defaultDates.checkIn,
  checkOutDate: defaultDates.checkOut,
  guests: {
    adults: 2,
    children: 0,
    rooms: 1,
  },
};

export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    (set) => ({
      ...initialSearchState,

      setLocation: (location) => set({ location }),

      setDates: (checkInDate, checkOutDate) => set({ checkInDate, checkOutDate }),

      setGuests: (guestUpdates) =>
        set((state) => ({
          guests: { ...state.guests, ...guestUpdates },
        })),

      resetSearch: () => {
        const freshDates = getDefaultDates();
        set({
          ...initialSearchState,
          checkInDate: freshDates.checkIn,
          checkOutDate: freshDates.checkOut,
        });
      },
    }),
    {
      name: 'staynow_search_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

