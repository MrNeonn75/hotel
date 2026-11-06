Mövcud StayNow FastAPI backend-ini YENİLƏ və serverə yenidən deploy et. Bu mövcud, işləyən istehsal sistemidir, ona görə dəyişikliklər geriyə uyğun (backward compatible) və təhlükəsiz olmalıdır.

═══ GİRİŞ MƏLUMATLARI (mən dolduracağam) ═══
SERVER_IP: ____________
SSH_USER: ____________
SSH_PASSWORD (və ya açar): ____________
SSH_PORT: 22
BACKEND_PATH (lokal): ____________
SERVERDƏ LAYİHƏ QOVLUĞU: /opt/staynow (başqa yerdədirsə, əvvəlki deploy-da istifadə olunan yer)
API URL: ____________

═══ SERVER QAYDALARI (pozulmaz) ═══
- Parol/token/açarı heç vaxt fayla, git-ə, loqa və hesabata yazma.
- Serverdə başqa aktiv layihələr var. YALNIZ "staynow" prefiksli konteynerlərə/compose layihəsinə toxun. Qadağan: başqa konteynerləri dayandırmaq/restart etmək, docker system/volume/network prune, Docker daemon və ya proxy servisinin restart-ı, mövcud nginx/caddy fayllarının dəyişdirilməsi, firewall dəyişikliyi, qlobal paket yeniləməsi. Portları dəyişdirmə, mövcud staynow port xəritəsini saxla.
- Dəyişiklikdən ƏVVƏL: (a) Postgres-in tam backup-ı: `docker exec staynow-db pg_dump -U <user> <db> | gzip > ~/backup-staynow-$(date +%F-%H%M).sql.gz` və faylın ölçüsünü yoxla; (b) serverdəki mövcud kodun və .env-in surətini ~/backup-staynow-code-... qovluğuna al.
- Qeyri-müəyyənlik olarsa DAYAN və mənə sual ver.

═══ A. KODDA DƏYİŞİKLİKLƏR (lokal, əvvəlcə test et) ═══

1) Hotel modelinə yeni sütunlar (hamısı nullable və ya default-lu ki, mövcud sətirlər sınmasın):
- star_rating (smallint, default 3, CHECK 1-5), neighborhood (text, default ''), tagline (text, default ''), free_cancellation (bool, default true), deal_label (text, nullable).
- rating-in MİQYASINI dəyiş: 0-10 (Numeric 3,1; CHECK 0-10). Miqrasiyada mövcud 0-5 dəyərlərini 2-yə vurub 10-luq miqyasa çevir (UPDATE ... SET rating = rating * 2 WHERE rating <= 5), çevirmənin yalnız BİR DƏFƏ işləməsini təmin et (miqrasiya idempotent/versiyalı olsun).
2) Alembic miqrasiyası (ayrıca, adlı): upgrade və downgrade yaz. Əvvəlcə lokal test bazasında yoxla.
3) Cavab sxemləri (Hotel və HotelListItem) YENİ sahələrlə genişlənsin (camelCase): starRating, neighborhood, tagline, freeCancellation, dealLabel, reviewLabel (hesablanan: >=9.0 "Əla", >=8.0 "Çox yaxşı", >=7.0 "Yaxşı", əks halda "Orta"), roomsLeft (hesablanan, aşağıya bax). Mövcud sahələrin adlarına və tiplərinə toxunma. Köhnə sahələr qalır.
4) roomsLeft hesablaması: siyahı və detal endpoint-lərində checkIn/checkOut verilirsə həmin tarixlər üzrə (rooms_total - kəsişən confirmed rezervasiyalar), verilmirsə bu gecə üçün hesabla. Nəticə 5-dən böyükdürsə null qaytar (yalnız az qalanda göstərmək üçün), 0 və ya aşağıdırsa 0. N+1 sorğu olmasın: siyahı üçün toplu (aggregate) sorğu istifadə et.
5) Yeni endpoint: GET /api/v1/cities → [{ "name": "Bakı", "hotelCount": 10 }] (yalnız aktiv otelləri olan şəhərlər, hotelCount azalan sıra ilə).
6) GET /hotels-də: sort=recommended üçün sıralamanı təkmilləşdir (dealLabel olanlar və yüksək reytinq yuxarı), yeni filtr minStars (1-5), amenities filtri mövcud kimi qalır. Mövcud query parametrləri dəyişməsin.
7) scripts/seed.py: mövcud otelləri id/ad ilə tap və yeni sahələri UPDATE ilə doldur (dublikat yaratma). Hər otel üçün realistik star_rating (3-5), neighborhood (Sahil, İçərişəhər, Nizami, Bulvar və s.), tagline (1 cümlə, Azərbaycan dilində), free_cancellation, rating 7.5-9.6 (10-luq miqyas), bəzilərinə deal_label ("Bu gecənin təklifi"), rooms_total elə seç ki, bəzilərində az otaq qalsın. Seed təkrar işləyəndə eyni nəticəni versin (idempotent).
8) Testlər: miqrasiya yuxarı/aşağı, reviewLabel hesablaması, roomsLeft (müxtəlif tarixlər, rezervasiya sonrası azalma), /cities, minStars, geriyə uyğunluq (köhnə sahələr yerindədir). Bütün testlər keçməlidir. docs/api-contract.md-i yenilə.

═══ B. SERVERƏ DEPLOY ═══
1) Backup-ı çək (yuxarıda), ölçüsünü və açıla bildiyini yoxla.
2) Yeni kodu /opt/staynow-a rsync ilə göndər (.env-ə toxunma, yalnız yeni dəyişən lazım olarsa əlavə et və mənə de).
3) `docker compose -p staynow -f docker-compose.prod.yml up -d --build api` (yalnız api servisi; db konteynerini restart etmə). Alembic miqrasiyasını tətbiq et, sonra seed skriptini işlət.
4) Yoxlama: `docker logs staynow-api --tail 100` (xəta yox), `curl <API_URL>/api/v1/health/ready`, `GET /hotels` yeni sahələri qaytarır (starRating, neighborhood, tagline, reviewLabel, roomsLeft, dealLabel), `GET /cities`, `GET /hotels/{id}`, test rezervasiya və ləğv axını hələ də işləyir (test datanı sonra staynow bazasından təmizlə).
5) Mövcud layihələrin sağlamlığı: deploy-dan əvvəl və sonra `docker ps` və `ss -tulpn` müqayisəsi, mənim staynow-api yenilənməsi istisna olmaqla heç nə dəyişməyib.
6) Problem olarsa: dərhal rollback (köhnə kod + `alembic downgrade` və ya backup-dan bərpa) və mənə bildir.

═══ HESABAT ═══
Nə dəyişdi (fayllar, miqrasiya adı), backup faylının yeri, yeni endpoint-lərin nümunə cavabları, mövcud layihələrə təsir olmadığının sübutu, rollback əmrləri.