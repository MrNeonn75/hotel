1) types/hotel.ts:
type AmenityKey = 'wifi' | 'breakfast' | 'parking' | 'gym' | 'pool' | 'spa' | 'ac' | 'restaurant' | 'airportShuttle' | 'petFriendly';
interface Hotel {
 id: string; name: string; city: string; neighborhood: string; address: string; latitude: number; longitude: number;
 images: string[]; starRating: number (1-5); rating: number (0-10 miqyası, məs. 8.7); reviewLabel: string ("Əla", "Çox yaxşı"...); reviewCount: number;
 tagline: string (1 cümləlik "Nəyə görə seçməlisiniz" mətni); description: string;
 standardPrice: number; discountedPrice: number; discountPercent: number; currency: 'AZN';
 amenities: AmenityKey[]; advantages: string[]; rules: string[]; importantInfo: string[];
 checkInTime: string; checkOutTime: string; freeCancellation: boolean; roomsLeft: number | null; dealLabel: string | null (məs. "Bu gecənin təklifi");
}
Backend tezliklə bu sahələri qaytaracaq, ona görə adlar dəqiq bu cür olsun. rating 0-10 miqyasındadır (əvvəlki 0-5 deyil).

2) constants/amenities.ts: hər açar üçün Azərbaycan dilində etiket və ikon.
3) data/hotels.ts: Bakı üzrə 10 realistik mock otel (Sahil, Nizami küçəsi, Flame Towers ətrafı, İçərişəhər, Bulvar, Port Baku və s., real koordinatlar). Hər birində 6 şəkil (unsplash otel şəkilləri, ?w=1200), qiymətlər 80-450 AZN, endirim 10-45%, starRating 3-5, rating 7.5-9.6 və uyğun reviewLabel, 4-8 xidmət, tagline, roomsLeft (bəziləri 1-5, bəziləri null), bəzilərində dealLabel, hamısı Azərbaycan dilində.
4) services/hotelService.ts: getHotels(params), getHotelById(id), getHotelsByIds(ids) (Promise, 400-700ms gecikmə). Ekranlar mock data-nı birbaşa import etməsin, yalnız bu servisdən alsın.
5) utils/format.ts: formatPrice -> "120 ₼", formatDateShort -> "12 Okt", formatDateRange -> "12-14 Okt", nightsBetween.
6) store/searchStore.ts (Zustand): city (default "Bakı"), checkIn (default bu gün), checkOut (default sabah), guests {adults:2, children:0}, sort, filters. Bütün ekranlar bu axtarış vəziyyətini paylaşsın.