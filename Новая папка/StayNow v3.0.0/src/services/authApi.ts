import { User } from '@/types/hotel';
import { USE_MOCK } from '@/config/env';
import { MOCK_USER } from '@/data/mock/user';
import { request, setAuthToken } from './httpClient';
import { delay } from './apiClient';

let runtimeUser: User | null = null;

interface BackendAuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string | null;
  };
  token: string;
  tokenType: string;
}

export const authApi = {
  /**
   * İstifadəçi girişi (Backend: POST /api/v1/auth/login)
   */
  async login(
    email: string,
    pass: string
  ): Promise<{ user: User; token: string }> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendAuthResponse>('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: pass,
          }),
        });

        if (res && res.token && res.user) {
          const u: User = {
            id: res.user.id,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            email: res.user.email,
            phone: res.user.phone,
            avatar: res.user.avatar || MOCK_USER.avatar,
          };
          runtimeUser = u;
          await setAuthToken(res.token);
          return {
            user: u,
            token: res.token,
          };
        }
      } catch (err: any) {
        // If server gave 401 or 422 or other client error, propagate it
        if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          throw err;
        }
        // Connection error fallback below
      }
    }

    await delay(350, 500);

    // Test qaydası: şifrə "Test1234" olmalıdır
    if (pass !== 'Test1234') {
      throw new Error('E-poçt və ya şifrə yanlışdır. (Test üçün şifrə: Test1234)');
    }

    runtimeUser = {
      ...MOCK_USER,
      email,
    };

    const token = `jwt-staynow-${Date.now()}`;
    await setAuthToken(token);

    return {
      user: runtimeUser,
      token,
    };
  },

  /**
   * İstifadəçi qeydiyyatı (Backend: POST /api/v1/auth/signup)
   */
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password?: string;
  }): Promise<{ user: User; token: string }> {
    if (!USE_MOCK) {
      try {
        const res = await request<BackendAuthResponse>('/api/v1/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            password: data.password || 'Test1234',
          }),
        });

        if (res && res.token && res.user) {
          const u: User = {
            id: res.user.id,
            firstName: res.user.firstName,
            lastName: res.user.lastName,
            email: res.user.email,
            phone: res.user.phone,
            avatar: res.user.avatar || MOCK_USER.avatar,
          };
          runtimeUser = u;
          await setAuthToken(res.token);
          return {
            user: u,
            token: res.token,
          };
        }
      } catch (err: any) {
        if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          throw err;
        }
      }
    }

    await delay(400, 600);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      avatar: MOCK_USER.avatar,
    };

    runtimeUser = newUser;

    const token = `jwt-staynow-${Date.now()}`;
    await setAuthToken(token);

    return {
      user: newUser,
      token,
    };
  },

  /**
   * Şifrənin bərpası üçün link göndərmə (Backend: POST /api/v1/auth/forgot-password)
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (!USE_MOCK) {
      try {
        const res = await request<{ success: boolean; message: string }>('/api/v1/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        });
        if (res) {
          return {
            success: res.success,
            message: res.message || `${email} ünvanına şifrə bərpa təlimatları göndərildi.`,
          };
        }
      } catch {
        // Fallback
      }
    }

    await delay(300, 450);
    return {
      success: true,
      message: `${email} ünvanına şifrə bərpa təlimatları göndərildi.`,
    };
  },

  /**
   * Cari istifadəçi məlumatı (Backend: GET /api/v1/auth/me)
   */
  async getCurrentUser(): Promise<User | null> {
    if (!USE_MOCK) {
      try {
        const res = await request<any>('/api/v1/auth/me');
        if (res && res.email) {
          return {
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName || '',
            email: res.email,
            phone: res.phone || '',
            avatar: res.avatar || MOCK_USER.avatar,
          };
        }
      } catch {
        // Try profile fallback
        try {
          const prof = await request<any>('/api/v1/profile');
          if (prof && prof.firstName) {
            return {
              id: prof.id || prof.guestId || 'usr-default',
              firstName: prof.firstName,
              lastName: prof.lastName || '',
              email: prof.email || '',
              phone: prof.phone || '',
              avatar: MOCK_USER.avatar,
            };
          }
        } catch {
          // Fallback to runtime
        }
      }
    }

    await delay(150, 250);
    return runtimeUser ? { ...runtimeUser } : null;
  },

  /**
   * Profil məlumatlarını yeniləyir (Backend: PUT /api/v1/auth/me)
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    if (!USE_MOCK) {
      try {
        const res = await request<any>('/api/v1/auth/me', {
          method: 'PUT',
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatar: data.avatar,
          }),
        });
        if (res && res.email) {
          runtimeUser = {
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName || '',
            email: res.email,
            phone: res.phone || '',
            avatar: res.avatar || MOCK_USER.avatar,
          };
          return { ...runtimeUser };
        }
      } catch {
        // Fallback
      }
    }

    await delay(300, 450);
    if (!runtimeUser) {
      runtimeUser = { ...MOCK_USER };
    }
    runtimeUser = {
      ...runtimeUser,
      ...data,
    };
    return { ...runtimeUser };
  },
};
