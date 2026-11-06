import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'az' | 'en' | 'ru';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string; // YYYY-MM-DD
  nationality: string;
  documentNumber: string; // e.g. AZE12345678
  maskedDocumentNumber?: string;
  city: string;
  address: string;
  preferredLanguage: AppLanguage;
  themeMode: ThemeMode;
}

export interface ProfileState {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  setLanguage: (lang: AppLanguage) => void;
  setThemeMode: (theme: ThemeMode) => void;
  clearProfile: () => void;
}

export const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  nationality: 'Azərbaycan',
  documentNumber: '',
  city: 'Bakı',
  address: '',
  preferredLanguage: 'az',
  themeMode: 'system',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (updated) =>
        set((state) => ({
          profile: { ...state.profile, ...updated },
        })),
      setLanguage: (preferredLanguage) =>
        set((state) => ({
          profile: { ...state.profile, preferredLanguage },
        })),
      setThemeMode: (themeMode) =>
        set((state) => ({
          profile: { ...state.profile, themeMode },
        })),
      clearProfile: () => set({ profile: defaultProfile }),
    }),
    {
      name: 'staynow_profile_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useProfileStore;
