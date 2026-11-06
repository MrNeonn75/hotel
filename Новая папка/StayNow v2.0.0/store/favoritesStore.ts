import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoriteService } from '@/services/favoriteService';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';

export interface FavoritesState {
  favorites: string[];
  favoriteIds: string[];
  isSyncing: boolean;
  toggleFavorite: (hotelId: string) => Promise<void>;
  isFavorite: (hotelId: string) => boolean;
  addFavorite: (hotelId: string) => Promise<void>;
  removeFavorite: (hotelId: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: ['hotel-1', 'hotel-3'],
      get favoriteIds() {
        return this.favorites;
      },
      isSyncing: false,

      isFavorite: (hotelId: string) => get().favorites.includes(hotelId),

      toggleFavorite: async (hotelId: string) => {
        const { favorites, isFavorite } = get();
        const currentlyFavorite = isFavorite(hotelId);
        const prevFavorites = [...favorites];

        // 1. Optimistik yeniləmə
        if (currentlyFavorite) {
          const updated = favorites.filter((id) => id !== hotelId);
          set({ favorites: updated, favoriteIds: updated });
        } else {
          const updated = [...favorites, hotelId];
          set({ favorites: updated, favoriteIds: updated });
        }

        // Mock rejimində server sorğusu göndərilmir
        if (USE_MOCK) return;

        // 2. Serverlə asinxron sinxronizasiya
        try {
          if (currentlyFavorite) {
            await favoriteService.removeFavorite(hotelId);
          } else {
            await favoriteService.addFavorite(hotelId);
          }
        } catch {
          // Xəta olarsa əvvəlki vəziyyətə rollback
          set({ favorites: prevFavorites, favoriteIds: prevFavorites });
        }
      },

      addFavorite: async (hotelId: string) => {
        const { favorites } = get();
        if (favorites.includes(hotelId)) return;

        const prevFavorites = [...favorites];
        const updated = [...favorites, hotelId];
        set({ favorites: updated, favoriteIds: updated });

        if (USE_MOCK) return;

        try {
          await favoriteService.addFavorite(hotelId);
        } catch {
          set({ favorites: prevFavorites, favoriteIds: prevFavorites });
        }
      },

      removeFavorite: async (hotelId: string) => {
        const { favorites } = get();
        if (!favorites.includes(hotelId)) return;

        const prevFavorites = [...favorites];
        const updated = favorites.filter((id) => id !== hotelId);
        set({ favorites: updated, favoriteIds: updated });

        if (USE_MOCK) return;

        try {
          await favoriteService.removeFavorite(hotelId);
        } catch {
          set({ favorites: prevFavorites, favoriteIds: prevFavorites });
        }
      },

      syncWithServer: async () => {
        if (USE_MOCK) return;

        const { favorites } = get();
        set({ isSyncing: true });
        try {
          const mergedIds = await favoriteService.syncFavorites(favorites);
          if (Array.isArray(mergedIds)) {
            set({ favorites: mergedIds, favoriteIds: mergedIds, isSyncing: false });
          } else {
            set({ isSyncing: false });
          }
        } catch {
          set({ isSyncing: false });
        }
      },

      clearFavorites: () => set({ favorites: [], favoriteIds: [] }),
    }),
    {
      name: 'staynow_favorites_storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Tətbiq açıldıqda serverlə arxa planda avtomatik sinxronlaşdır
        if (state && !USE_MOCK) {
          state.syncWithServer();
        }
      },
    }
  )
);

export default useFavoritesStore;
