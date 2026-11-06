export interface ThemeColors {
  primary: string;
  primaryPressed: string;
  primaryTint: string;
  background: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  savings: string;
  urgency: string;
  star: string;
  brandPlum: string;
  brandDark: string;
}

export const Palette = {
  light: {
    primary: '#806AEC',
    primaryPressed: '#6A52D9',
    primaryTint: '#F1EEFD',
    background: '#FFFFFF',
    surfaceAlt: '#F6F6F9',
    text: '#17171F',
    textSecondary: '#6C6C7A',
    border: '#E8E8EF',
    savings: '#00C48C',
    urgency: '#FF5A5F',
    star: '#FFA000',
    brandPlum: '#592391',
    brandDark: '#1B1924',
  } satisfies ThemeColors,
  dark: {
    primary: '#9B88F2',
    primaryPressed: '#806AEC',
    primaryTint: '#241F3D',
    background: '#0F0E17',
    surfaceAlt: '#1A1926',
    text: '#F5F5FA',
    textSecondary: '#A3A3B5',
    border: '#2B2A3A',
    savings: '#34D399',
    urgency: '#FF6B70',
    star: '#FFC24D',
    brandPlum: '#7B39B8',
    brandDark: '#12111A',
  } satisfies ThemeColors,
};

export type HTCategoryType =
  | 'LUXE'
  | 'HIP'
  | 'SOLID'
  | 'BASIC'
  | 'CHARMING'
  | 'CRASHPAD'
  | 'HIGHROLLER';

export interface HTCategoryMeta {
  key: HTCategoryType;
  label: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  tagline: string;
  shortDescription: string;
}

export const HT_CATEGORIES: Record<HTCategoryType, HTCategoryMeta> = {
  LUXE: {
    key: 'LUXE',
    label: 'Luxe',
    badgeBg: '#EDE7F6',
    badgeText: '#6A1B9A',
    icon: 'diamond',
    tagline: 'Yüksək dəbdəbə və 5 ulduzlu zəriflik',
    shortDescription: 'Eleqant dizayn, birinci dərəcəli xidmət və müstəsna komfort.',
  },
  HIP: {
    key: 'HIP',
    label: 'Hip',
    badgeBg: '#FCE4EC',
    badgeText: '#C2185B',
    icon: 'sparkles',
    tagline: 'Müasir butik və canlı şəhər ab-havası',
    shortDescription: 'Zövqlü dizayn, populyar bar/restoran və yaradıcı interyer.',
  },
  SOLID: {
    key: 'SOLID',
    label: 'Solid',
    badgeBg: '#E0F2F1',
    badgeText: '#00796B',
    icon: 'shield-checkmark',
    tagline: 'Etibarlı komfort və əla qiymət/keyfiyyət',
    shortDescription: 'Hər bir detalı düşünülmüş, təmiz və güvənli otellər.',
  },
  BASIC: {
    key: 'BASIC',
    label: 'Basic',
    badgeBg: '#ECEFF1',
    badgeText: '#455A64',
    icon: 'bed',
    tagline: 'Büdcəyə uyğun və təmiz gecələmə',
    shortDescription: 'Sadə, funksional və münasib qiymətə rahat yer.',
  },
  CHARMING: {
    key: 'CHARMING',
    label: 'Charming',
    badgeBg: '#F3E5F5',
    badgeText: '#7B1FA2',
    icon: 'rose',
    tagline: 'Tarixi və fərdi xarakterli butik məkan',
    shortDescription: 'İsti münasibət, tarixi aura və unikal memarlıq.',
  },
  CRASHPAD: {
    key: 'CRASHPAD',
    label: 'Crashpad',
    badgeBg: '#FBE9E7',
    badgeText: '#D84315',
    icon: 'moon',
    tagline: 'Gecələmək üçün sərfəli və sürətli seçim',
    shortDescription: 'Şəhər mərkəzində gecələmək üçün əlçatan və rahat otaq.',
  },
  HIGHROLLER: {
    key: 'HIGHROLLER',
    label: 'HighRoller',
    badgeBg: '#FFF8E1',
    badgeText: '#FF8F00',
    icon: 'trophy',
    tagline: 'VIP suitlər və premium təcrübə',
    shortDescription: 'Ən yüksək dərəcəli suit və fərdi konsyerj xidməti.',
  },
};

export function getHotelCategory(hotel: {
  starRating?: number;
  rating?: number;
  name?: string;
  discountedPrice?: number;
  htCategory?: string;
}): HTCategoryMeta {
  if (hotel.htCategory && HT_CATEGORIES[hotel.htCategory as HTCategoryType]) {
    return HT_CATEGORIES[hotel.htCategory as HTCategoryType];
  }
  const stars = hotel.starRating || 4;
  const rating = hotel.rating || 8.5;
  const price = hotel.discountedPrice || 120;
  const name = (hotel.name || '').toLowerCase();

  if (price > 300 || stars === 5 && rating >= 9.3) {
    return HT_CATEGORIES.LUXE;
  }
  if (name.includes('merchant') || name.includes('boutique') || rating >= 9.0) {
    return HT_CATEGORIES.HIP;
  }
  if (name.includes('sahil') || name.includes('old') || name.includes('qala')) {
    return HT_CATEGORIES.CHARMING;
  }
  if (stars >= 4) {
    return HT_CATEGORIES.SOLID;
  }
  return HT_CATEGORIES.BASIC;
}

export const Radius = {
  card: 16,
  image: 16,
  button: 14,
  sheetTop: 24,
  pill: 999,
} as const;

export const Spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const FontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Typography = {
  display: {
    fontSize: 28,
    fontFamily: FontFamilies.extraBold,
    fontWeight: '800' as const,
    lineHeight: 34,
  },
  title: {
    fontSize: 22,
    fontFamily: FontFamilies.bold,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  heading: {
    fontSize: 18,
    fontFamily: FontFamilies.bold,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontFamily: FontFamilies.medium,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontFamily: FontFamilies.medium,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  micro: {
    fontSize: 11,
    fontFamily: FontFamilies.semiBold,
    fontWeight: '600' as const,
    lineHeight: 14,
  },
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
} as const;

export const Colors = Palette;