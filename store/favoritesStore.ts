import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (id: string) => {
        const current = get().favoriteIds;
        const exists = current.includes(id);
        const updated = exists
          ? current.filter((favId) => favId !== id)
          : [...current, id];

        set({ favoriteIds: updated });
      },

      isFavorite: (id: string) => {
        return get().favoriteIds.includes(id);
      },
    }),
    {
      name: '@staynow_favorites_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFavoritesStore;

