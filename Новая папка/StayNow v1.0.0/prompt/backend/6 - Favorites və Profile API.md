FAVORITES (guest məcburi):
- GET /api/v1/favorites -> favorit otellərin tam siyahısı (HotelListItem), ən son əlavə olunan birinci.
- GET /api/v1/favorites/ids -> yalnız id-lər (UI-da ürəkləri tez doldurmaq üçün).
- PUT /api/v1/favorites/{hotelId} -> əlavə et (idempotent: artıq varsa 200, yoxdursa 201; otel yoxdursa 404).
- DELETE /api/v1/favorites/{hotelId} -> sil (idempotent, həmişə 204).
- POST /api/v1/favorites/sync: body { "hotelIds": [...] }, telefonda lokal saxlanılan favoritləri serverlə birləşdirir (union) və yekun id siyahısını qaytarır (ilk dəfə backend-ə keçid üçün).

PROFILE (guest məcburi):
- GET /api/v1/profile -> profil, yoxdursa boş sahələrlə default cavab (404 yox).
- PUT /api/v1/profile -> bütün sahələri yenilə (upsert). Sahələr: firstName, lastName, phone, email, birthDate, nationality, documentNumber, city, address, preferredLanguage.
- DELETE /api/v1/profile -> bütün şəxsi məlumatları sil (GDPR üzrə), favorites və bookings qalır, amma bookings-dəki şəxsi məlumatlar anonimləşdirilsin.
VALİDASİYA: phone +994XXXXXXXXX formatı (normalizasiya et), email EmailStr, birthDate keçmişdə olmalıdır, preferredLanguage yalnız az/en/ru.
TƏHLÜKƏSİZLİK: documentNumber bazada Fernet ilə şifrələnib saxlanılsın (ENCRYPTION_KEY .env-dən), API cavabında yalnız maskalanmış şəkildə qayıtsın (məs. "AA****567"), loglara heç vaxt düşməsin.
Testlər yaz (idempotentlik, izolyasiya, şifrələmə, maskalama).