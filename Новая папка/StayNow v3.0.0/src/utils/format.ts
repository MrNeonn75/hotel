/**
 * Məlumatların Azərbaycan dilində formatlanması üçün köməkçi funksiyalar
 * Saat qurşağı: Asia/Baku, Valyuta: AZN (₼)
 */

export const TIMEZONE = 'Asia/Baku';
export const CURRENCY_SYMBOL = '₼';

const AZ_MONTHS_SHORT = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'İyn',
  'İyl',
  'Avq',
  'Sen',
  'Okt',
  'Noy',
  'Dek',
];

const AZ_MONTHS_FULL = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];

const AZ_WEEKDAYS = [
  'Bazar',
  'Bazar ertəsi',
  'Çərşənbə axşamı',
  'Çərşənbə',
  'Cümə axşamı',
  'Cümə',
  'Şənbə',
];

/**
 * Qiyməti valyuta simvolu ilə formatlayır (məs: "120 ₼")
 */
export function formatPrice(amount: number, currency: string = CURRENCY_SYMBOL): string {
  if (amount === undefined || amount === null) return `0 ${currency}`;
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('az-AZ')} ${currency}`;
}

/**
 * Tarixi Azərbaycan dilində qısa və ya tam formatlayır (məs: "14 Noy" və ya "14 Noyabr 2026")
 */
export function formatDate(
  dateInput: string | Date,
  formatType: 'short' | 'full' | 'withWeekday' = 'short'
): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const day = d.getDate();
  const monthIndex = d.getMonth();
  const year = d.getFullYear();
  const weekday = AZ_WEEKDAYS[d.getDay()];

  if (formatType === 'withWeekday') {
    return `${weekday}, ${day} ${AZ_MONTHS_FULL[monthIndex]}`;
  }

  if (formatType === 'full') {
    return `${day} ${AZ_MONTHS_FULL[monthIndex]} ${year}`;
  }

  return `${day} ${AZ_MONTHS_SHORT[monthIndex]}`;
}

/**
 * Giriş və çıxış tarixlərini aralıq kimi formatlayır (məs: "12 — 14 Noy" və ya "28 Okt — 2 Noy")
 */
export function formatDateRange(
  startDateInput: string | Date,
  endDateInput: string | Date
): string {
  const start = typeof startDateInput === 'string' ? new Date(startDateInput) : startDateInput;
  const end = typeof endDateInput === 'string' ? new Date(endDateInput) : endDateInput;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

  const startDay = start.getDate();
  const startMonth = start.getMonth();
  const endDay = end.getDate();
  const endMonth = end.getMonth();

  if (startMonth === endMonth) {
    return `${startDay} — ${endDay} ${AZ_MONTHS_SHORT[startMonth]}`;
  }

  return `${startDay} ${AZ_MONTHS_SHORT[startMonth]} — ${endDay} ${AZ_MONTHS_SHORT[endMonth]}`;
}

/**
 * İki tarix arasındakı gecə sayını hesablayır (minimum 1 gecə)
 */
export function nights(startDateInput: string | Date, endDateInput: string | Date): number {
  const start = typeof startDateInput === 'string' ? new Date(startDateInput) : startDateInput;
  const end = typeof endDateInput === 'string' ? new Date(endDateInput) : endDateInput;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

/**
 * Gecə sayını mətn şəklində qaytarır (məs: "1 gecə", "4 gecə")
 */
export function formatNights(count: number): string {
  return `${count} gecə`;
}

/**
 * Bu günün və sabahın ISO tarixini qaytarır (YYYY-MM-DD formatında)
 */
export function getDefaultDates(): { checkIn: string; checkOut: string } {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  return {
    checkIn: today.toISOString().split('T')[0],
    checkOut: tomorrow.toISOString().split('T')[0],
  };
}

