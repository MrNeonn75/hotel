import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AmenityKey } from '@/types/hotel';

export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export interface AmenityItem {
  key: AmenityKey;
  label: string;
  icon: IoniconsName;
}

export const AMENITIES: Record<AmenityKey, AmenityItem> = {
  wifi: {
    key: 'wifi',
    label: 'Wi-Fi',
    icon: 'wifi',
  },
  breakfast: {
    key: 'breakfast',
    label: 'Səhər yeməyi',
    icon: 'cafe',
  },
  parking: {
    key: 'parking',
    label: 'Parking',
    icon: 'car',
  },
  gym: {
    key: 'gym',
    label: 'İdman zalı',
    icon: 'barbell',
  },
  pool: {
    key: 'pool',
    label: 'Hovuz',
    icon: 'water',
  },
  spa: {
    key: 'spa',
    label: 'Spa',
    icon: 'sparkles',
  },
  ac: {
    key: 'ac',
    label: 'Kondisioner',
    icon: 'snow',
  },
  restaurant: {
    key: 'restaurant',
    label: 'Restoran',
    icon: 'restaurant',
  },
  airportShuttle: {
    key: 'airportShuttle',
    label: 'Hava limanı transferi',
    icon: 'airplane',
  },
  petFriendly: {
    key: 'petFriendly',
    label: 'Ev heyvanları qəbul olunur',
    icon: 'paw',
  },
};

export function getAmenity(key: AmenityKey): AmenityItem {
  return AMENITIES[key] || {
    key,
    label: key,
    icon: 'checkmark-circle-outline',
  };
}

