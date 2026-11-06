import { Ionicons } from '@expo/vector-icons';
import { AmenityKey } from '@/types/hotel';

export interface AmenityDefinition {
  key: AmenityKey;
  label: string;
  shortLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export const AMENITIES: Record<AmenityKey, AmenityDefinition> = {
  wifi: {
    key: 'wifi',
    label: 'Sürətli Wi-Fi',
    shortLabel: 'Wi-Fi',
    icon: 'wifi',
    description: 'Bütün otaqlarda və ictimai yerlərdə yüksəksürətli ödənişsiz internet',
  },
  breakfast: {
    key: 'breakfast',
    label: 'Zəngin səhər yeməyi',
    shortLabel: 'Səhər yeməyi',
    icon: 'cafe',
    description: 'Açıq bufet və ya otağa servis edilən kontinental səhər yeməyi',
  },
  parking: {
    key: 'parking',
    label: 'Təhlükəsiz parkinq',
    shortLabel: 'Parkinq',
    icon: 'car',
    description: 'Qonaqlar üçün ayrılmış xüsusi və mühafizə olunan parklanma yeri',
  },
  gym: {
    key: 'gym',
    label: 'Fitnes və idman zalı',
    shortLabel: 'Fitnes',
    icon: 'barbell',
    description: 'Müasir kardio və güc trenajorları ilə təchiz olunmuş fitnes mərkəzi',
  },
  pool: {
    key: 'pool',
    label: 'Bağlı və ya açıq hovuz',
    shortLabel: 'Hovuz',
    icon: 'water',
    description: 'İstirahət və üzgüçülük üçün istilik tənzimləməli hovuz',
  },
  spa: {
    key: 'spa',
    label: 'SPA və sauna xidmətləri',
    shortLabel: 'SPA',
    icon: 'flower',
    description: 'Masaj, fin saunası, buxar otağı və bədənə qulluq prosedurları',
  },
  ac: {
    key: 'ac',
    label: 'Kondisioner sistemi',
    shortLabel: 'Kondisioner',
    icon: 'snow',
    description: 'Otaqda fərdi tənzimlənən iqlim nəzarəti və havalandırma',
  },
  restaurant: {
    key: 'restaurant',
    label: 'Milli və dünya mətbəxi restoranı',
    shortLabel: 'Restoran',
    icon: 'restaurant',
    description: 'A la carte menyu və 24 saat otaq servisi təklif edən lüks restoran',
  },
  airportShuttle: {
    key: 'airportShuttle',
    label: 'Hava limanı transferi',
    shortLabel: 'Transfer',
    icon: 'airplane',
    description: 'Heydər Əliyev adına Beynəlxalq Hava Limanından qarşılama və aparılma',
  },
  petFriendly: {
    key: 'petFriendly',
    label: 'Ev heyvanları qəbul edilir',
    shortLabel: 'Heyvansevər',
    icon: 'paw',
    description: 'Ev heyvanları ilə rahat səyahət edənlər üçün xüsusi şərait',
  },
};

export const AMENITY_LIST: AmenityDefinition[] = Object.values(AMENITIES);

export function getAmenityInfo(key: AmenityKey): AmenityDefinition {
  return AMENITIES[key] || {
    key,
    label: key,
    shortLabel: key,
    icon: 'checkmark-circle-outline',
    description: '',
  };
}