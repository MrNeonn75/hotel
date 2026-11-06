import { create } from 'zustand';
import { AmenityKey, SortOption } from '@/types/hotel';
import { toISODateString, nightsBetween } from '@/utils/format';

export interface SearchGuests {
  adults: number;
  children: number;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  amenities: AmenityKey[];
  starRatings: number[];
  minRating?: number;
  freeCancellationOnly: boolean;
  dealsOnly: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  minPrice: undefined,
  maxPrice: undefined,
  amenities: [],
  starRatings: [],
  minRating: undefined,
  freeCancellationOnly: false,
  dealsOnly: false,
};

function getInitialDates(): { today: string; tomorrow: string } {
  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    today: toISODateString(now),
    tomorrow: toISODateString(nextDay),
  };
}

export interface SearchState {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: SearchGuests;
  sort: SortOption;
  filters: SearchFilters;
  searchQuery: string;

  // Actions
  setCity: (city: string) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: Partial<SearchGuests>) => void;
  setSort: (sort: SortOption) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  getNights: () => number;
}

const initialDates = getInitialDates();

export const useSearchStore = create<SearchState>((set, get) => ({
  city: 'Bakı',
  checkIn: initialDates.today,
  checkOut: initialDates.tomorrow,
  guests: {
    adults: 2,
    children: 0,
  },
  sort: 'recommended',
  filters: { ...DEFAULT_FILTERS },
  searchQuery: '',

  setCity: (city: string) => set({ city }),

  setDates: (checkIn: string, checkOut: string) => set({ checkIn, checkOut }),

  setGuests: (partialGuests) =>
    set((state) => ({
      guests: { ...state.guests, ...partialGuests },
    })),

  setSort: (sort: SortOption) => set({ sort }),

  setFilters: (partialFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...partialFilters },
    })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  getNights: () => {
    const { checkIn, checkOut } = get();
    return nightsBetween(checkIn, checkOut);
  },
}));

export default useSearchStore;