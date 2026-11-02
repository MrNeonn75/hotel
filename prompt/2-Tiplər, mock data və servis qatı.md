1) types/hotel.ts:
type AmenityKey = 'wifi' | 'breakfast' | 'parking' | 'gym' | 'pool' | 'spa' | 'ac' | 'restaurant' | 'airportShuttle' | 'petFriendly';
interface Hotel { id: string; name: string; city: string; address: string; latitude: number; longitude: number; images: string[]; rating: number; reviewCount: number; description: string; standardPrice: number; discountedPrice: number; discountPercent: number; currency: 'AZN'; amenities: AmenityKey[]; advantages: string[]; rules: string[]; importantInfo: string[]; checkInTime: string; checkOutTime: string; }

2) constants/amenities.ts: hər AmenityKey üçün Azərbaycan dilində label və Ionicons/MaterialCommunityIcons ikon adı (wifi, səhər yeməyi, parking, idman zalı, hovuz, spa, kondisioner, restoran, hava limanı transferi, ev heyvanları qəbul olunur).

3) data/hotels.ts: Bakı üzrə 10 realistik mock otel (Sahil, Nizami küçəsi, Flame Towers ətrafı, İçərişəhər, Bulvar, Port Baku və s. ərazilər üçün real koordinatlarla). Hər otel üçün: 5 şəkil (unsplash hotel şəkil URL-ləri, ?w=1200 parametri ilə), real qiymət aralığı (80-450 AZN), endirim 10-45%, 4-8 xidmət, 3-5 üstünlük, 4-6 qayda, 3-4 vacib məlumat. Hamısı Azərbaycan dilində.

4) services/hotelService.ts: getHotels(), getHotelById(id), getHotelsByIds(ids). Hamısı Promise qaytarsın və 400-700ms süni gecikmə olsun ki, loading vəziyyətləri test edilə bilsin. Ekranlar mock data-nı birbaşa import etməsin, yalnız bu servisdən alsın.

5) utils/format.ts: formatPrice(amount) -> "120 ₼", formatDate(date) -> "12 Okt", nightsBetween(start, end).