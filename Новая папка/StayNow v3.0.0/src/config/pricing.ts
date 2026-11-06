/**
 * Qiymət və Rezervasiya Hesablamaları Konfiqurasiyası
 */

export const PRICING_CONFIG = {
  // Əlavə Dəyər Vergisi (ƏDV / VAT) dərəcəsi: 18%
  TAX_RATE: 0.18,

  // Xidmət haqqı dərəcəsi: 5%
  SERVICE_FEE_RATE: 0.05,
} as const;

export interface BookingPricingResult {
  nights: number;
  nightlyPrice: number;
  originalNightlyPrice?: number;
  basePrice: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  savings: number;
}

/**
 * Gecəlik qiymət, gecə sayı və ilkin qiymət əsasında şəffaf hesablanma
 */
export function calculateBookingPricing(
  nightlyPrice: number,
  nightsCount: number = 1,
  originalNightlyPrice?: number
): BookingPricingResult {
  const safeNights = Math.max(1, nightsCount);
  const basePrice = nightlyPrice * safeNights;
  const taxes = Math.round(basePrice * PRICING_CONFIG.TAX_RATE);
  const serviceFee = Math.round(basePrice * PRICING_CONFIG.SERVICE_FEE_RATE);
  const totalPrice = basePrice + taxes + serviceFee;

  let savings = 0;
  if (originalNightlyPrice && originalNightlyPrice > nightlyPrice) {
    savings = (originalNightlyPrice - nightlyPrice) * safeNights;
  }

  return {
    nights: safeNights,
    nightlyPrice,
    originalNightlyPrice,
    basePrice,
    taxes,
    serviceFee,
    totalPrice,
    savings,
  };
}

