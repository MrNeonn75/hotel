scripts/seed.py yaz (idempotent, təkrar işə salanda dublikat yaratmasın):
- 10 amenity (açar + Azərbaycan dilində label).
- Bakı üzrə 10 realistik otel (frontend-dəki data/hotels.ts ilə eyni adlar, ünvanlar, koordinatlar, qiymətlər, xidmətlər, üstünlüklər, qaydalar, vacib məlumatlar). Hər otel üçün 5 şəkil URL-i (unsplash, ?w=1200), 80-450 AZN qiymət aralığı, 10-45% endirim, rooms_total 10-60 arası.
- Hər otelin discount_percent dəyəri standard_price və discounted_price-dan düzgün hesablanmış olsun.
"make seed" əmri ilə işə düşsün. Seed-dən sonra bazada neçə otel yarandığını konsola yazsın.