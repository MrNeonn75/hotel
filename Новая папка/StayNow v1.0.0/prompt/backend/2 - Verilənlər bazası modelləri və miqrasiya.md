SQLAlchemy 2.0 (Mapped, mapped_column) ilə modelləri və Alembic miqrasiyasını yarat. Bütün id-lər UUID, hamısında created_at/updated_at (timezone-aware).

MODELLƏR:
1) Hotel: name, city, address, latitude, longitude, description, standard_price (Numeric 10,2), discounted_price, discount_percent (hesablanan və ya saxlanan), currency (default 'AZN'), rating (Numeric 2,1), review_count, check_in_time, check_out_time, rooms_total (int), is_active (bool), advantages (ARRAY(Text)), rules (ARRAY(Text)), important_info (ARRAY(Text)).
2) HotelImage: hotel_id FK (cascade), url, position (sıralama üçün).
3) Amenity: key (unikal: wifi, breakfast, parking, gym, pool, spa, ac, restaurant, airportShuttle, petFriendly), label_az.
4) hotel_amenities: many-to-many əlaqə cədvəli.
5) Guest: device_id (unikal, indeksli), last_seen_at. (Login olmadığı üçün anonim istifadəçi. Gələcəkdə user_id FK əlavə olunacaq.)
6) GuestProfile: guest_id (unikal FK), first_name, last_name, phone, email, birth_date, nationality, document_number_encrypted (Text), city, address, preferred_language.
7) Favorite: guest_id, hotel_id, unikal (guest_id, hotel_id).
8) Booking: reference (unikal, qısa oxunaqlı kod, məs. "STN-7K2P9X"), guest_id, hotel_id, check_in (date), check_out (date), adults, children, first_name, last_name, phone, email, special_requests, nights, price_per_night, discount_amount, total_price, currency, status (enum: confirmed, cancelled), payment_status (enum: unpaid, paid, refunded; default unpaid), hotel_snapshot (JSONB: ad, ünvan, ilk şəkil), idempotency_key (unikal, nullable), cancelled_at.

İNDEKSLƏR: hotels(city, is_active), hotels(discounted_price), bookings(guest_id, created_at desc), bookings(hotel_id, check_in, check_out), favorites(guest_id).
CHECK constraint-lər: check_out > check_in, adults >= 1, rating 0-5, discounted_price <= standard_price.
Alembic ilə ilk miqrasiya skriptini yarat və "make migrate" ilə tətbiq olunduğunu yoxla.