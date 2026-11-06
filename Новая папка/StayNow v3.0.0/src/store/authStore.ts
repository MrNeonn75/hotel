import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '@/types/hotel';
import { authApi } from '@/services/authApi';

const SECURE_TOKEN_KEY = 'staynow_auth_token';

async function saveSecureToken(token: string): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SECURE_TOKEN_KEY, token);
    }
  } catch {
    // fallback
  }
}

async function getSecureToken(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') {
      return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
    } else if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(SECURE_TOKEN_KEY);
    }
  } catch {
    return null;
  }
  return null;
}

async function removeSecureToken(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SECURE_TOKEN_KEY);
    }
  } catch {
    // fallback
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hasCompletedWelcome: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setHasCompletedWelcome: (val: boolean) => void;
  hydrateAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      hasCompletedWelcome: false,

      login: async (email: string, pass: string) => {
        try {
          const res = await authApi.login(email, pass);
          await saveSecureToken(res.token);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Giriş zamanı xəta baş verdi',
          };
        }
      },

      signup: async (data) => {
        try {
          const res = await authApi.signup(data);
          await saveSecureToken(res.token);
          set({
            user: res.user,
            token: res.token,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: err?.message || 'Qeydiyyat zamanı xəta baş verdi',
          };
        }
      },

      logout: async () => {
        await removeSecureToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updatedData },
          });
        }
      },

      setHasCompletedWelcome: (val) => set({ hasCompletedWelcome: val }),

      hydrateAuth: async () => {
        try {
          const token = await getSecureToken();
          if (token && get().user) {
            set({
              token,
              isAuthenticated: true,
              isHydrated: true,
            });
          } else {
            set({ isHydrated: true });
          }
        } catch {
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: 'staynow_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasCompletedWelcome: state.hasCompletedWelcome,
      }),
      onRehydrateStorage: () => (state) => {
        state?.hydrateAuth();
      },
    }
  )
);
