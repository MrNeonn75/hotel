const AZ_MONTHS = [
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

/**
 * Məbləği manat işarəsi ilə formatlayır.
 * Nümunə: formatPrice(120) -> "120 ₼"
 */
export function formatPrice(amount: number): string {
  return `${amount} ₼`;
}

/**
 * Tarixi Azərbaycan dilində qısa ay adı ilə formatlayır.
 * Nümunə: formatDate("2026-10-12") -> "12 Okt"
 */
export function formatDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = date.getDate();
  const month = AZ_MONTHS[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * İki tarix arasındakı gecələrin sayını hesablayır.
 * Ən azı 1 gecə qaytarır.
 */
export function nightsBetween(
  startInput: Date | string,
  endInput: Date | string
): number {
  const start = typeof startInput === 'string' ? new Date(startInput) : startInput;
  const end = typeof endInput === 'string' ? new Date(endInput) : endInput;

  // Saatsız sırf gün fərqini hesablamaq üçün UTC günlərindən istifadə
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((utcEnd - utcStart) / msPerDay);

  return Math.max(diffDays, 1);
}

/**
 * Yoxlayır ki, verilən tarix bu günə uyğundurmu.
 */
export function isToday(dateInput: Date | string): boolean {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Rezervasiya məbləğini StayNow qaydasına əsasən hesablayır:
 * Endirim sadəcə həmin günə (bu gecəyə) aiddir.
 * Əgər bu gün daxil 3 gecə götürülərsə, yalnız 1-ci gecə endirimlə,
 * növbəti gecələr standart qiymətlə hesablanır.
 */
export function calculateStayPrice(
  standardPrice: number,
  discountedPrice: number,
  nights: number,
  checkInDate: Date | string
) {
  const checkInIsToday = isToday(checkInDate);

  if (!checkInIsToday) {
    // Giriş gələcək gündürsə, endirim tətbiq olunmur, standart qiymətdir
    const total = nights * standardPrice;
    return {
      isTodayDiscountApplied: false,
      firstNightPrice: standardPrice,
      remainingNightsCount: Math.max(0, nights - 1),
      remainingNightsPrice: Math.max(0, nights - 1) * standardPrice,
      totalPrice: total,
      discountAmount: 0,
      standardTotal: total,
    };
  }

  // Giriş bu gündürsə: 1-ci gecə endirimli, növbəti (nights - 1) gecə standart qiymət
  const remainingNightsCount = Math.max(0, nights - 1);
  const remainingNightsPrice = remainingNightsCount * standardPrice;
  const totalPrice = discountedPrice + remainingNightsPrice;
  const discountAmount = Math.max(0, standardPrice - discountedPrice);
  const standardTotal = nights * standardPrice;

  return {
    isTodayDiscountApplied: true,
    firstNightPrice: discountedPrice,
    remainingNightsCount,
    remainingNightsPrice,
    totalPrice,
    discountAmount,
    standardTotal,
  };
}


