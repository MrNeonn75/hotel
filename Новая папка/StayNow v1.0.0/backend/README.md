# StayNow — FastAPI Backend

StayNow mobil otel rezervasiyası tətbiqi üçün yüksək performanslı, asinxron REST API backend xidməti.

## 🛠 Texnoloji Stek
* **Freymvork:** FastAPI (Python 3.12+)
* **ORM:** SQLAlchemy 2.0 (asyncio, `asyncpg`, SQLite test dəstəyi ilə)
* **Verilənlər Bazası:** PostgreSQL 16
* **Miqrasiyalar:** Alembic
* **Sxemlər və Validasiya:** Pydantic v2 + `pydantic-settings`
* **Şifrələmə:** Cryptography (Fernet)
* **Paket İdarəetməsi:** `uv`
* **Testlər:** Pytest + `pytest-asyncio` + `httpx`
* **Linter & Formatter:** Ruff
* **Konteynerləşdirmə:** Docker & Docker Compose

---

## 📁 Layihə Strukturu
```text
backend/
├── app/
│   ├── main.py              # FastAPI tətbiqinin giriş nöqtəsi, middleware və xəta idarəediciləri
│   ├── deps.py              # Asılılıq inyeksiyası (get_current_guest, get_db, service repos)
│   ├── core/
│   │   ├── config.py        # Pydantic-settings ilə .env konfiqurasiyası
│   │   ├── database.py      # SQLAlchemy 2.0 asinxron mühərrik və sessiyalar
│   │   ├── security.py      # Fernet simmetrik şifrələmə köməkçisi (DataEncryptor)
│   │   ├── errors.py        # Vahid xəta formatı və qlobal exception handler-lər
│   │   └── logging.py       # Request-ID ilə struktur loglama
│   ├── models/              # SQLAlchemy verilənlər bazası modelləri
│   │   ├── base.py          # BaseMixin (id, created_at, updated_at)
│   │   ├── guest.py         # Guest və GuestProfile (user_id sahəsi ilə)
│   │   ├── hotel.py         # Otel modeli (qiymətlər, koordinatlar, xidmətlər, şəkillər)
│   │   ├── booking.py       # Rezervasiya modeli (GDPR anonimləşdirmə dəstəyi)
│   │   └── favorite.py      # Favoritlər əlaqəsi (uq_favorites_guest_hotel)
│   ├── schemas/             # Pydantic v2 sxemləri (JSON camelCase)
│   │   ├── base.py          # CamelModel baza sinfi
│   │   ├── health.py        # Sistem sağlamlığı sxemi
│   │   ├── hotel.py         # Otel sorğu/cavab sxemləri
│   │   ├── booking.py       # Rezervasiya sxemləri
│   │   ├── profile.py       # İstifadəçi profili sxemləri və validasiyaları
│   │   ├── favorite.py      # Favorit sxemləri (FavoriteActionResponse, FavoriteSyncRequest)
│   │   └── error.py         # Vahid xəta sxemi
│   ├── routers/             # API v1 marşrutları (/api/v1/...)
│   │   ├── api.py           # Bütün marşrutların birləşdirilməsi
│   │   ├── health.py        # GET /api/v1/health (DB yoxlanışı ilə)
│   │   ├── hotels.py        # Otel axtarışı və detalları (İctimai / Public)
│   │   ├── bookings.py      # Rezervasiya yaratma, tarixçə və ləğv (Qonaq məcburi)
│   │   ├── favorites.py     # Favoritlərin idarə edilməsi (Qonaq məcburi)
│   │   └── profile.py       # Profil məlumatlarının idarə edilməsi və GDPR silinmə (Qonaq məcburi)
│   ├── services/            # Biznes məntiqi layı
│   │   ├── hotel_service.py
│   │   ├── booking_service.py
│   │   ├── favorite_service.py
│   │   └── profile_service.py
│   └── repositories/        # Verilənlər bazası sorğuları layı (Repository pattern)
├── alembic/                 # Verilənlər bazası miqrasiyaları
├── scripts/
│   └── seed.py              # Bakı otellərini bazaya yazan skript
├── tests/                   # Asinxron vahid və inteqrasiya testləri
├── Dockerfile               # İstehsalat və inkişaf üçün Docker faylı
├── docker-compose.yml       # PostgreSQL 16 və API xidmətləri
├── Makefile                 # Rahat icra əmrləri
├── pyproject.toml           # Layihə asılılıqları
└── .env.example             # Konfiqurasiya nümunəsi
```

---

## 🔑 Anonim Cihaz İdentifikasiyası (`X-Device-Id`)

StayNow tətbiqində ilkin mərhələdə məcburi qeydiyyat tələb olunmur. İstifadəçilər cihaz səviyyəsində `X-Device-Id` HTTP başlığı vasitəsilə tanınır:

* **Format:** Başlıq mütləq etibarlı **UUID v4** formatında olmalıdır. Əks halda API `400 Bad Request` xətası qaytarır (`"X-Device-Id etibarlı UUID v4 formatında olmalıdır"`).
* **Avtomatik qeydiyyat (Race-condition davamlı):** `GuestRepository.get_or_create_by_device_id` metodu unikal məhdudiyyət və `ON CONFLICT (device_id) DO UPDATE SET last_seen_at = now` atomik əməliyyatı ilə işləyir. Cədvəldə yoxdursa avtomatik yaradılır və ilkin `GuestProfile` bağlanır.
* **Resurs İzolyasiyası:** Bir qonağın rezervasiyaları və ya profili başqa qonağa heç vaxt görünmür; sorğular həmişə `guest_id` ilə filtrlənir və yad resursa daxil olmaq istədikdə `404 Not Found` qaytarılır.
* **Açıq və Qapalı marşrutlar:**
  * Otel axtarışı (`/hotels`, `/hotels/{id}`, `/hotels/by-ids`) ictimaidir (`X-Device-Id` tələb olunmur).
  * Favoritlər (`/favorites/*`), Profil (`/profile`) və Rezervasiyalar (`/bookings/*`) `X-Device-Id` başlığını məcburi tələb edir.

### 🔄 Gələcək JWT Auth Miqrasiyası (`guest_id` -> `user_id`)
Arxitektura elə qurulmuşdur ki, sonradan istifadəçi qeydiyyatı və JWT autentifikasiyası əlavə olunduqda:
1. Yalnız `app/deps.py` daxilindəki `get_current_guest` / `get_current_user` dependency-si yenilənəcək.
2. `Guest` modelində artıq `user_id: Mapped[uuid.UUID | None]` sahəsi mövcuddur. İstifadəçi qeydiyyatdan keçdikdə və ya daxil olduqda, mövcud anonim `Guest` qeydi həmin `User`-ə bağlanacaq və istifadəçinin cihazdakı bütün favorit və rezervasiyaları yeni profilə avtomatik inteqrasiya olunacaq.

---

## 📌 Əsas API Endpoint-ləri
Bütün cavablar mobil tətbiq ilə tam uyğunluq üçün **camelCase** açarları ilə qaytarılır:

### 1. İctimai Endpoint-lər
* `GET /api/v1/health` — Sistem və DB sağlamlıq yoxlanışı
* `GET /api/v1/cities` — Aktiv şəhərlərin siyahısı və hər şəhərdəki otel sayı (`name`, `hotelCount`)
* `GET /api/v1/hotels` — Otellərin siyahısı (axtarış, qiymət, xidmət, `minStars`, `minRating` (0-10), Haversine məsafəsi və sıralama filtrləri). Cavabda `starRating`, `neighborhood`, `tagline`, `freeCancellation`, `dealLabel`, `reviewLabel`, `roomsLeft` qaytarılır.
* `GET /api/v1/hotels/{id}` — Seçilmiş otelin tam detalları (istəyə görə `checkIn`, `checkOut` tarixləri ilə `roomsLeft` hesablamaq imkanı)
* `GET /api/v1/hotels/by-ids` — ID siyahısı üzrə otellər (sıralamanı qoruyur)
* `GET /api/v1/hotels/{id}/availability` — Boş otaq mövcudluğu

### 2. Favoritlər API (`X-Device-Id` məcburi)
* `GET /api/v1/favorites` — Favorit otellərin tam siyahısı (`HotelListItem`), ən son əlavə olunan birinci.
* `GET /api/v1/favorites/ids` — Yalnız otel ID-ləri (`list[str]`), UI-da ürəkləri tez doldurmaq üçün.
* `PUT /api/v1/favorites/{hotelId}` — Oteli favoritə əlavə et (idempotent: artıq varsa `200 OK`, yenidirsə `201 Created`, otel yoxdursa `404 Not Found`).
* `DELETE /api/v1/favorites/{hotelId}` — Oteli favoritlərdən sil (idempotent: həmişə `204 No Content`).
* `POST /api/v1/favorites/sync` — Body: `{"hotelIds": [...]}`. Lokal cihaz favoritlərini serverlə birləşdirir (union) və yekun ID siyahısını qaytarır.

### 3. Profil API (`X-Device-Id` məcburi)
* `GET /api/v1/profile` — Cari qonağın profil məlumatları. Əgər doldurulmayıbsa boş sahələrlə default cavab qaytarır (heç vaxt `404` qaytarmır).
* `PUT /api/v1/profile` — Bütün profil sahələrini yeniləyir (upsert):
  * `phone`: `+994XXXXXXXXX` formatına normalizasiya olunur (`050 123 45 67` -> `+994501234567`).
  * `email`: Email formatı yoxlanılır.
  * `birthDate`: Yalnız keçmiş tarix qəbul edilir (`birth_date < date.today()`).
  * `preferredLanguage`: Yalnız `az`, `en`, `ru` dilləri qəbul edilir.
  * `documentNumber`: Verilənlər bazasında **Fernet** ilə şifrələnərək saxlanılır, loglara heç vaxt düşmür və API cavabında yalnız maskalanmış şəkildə qayıdır (`AA****567`).
* `DELETE /api/v1/profile` — GDPR üzrə şəxsi məlumatları silir:
  * Profilin şəxsi sahələri sıfırlanır.
  * Qonağın mövcud rezervasiyalarındakı şəxsi məlumatlar anonimləşdirilir (`Anonim Qonaq`, `+994000000000`, `deleted@staynow.az`).
  * Favoritlər və rezervasiya sənədləri toxunulmaz qalır.

### 4. Rezervasiyalar API (`X-Device-Id` məcburi)
* `POST /api/v1/bookings` — Yeni rezervasiya yaradılması (`STN-XXXXXX` formatında unikal reference kodu ilə)
* `GET /api/v1/bookings` — Qonağın rezervasiya tarixçəsi (ən yenisi yuxarıda)
* `GET /api/v1/bookings/{id}` — Tək rezervasiya detalları (yad qonağa `404`)
* `PATCH /api/v1/bookings/{id}/cancel` — Rezervasiyanın ləğv edilməsi (yad qonağa `404`)

---

## 🔒 Təhlükəsizlik və Məlumatların Qorunması
* **Fernet Şifrələmə:** İstifadəçilərin şəxsiyyət vəsiqəsi / pasport sənəd nömrələri (`document_number`) verilənlər bazasında `DataEncryptor` vasitəsilə 256-bit AES şifrələmə ilə saxlanılır.
* **Məlumat Maskalanması:** API cavablarında açıq sənəd nömrəsi heç vaxt ötürülmür, yalnız `AA****567` formatında maskalanır.
* **Log Təhlükəsizliyi:** Sənəd nömrələri heç vaxt server loglarına düşmür.
* **GDPR Silinməsi:** İstifadəçi profilini sildikdə şəxsi məlumatlar təmizlənir və arxiv rezervasiyalardakı şəxsi məlumatlar dərhal anonimləşdirilir.

---

## 🧪 Testlərin İcrası
Bütün testləri işə salmaq üçün:
```bash
pytest -v
```
Testlər daxildir:
* `test_hotels_api.py` — Otel axtarışı, filtrlər, Haversine məsafəsi, sıralama və boş otaq hesabı.
* `test_guest_auth.py` — `X-Device-Id` başlıq validasiyası, yeni qonaq yaranması, təkrar sorğular, ictimai marşrutlar və resurs izolyasiyası.
* `test_favorites_api.py` — Favoritlər CRUD, 201/200/204 idempotentlik, local-server sinxronizasiyası və qonaqlararası izolyasiya.
* `test_profile_api.py` — Profil defoltları, validasiyalar (telefon, email, doğum tarixi, dil), Fernet şifrələmə, sənəd maskalama, GDPR silinmə və izolyasiya.
* `test_errors.py` və `test_health.py` — Vahid xəta idarəetməsi və sistem sağlamlığı.
