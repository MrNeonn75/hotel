import api from './api';

export interface GuestProfile {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate?: string | null;
  nationality: string;
  documentNumber?: string | null;
  maskedDocumentNumber?: string | null;
  city: string;
  address: string;
  preferredLanguage: 'az' | 'en' | 'ru';
}

export interface GuestProfileUpdatePayload {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
  documentNumber?: string | null;
  city?: string | null;
  address?: string | null;
  preferredLanguage?: string | null;
}

export interface ProfileClearResponse {
  message: string;
}

/**
 * Serverdən cari istifadəçinin profil məlumatlarını gətirir.
 */
export async function getProfile(): Promise<GuestProfile> {
  return await api.get<GuestProfile>('/profile');
}

/**
 * İstifadəçinin profil məlumatlarını yeniləyir.
 */
export async function updateProfile(
  data: GuestProfileUpdatePayload
): Promise<GuestProfile> {
  return await api.put<GuestProfile>('/profile', data);
}

/**
 * GDPR üzrə bütün şəxsi profil məlumatlarını silir.
 */
export async function deleteProfile(): Promise<ProfileClearResponse> {
  return await api.delete<ProfileClearResponse>('/profile');
}

export const profileService = {
  getProfile,
  updateProfile,
  deleteProfile,
};

export default profileService;

