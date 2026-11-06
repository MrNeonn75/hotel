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

const AZ_WEEKDAYS_SHORT = ['B.', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.'];

/**
 * String və ya Date obyektini yerli tarixə çevirir (UTC sürüşməsinin qarşısını almaq üçün).
 */
export function parseLocalDate(input: Date | string): Date {
  if (input instanceof Date) return new Date(input.getTime());
  if (typeof input === 'string') {
    const parts = input.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(input);
  }
  return new Date();
}

/**
 * Tarixi YYYY-MM-DD formatında qaytarır.
 */
export function toISODateString(input: Date | string): string {
  const d = parseLocalDate(input);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Qiyməti formatlayır: məs. 120 -> "120 ₼", 1250 -> "1 250 ₼"
 */
export function formatPrice(price: number, currency: string = '₼'): string {
  const formatted = Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ${currency}`;
}

/**
 * Qısa tarix formatı: məs. "12 Okt"
 */
export function formatDateShort(date: Date | string): string {
  const d = parseLocalDate(date);
  const day = d.getDate();
  const month = AZ_MONTHS_SHORT[d.getMonth()] || '';
  return `${day} ${month}`;
}

/**
 * Tarix aralığı formatı: məs. "12-14 Okt" və ya "28 Okt - 2 Noy"
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string
): string {
  const dStart = parseLocalDate(start);
  const dEnd = parseLocalDate(end);

  const startDay = dStart.getDate();
  const endDay = dEnd.getDate();

  const startMonthIdx = dStart.getMonth();
  const endMonthIdx = dEnd.getMonth();

  if (startMonthIdx === endMonthIdx) {
    if (startDay === endDay) {
      return `${startDay} ${AZ_MONTHS_SHORT[startMonthIdx]}`;
    }
    return `${startDay}-${endDay} ${AZ_MONTHS_SHORT[startMonthIdx]}`;
  }

  return `${startDay} ${AZ_MONTHS_SHORT[startMonthIdx]} - ${endDay} ${AZ_MONTHS_SHORT[endMonthIdx]}`;
}

/**
 * İki tarix arasındakı gecə sayını hesablayır (minimum 1 gecə).
 */
export function nightsBetween(
  checkIn: Date | string,
  checkOut: Date | string
): number {
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);

  // Gecənin vaxtını sıfırlayırıq
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(1, diffDays);
}

/**
 * Qonaq sayının formatlanması: "2 qonaq", "1 böyük, 1 uşaq"
 */
export function formatGuests(adults: number, children: number = 0): string {
  if (children === 0) {
    return `${adults} qonaq`;
  }
  return `${adults} böyük, ${children} uşaq`;
}

/**
 * Reytinq balı formatı: 9.5 -> "9.5"
 */
export function formatRating(val: number): string {
  return val.toFixed(1);
}

/**
 * Rəy sayının formatlanması: 1420 -> "1 420 rəy"
 */
export function formatReviewCount(count: number): string {
  const formatted = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} rəy`;
}