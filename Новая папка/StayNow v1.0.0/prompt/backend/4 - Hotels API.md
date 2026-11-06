Hotels router-ini repository + service qatları ilə yaz.

ENDPOINT-LƏR:
1) GET /api/v1/hotels
   Query parametrləri: q (ad/ünvana görə axtarış, ILIKE), city, minPrice, maxPrice (endirimli qiymətə görə), amenities (vergüllə ayrılmış açarlar, hamısı olmalıdır), minRating, hasDiscount (bool), sort (recommended | price_asc | price_desc | rating_desc | discount_desc), checkIn, checkOut, guests (verilərsə həmin tarixlərdə boş otağı olan otellər), lat, lng, radiusKm (verilərsə məsafəyə görə filtr və distanceKm sahəsi, Haversine ilə), page (default 1), pageSize (default 20, max 50).
   Cavab: { "items": [Hotel], "page": 1, "pageSize": 20, "total": 10 }.
2) GET /api/v1/hotels/{id}: tam otel məlumatı (şəkillər position sırası ilə, amenities, advantages, rules, importantInfo). Tapılmasa 404 (Azərbaycan dilində mesaj).
3) GET /api/v1/hotels/by-ids?ids=a,b,c: favorites ekranı üçün, verilmiş ardıcıllığı qoruyaraq (maks 50 id).
4) GET /api/v1/hotels/{id}/availability?checkIn=&checkOut=&guests=: { "available": true, "roomsLeft": 4 }.

Hotel cavab sxemi frontend tipi ilə tam uyğun olsun: id, name, city, address, latitude, longitude, images[] (yalnız url-lər), rating, reviewCount, description, standardPrice, discountedPrice, discountPercent, currency, amenities[] (açar siyahısı), advantages, rules, importantInfo, checkInTime, checkOutTime. Siyahı üçün yüngül HotelListItem sxemi də yarat (təsvir, qaydalar olmadan).
N+1 sorğu olmasın (selectinload/joinedload). Boş otaq hesablaması üçün availability məntiqini booking_service-də ayrıca funksiya kimi yaz (kəsişən confirmed rezervasiyaların sayı < rooms_total).
Hər endpoint üçün pytest testləri yaz.