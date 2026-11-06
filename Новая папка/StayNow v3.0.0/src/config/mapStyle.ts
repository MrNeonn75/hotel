/**
 * Google Maps Tünd Tema Stili (Custom Map Style)
 *
 * StayNow dizayn sisteminə uyğunlaşdırılmış xəritə stili:
 * - Quru və baza fon: #0F0E17 / #141320
 * - Dəniz və su hövzələri: Tünd mavi-bənövşəyi (#17152B)
 * - Yollar: Sərhəd rəngi (#2B2A3A / #38364D)
 * - Mətnlər və etiketlər: #A3A3B5 / #6E6D82
 */

export const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#0F0E17' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A3A3B5' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0F0E17' }, { weight: 3 }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#2B2A3A' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#38364D' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#F5F5FA' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1A1926' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6E6D82' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#141E1C' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#34D399' }, { lightness: -20 }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#201F2E' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#141320' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#888799' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#2B2A3A' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#38364D' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1F1E2E' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#44425E' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#241F3D' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9B88F2' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17152B' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6E6D82' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0F0E17' }],
  },
];

