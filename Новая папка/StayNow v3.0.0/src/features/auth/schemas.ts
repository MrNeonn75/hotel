import { z } from 'zod';

/**
 * Giriş (Login) Doğrulama Sxemi
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-poçt ünvanınızı daxil edin')
    .email('Düzgün e-poçt ünvanı daxil edin'),
  password: z
    .string()
    .min(1, 'Şifrənizi daxil edin')
    .min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Qeydiyyat (Sign Up) Doğrulama Sxemi
 */
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Adınızı daxil edin')
      .min(2, 'Ad ən azı 2 simvol olmalıdır'),
    lastName: z
      .string()
      .min(1, 'Soyadınızı daxil edin')
      .min(2, 'Soyad ən azı 2 simvol olmalıdır'),
    email: z
      .string()
      .min(1, 'E-poçt ünvanınızı daxil edin')
      .email('Düzgün e-poçt ünvanı daxil edin'),
    phone: z
      .string()
      .min(1, 'Telefon nömrənizi daxil edin')
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, '');
          // Azerbaijani numbers: 994 + 9 digits = 12 digits total
          return digits.startsWith('994') && digits.length === 12;
        },
        {
          message: 'Düzgün Azərbaycan nömrəsi daxil edin (+994 50 000 00 00)',
        }
      ),
    password: z
      .string()
      .min(1, 'Şifrə daxil edin')
      .min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
    confirmPassword: z
      .string()
      .min(1, 'Şifrəni təkrar daxil edin')
      .min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'İstifadə şərtləri və gizlilik qaydaları ilə razılaşmalısınız',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifrələr uyğun gəlmir',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Şifrənin Bərpası (Forgot Password) Sxemi
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-poçt ünvanınızı daxil edin')
    .email('Düzgün e-poçt ünvanı daxil edin'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Azərbaycan telefon nömrəsi formatlayıcısı (+994 XX XXX XX XX)
 */
export function formatAzPhoneNumber(input: string): string {
  // Extract all digits
  let digits = input.replace(/\D/g, '');

  if (!digits.startsWith('994')) {
    if (digits.startsWith('0')) {
      digits = '994' + digits.slice(1);
    } else {
      digits = '994' + digits;
    }
  }

  // Cap at 12 digits (994 + 9 digits)
  digits = digits.slice(0, 12);

  // Format as +994 (XX) XXX-XX-XX or +994 XX XXX XX XX
  const country = '+994';
  const op = digits.slice(3, 5);
  const p1 = digits.slice(5, 8);
  const p2 = digits.slice(8, 10);
  const p3 = digits.slice(10, 12);

  let formatted = country;
  if (op) formatted += ` ${op}`;
  if (p1) formatted += ` ${p1}`;
  if (p2) formatted += ` ${p2}`;
  if (p3) formatted += ` ${p3}`;

  return formatted;
}

