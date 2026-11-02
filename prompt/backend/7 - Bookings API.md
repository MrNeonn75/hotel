Bookings router və booking_service yaz (guest məcburi).

POST /api/v1/bookings
Body: hotelId, checkIn, checkOut, adults, children, firstName, lastName, phone, email, specialRequests.
Header: Idempotency-Key (məcburi). Eyni açarla təkrar sorğu yeni rezervasiya yaratmasın, əvvəlkini qaytarsın.
Məntiq (hamısı bir DB tranzaksiyasında):
1) Validasiya: checkIn bu gündən əvvəl ola bilməz, checkOut > checkIn, maksimum 30 gecə, adults >= 1, uşaq + böyük sayı limiti (məs. 6).
2) Otel aktivdirmi yoxla (yoxsa 404).
3) Boş otaq yoxla: hotel sətrini SELECT ... FOR UPDATE ilə kilidlə ki, eyni anda overbooking olmasın. Boş otaq yoxdursa 409 (code: NO_AVAILABILITY, Azərbaycan dilində mesaj).
4) Qiyməti SERVERDƏ hesabla: nights, pricePerNight (otelin cari discounted_price), discountAmount ((standard-discounted)*nights), totalPrice. Frontend-dən heç bir məbləğ qəbul etmə.
5) Unikal oxunaqlı reference yarat (STN- + 6 simvol, 0/O/1/I çıxarılmış əlifba, toqquşmada yenidən cəhd).
6) hotel_snapshot (ad, ünvan, ilk şəkil) yaz ki, otel sonradan dəyişsə də tarixçə düzgün qalsın.
7) Eyni zamanda guest profilini avtomatik yenilə: firstName, lastName, phone, email dəyərləri profildə boşdursa və ya fərqlidirsə yenilənsin (frontend-də avtomatik doldurma məntiqinə uyğun).
Status: confirmed, paymentStatus: unpaid. 201 qaytar.

GET /api/v1/bookings: guest-in rezervasiyaları, ən yenisi yuxarıda, ?status= filtri, səhifələmə.
GET /api/v1/bookings/{id}: tək rezervasiya (başqasının olsa 404).
POST /api/v1/bookings/{id}/cancel: yalnız confirmed və checkIn-dən ən azı 24 saat əvvəl; əks halda 409 (code: CANCELLATION_NOT_ALLOWED). cancelled_at yazılsın, paymentStatus paid idisə refunded olsun. İdempotent: artıq ləğv olunubsa 200 və cari vəziyyət.
Cavab sxemi: id, reference, hotel (snapshot), checkIn, checkOut, nights, adults, children, pricePerNight, discountAmount, totalPrice, currency, status, paymentStatus, createdAt, firstName, lastName, phone, email, specialRequests.
Testlər: uğurlu rezervasiya, idempotentlik, overbooking (paralel sorğularla), səhv tarixlər, ləğv qaydaları, qiymət hesablaması.