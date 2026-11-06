import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (hotelId: string) => void;
  addFavorite: (hotelId: string) => void;
  removeFavorite: (hotelId: string) => void;
  isFavorite: (hotelId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: ['bulevard-house', 'shirvanshah-hotel'],

      toggleFavorite: (hotelId: string) => {
        const { favoriteIds } = get();
        if (favoriteIds.includes(hotelId)) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== hotelId) });
        } else {
          set({ favoriteIds: [...favoriteIds, hotelId] });
        }
      },

      addFavorite: (hotelId: string) => {
        const { favoriteIds } = get();
        if (!favoriteIds.includes(hotelId)) {
          set({ favoriteIds: [hotelId, ...favoriteIds] });
        }
      },

      removeFavorite: (hotelId: string) => {
        const { favoriteIds } = get();
        set({ favoriteIds: favoriteIds.filter((id) => id !== hotelId) });
      },

      isFavorite: (hotelId: string) => {
        return get().favoriteIds.includes(hotelId);
      },

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'staynow_favorites_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

