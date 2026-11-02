import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PreferredLanguage = 'AZ' | 'EN' | 'RU';
export type PreferredTheme = 'system' | 'light' | 'dark';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate?: string;
  nationality?: string;
  documentNumber?: string;
  city?: string;
  address?: string;
  preferredLanguage?: PreferredLanguage;
  preferredTheme?: PreferredTheme;
}

interface ProfileState {
  profile: UserProfileData;
  setProfile: (profile: Partial<UserProfileData>) => void;
  updateProfile: (profile: Partial<UserProfileData>) => void;
  clearProfile: () => void;
  loadInitialData: () => Promise<void>;
}

export const defaultProfile: UserProfileData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  nationality: 'Azərbaycan',
  documentNumber: '',
  city: 'Bakı',
  address: '',
  preferredLanguage: 'AZ',
  preferredTheme: 'system',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      setProfile: (updatedData) => {
        set((state) => ({
          profile: { ...state.profile, ...updatedData },
        }));
      },

      updateProfile: (updatedData) => {
        set((state) => ({
          profile: { ...state.profile, ...updatedData },
        }));
      },

      clearProfile: () => {
        set({
          profile: { ...defaultProfile },
        });
      },

      loadInitialData: async () => {
        // Zustand persist automatically loads persisted state
      },
    }),
    {
      name: '@staynow_profile_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useProfileStore;
