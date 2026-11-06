import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AmenityKey, FilterState, HotelCategory, SortOption } from '@/types/hotel';

interface FilterActions {
  setPriceRange: (range: [number, number]) => void;
  setMinRating: (rating: number | null) => void;
  toggleAmenity: (amenity: AmenityKey) => void;
  toggleCategory: (category: HotelCategory) => void;
  setTonightOnly: (val: boolean) => void;
  setSortBy: (sortBy: SortOption) => void;
  setFilterState: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
}

export const initialFilterState: FilterState = {
  priceRange: [50, 600],
  minRating: null,
  amenities: [],
  categories: [],
  tonightOnly: false,
  sortBy: 'recommended',
};

export function getActiveFilterCount(state: FilterState): number {
  let count = 0;
  if (state.priceRange[0] > 50 || state.priceRange[1] < 600) {
    count += 1;
  }
  if (state.minRating !== null) {
    count += 1;
  }
  count += state.amenities.length;
  count += state.categories.length;
  if (state.tonightOnly) {
    count += 1;
  }
  return count;
}

export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    (set) => ({
      ...initialFilterState,

      setPriceRange: (priceRange) => set({ priceRange }),

      setMinRating: (minRating) => set({ minRating }),

      toggleAmenity: (amenity) =>
        set((state) => ({
          amenities: state.amenities.includes(amenity)
            ? state.amenities.filter((a) => a !== amenity)
            : [...state.amenities, amenity],
        })),

      toggleCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories.filter((c) => c !== category)
            : [...state.categories, category],
        })),

      setTonightOnly: (tonightOnly) => set({ tonightOnly }),

      setSortBy: (sortBy) => set({ sortBy }),

      setFilterState: (updates) => set((state) => ({ ...state, ...updates })),

      resetFilters: () => set(initialFilterState),
    }),
    {
      name: 'staynow_filter_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
