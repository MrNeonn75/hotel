import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_DROP_DURATION_SECONDS = 15 * 60; // 15 dəqiqə

export interface DailyDropState {
  isUnlocked: boolean;
  unlockedAt: number | null; // timestamp in ms
  mysteryHotelId: string;
  specialPrice: number;
  originalPrice: number;
  discountPercent: number;
  unlockDailyDrop: () => void;
  resetDailyDrop: () => void;
  getSecondsRemaining: () => number;
}

export const useDailyDropStore = create<DailyDropState>()(
  persist(
    (set, get) => ({
      isUnlocked: false,
      unlockedAt: null,
      mysteryHotelId: 'hotel-1', // JW Marriott Absheron Baku
      specialPrice: 189,
      originalPrice: 380,
      discountPercent: 50,

      unlockDailyDrop: () => {
        const now = Date.now();
        set({
          isUnlocked: true,
          unlockedAt: now,
        });
      },

      resetDailyDrop: () => {
        set({
          isUnlocked: false,
          unlockedAt: null,
        });
      },

      getSecondsRemaining: () => {
        const { isUnlocked, unlockedAt } = get();
        if (!isUnlocked || !unlockedAt) return 0;
        const elapsedSeconds = Math.floor((Date.now() - unlockedAt) / 1000);
        const remaining = DAILY_DROP_DURATION_SECONDS - elapsedSeconds;
        return Math.max(0, remaining);
      },
    }),
    {
      name: 'daily-drop-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

