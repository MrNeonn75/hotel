import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  birthDate?: string;
  address?: string;
  specialRequests?: string;
}

export type GuestInfo = ProfileData;

interface ProfileState {
  guestInfo: ProfileData;
  saveGuestInfo: (info: Partial<ProfileData>) => void;
  updateProfile: (data: Partial<ProfileData>) => void;
  clearGuestInfo: () => void;
  resetAutofill: () => void;
}

const initialProfile: ProfileData = {
  firstName: 'Elşən',
  lastName: 'Məmmədov',
  email: 'elshan@staynow.az',
  phone: '+994 50 123 45 67',
  country: 'Azərbaycan',
  birthDate: '15.05.1995',
  address: 'Bakı ş., Nizami küç. 45',
  specialRequests: '',
};

const emptyProfile: ProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: 'Azərbaycan',
  birthDate: '',
  address: '',
  specialRequests: '',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      guestInfo: initialProfile,

      saveGuestInfo: (newInfo) =>
        set((state) => ({
          guestInfo: {
            ...state.guestInfo,
            ...newInfo,
          },
        })),

      updateProfile: (data) =>
        set((state) => ({
          guestInfo: {
            ...state.guestInfo,
            ...data,
          },
        })),

      clearGuestInfo: () => set({ guestInfo: initialProfile }),

      resetAutofill: () => set({ guestInfo: emptyProfile }),
    }),
    {
      name: 'staynow_profile_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
