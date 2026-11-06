import { AmenityKey } from '@/types/hotel';

export interface AmenityDefinition {
  key: AmenityKey;
  label: string;
  iconName: string;
}

export const AMENITIES: Record<AmenityKey, AmenityDefinition> = {
  wifi: {
    key: 'wifi',
    label: 'Pulsuz Wi-Fi',
    iconName: 'Wifi',
  },
  breakfast: {
    key: 'breakfast',
    label: 'Səhər yeməyi',
    iconName: 'Coffee',
  },
  parking: {
    key: 'parking',
    label: 'Parkinq yeri',
    iconName: 'CircleParking',
  },
  gym: {
    key: 'gym',
    label: 'Fitnes / Trenajor',
    iconName: 'Dumbbell',
  },
  pool: {
    key: 'pool',
    label: 'Hovuz',
    iconName: 'Waves',
  },
  spa: {
    key: 'spa',
    label: 'SPA və Masaj',
    iconName: 'Sparkles',
  },
  ac: {
    key: 'ac',
    label: 'Kondisioner',
    iconName: 'Wind',
  },
  restaurant: {
    key: 'restaurant',
    label: 'Restoran',
    iconName: 'Utensils',
  },
  reception24: {
    key: 'reception24',
    label: '24/7 Qəbul',
    iconName: 'ConciergeBell',
  },
  bar: {
    key: 'bar',
    label: 'Bar / Lounge',
    iconName: 'Wine',
  },
  airportShuttle: {
    key: 'airportShuttle',
    label: 'Aeroport transferi',
    iconName: 'Car',
  },
  petFriendly: {
    key: 'petFriendly',
    label: 'Ev heyvanları qəbulu',
    iconName: 'PawPrint',
  },
};

