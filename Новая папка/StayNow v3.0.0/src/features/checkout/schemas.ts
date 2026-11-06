import { z } from 'zod';

/**
 * Luhn alqoritmi ilə kart nömrəsinin yoxlanması
 */
export function luhnCheck(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Kart nömrəsini 4-lü bloklarla formatlayır (XXXX XXXX XXXX XXXX)
 */
export function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Kartın son istifadə tarixini formatlayır (AA/İİ)
 */
export function formatCardExpiry(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

/**
 * Qonaq məlumatları sxemi (checkout/guest)
 */
export const guestInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Adınızı daxil edin')
    .min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır'),
  lastName: z
    .string()
    .min(1, 'Soyadınızı daxil edin')
    .min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır'),
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
        return digits.startsWith('994') && digits.length === 12;
      },
      {
        message: 'Düzgün Azərbaycan nömrəsi daxil edin (+994 50 000 00 00)',
      }
    ),
  specialRequests: z
    .string()
    .max(200, 'Xüsusi istək maksimum 200 simvol ola bilər')
    .optional(),
  estimatedArrivalTime: z.string().optional(),
  saveToProfile: z.boolean().default(true),
});

export type GuestInfoFormData = z.infer<typeof guestInfoSchema>;

/**
 * Ödəniş kartı sxemi (checkout/payment)
 */
export const paymentCardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Kart nömrəsini daxil edin')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length === 16 && luhnCheck(digits);
      },
      {
        message: 'Düzgün 16 rəqəmli bank kartı nömrəsi daxil edin',
      }
    ),
  expiry: z
    .string()
    .min(1, 'Tarixi daxil edin')
    .refine(
      (val) => {
        const match = val.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        const month = parseInt(match[1], 10);
        if (month < 1 || month > 12) return false;
        return true;
      },
      {
        message: 'Düzgün ay və il daxil edin (AA/İİ)',
      }
    ),
  cvc: z
    .string()
    .min(1, 'CVC kodunu daxil edin')
    .regex(/^\d{3}$/, 'CVC 3 rəqəmli olmalıdır'),
  cardholderName: z
    .string()
    .min(1, 'Kart sahibinin adını daxil edin')
    .min(3, 'Kart sahibinin adı və soyadını daxil edin'),
});

export type PaymentCardFormData = z.infer<typeof paymentCardSchema>;