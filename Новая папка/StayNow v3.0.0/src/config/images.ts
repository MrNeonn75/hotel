/**
 * Şəkil CDN və Placeholder Konfiqurasiyası
 *
 * Otel şəkilləri üçün etibarlı və yüksək keyfiyyətli Unsplash CDN bağlantıları
 */

export const IMAGE_CONFIG = {
  baseUrl: 'https://images.unsplash.com',
  defaultParams: '?auto=format&fit=crop&w=1200&q=80',
  thumbnailParams: '?auto=format&fit=crop&w=400&q=70',
  hotelPlaceholders: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945', // Luxury hotel facade
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b', // Hotel suite bedroom
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', // Hotel lounge pool
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d', // Seaside resort hotel
    'https://images.unsplash.com/photo-1590490360182-c33d57733427', // Modern hotel interior
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', // Boutique hotel balcony
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', // Grand hotel lobby
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7', // Hotel swimming pool
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39', // Premium hotel bedroom
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461', // Luxury bathroom suite
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af', // Cozy hotel room
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791', // Historic boutique hotel
  ],
};

/**
 * Verilmiş ID və ya indeksə əsasən sabit və keyfiyyətli şəkil URL-i qaytarır
 */
export function getHotelImageUrl(index: number, isThumbnail = false): string {
  const base = IMAGE_CONFIG.hotelPlaceholders[index % IMAGE_CONFIG.hotelPlaceholders.length];
  const params = isThumbnail ? IMAGE_CONFIG.thumbnailParams : IMAGE_CONFIG.defaultParams;
  return `${base}${params}`;
}

