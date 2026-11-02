ROL: Sən senior DevOps və full-stack mühəndissən. Tapşırıq 3 mərhələdən ibarətdir və ardıcıl icra olunmalıdır:
  A) Backend-i (FastAPI + PostgreSQL) serverə deploy et.
  B) Frontend-i (Expo / React Native) deploy olunmuş backend-ə inteqrasiya et.
  C) Frontend-i buraxılışa hazırla (APK/AAB build + paylaşım).
Hər mərhələnin sonunda yoxlama apar və mənə qısa hesabat ver. Mən "təsdiq" yazmadan "GATE" qeyd olunan yerlərdən irəli keçmə.

═══════════════ MƏLUMATLAR (mən dolduracam) ═══════════════
SERVER_IP: ...
SSH_PORT: 22
SSH_USER: ...
SSH_PASSWORD: ...
BACKEND_DOMAIN: api.example.com   (DNS A qeydi SERVER_IP-yə yönəlib; yoxdursa "YOXDUR")
PROJECT_SLUG: staynow             (serverdə bütün qovluq, konteyner, şəbəkə adları üçün prefiks)
BACKEND_PATH: /lokal/yol/backend
FRONTEND_PATH: /lokal/yol/frontend
GIT_REPO_BACKEND: ...             (varsa; yoxdursa rsync ilə köçür)
ANDROID_BUILD: EAS                (EAS və ya LOCAL)
IOS_BUILD: YOX                    (Apple Developer hesabı verməsəm iOS-a toxunma)
═══════════════════════════════════════════════════════════

══════════ QIZIL QAYDALAR (serverdə başqa aktiv layihələr işləyir!) ══════════
1. Bu serverdə mənim başqa canlı layihələrim var. Onlara heç bir halda zərər verməməlisən. Şübhə varsa DAYAN və soruş.
2. Mərhələ A-nın ilk addımı yalnız OXUMAQDIR. Dəyişiklik etməzdən əvvəl serverin vəziyyətini öyrən və planı mənə təsdiq etdir.
3. QADAĞANDIR: 
   - `docker system prune`, `docker volume prune`, `docker image prune`, `docker network prune` və ya `-a`/`--volumes` bayraqları ilə hər hansı təmizləmə;
   - başqa layihəyə aid konteyneri, şəbəkəni, volume-u, image-i dayandırmaq/silmək/yenidən başlatmaq;
   - docker daemon-u, nginx/caddy/traefik/apache servisini RESTART etmək (yalnız `nginx -t` uğurlu olandan sonra `reload`);
   - mövcud nginx/caddy/apache konfiqurasiya fayllarını və ya server bloklarını redaktə etmək (yalnız YENİ ayrıca fayl əlavə et);
   - `apt upgrade`, `apt dist-upgrade`, `apt autoremove`, kernel/sistem paketlərini yeniləmək, reboot;
   - firewall (ufw/iptables) qaydalarını dəyişmək, sshd_config-ə toxunmaq;
   - 80, 443, 22, 3306, 5432, 6379, 8000, 8080, 3000 kimi məşğul ola biləcək portları host-da bind etmək;
   - başqa istifadəçilərin fayllarına, cron-larına, systemd servislərinə toxunmaq;
   - mənim SSH parolumu hər hansı fayla, scriptə, git-ə, log-a, shell history-yə yazmaq.
4. Hər "sudo" əmri yalnız bu layihənin qovluğu və YENİ nginx faylı ilə bağlı olmalıdır.

══════════ MƏRHƏLƏ A: BACKEND DEPLOY ══════════

A0. SSH girişi
- İlk bağlantıda parolla qoşul (parolu yalnız mühit dəyişəni kimi ötür, əmr sətrində göstərmə, heç yerdə saxlama).
- Bu layihə üçün ayrıca SSH açarı yarat (ed25519), ictimai açarı `ssh-copy-id` ilə serverə yüklə, bundan sonra yalnız açarla işlə. sshd_config-ə toxunma.

A1. Serverin ONLY-READ təhlili (heç nə dəyişmə)
Bu əmrlərin nəticəsini yığ və xülasə et:
- `whoami; id; uname -a; cat /etc/os-release; uptime; nproc; free -h; df -h`
- `ss -tulpn` (bütün dinləyən portlar, proses adları ilə)
- `docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'`, `docker network ls`, `docker volume ls`, `docker compose ls`
- `systemctl list-units --type=service --state=running`
- 80/443-ü hansı reverse proxy tutur (nginx / caddy / traefik / apache)? Konfiqurasiya qovluqlarının siyahısı (`ls /etc/nginx/sites-enabled /etc/nginx/conf.d` və ya Caddyfile/traefik konfiqurasiyası). `nginx -T` ilə mövcud server_name və proxy_pass hədəflərini oxu (yalnız oxu).
- Mövcud docker-compose fayllarında və proxy konfiqurasiyalarında istifadə olunan bütün portları grep ilə topla (`grep -rE "ports:|listen|proxy_pass" ...` /opt /srv /var/www /home altında).
- `crontab -l`, `ls /opt /srv /var/www`, `ufw status` (yalnız status).
- Docker və docker compose plugin quraşdırılıbmı? QURAŞDIRILMAYIBSA dayan və mənə soruş.
- Disk boş yeri (<5 GB), boş RAM (<1 GB) və ya yüksək load olarsa dayan və bildir.

A2. BASELINE snapshot (müqayisə üçün)
Digər layihələrin vəziyyətini yadda saxla: `docker ps` çıxışı, `ss -tulpn` çıxışı və mövcud domenlərin/portların HTTP status kodları (curl -s -o /dev/null -w "%{http_code}"). Bunu `/opt/PROJECT_SLUG/baseline/` altında mətn faylları kimi saxla (heç bir parol/secret daxil olmasın).

A3. PLAN və GATE
Mənə aşağıdakı planı göstər və "təsdiq" gözlə (heç bir dəyişiklik etmə):
- Seçilmiş host portu: 18000-18999 aralığında olan və A1-də tapılan HEÇ BİR portla, proses, docker publish və ya konfiqurasiya fayllarında istifadə olunan portla toqquşmayan ilk boş port (hər üç yerdə yoxla: ss, docker, konfiqurasiya). Yalnız `127.0.0.1:PORT` kimi bind olunacaq (xaricə açıq OLMAYACAQ).
- PostgreSQL üçün host portu AÇILMAYACAQ (yalnız layihənin daxili docker şəbəkəsində).
- Qovluq: `/opt/PROJECT_SLUG/`
- Docker compose proyekt adı: `PROJECT_SLUG`, ayrıca şəbəkə `PROJECT_SLUG_net`, konteyner adları `PROJECT_SLUG_api`, `PROJECT_SLUG_db`, volume adları `PROJECT_SLUG_pgdata`.
- Mövcud reverse proxy-yə əlavə olunacaq YENİ fayl adı və server_name.
- Hansı mövcud layihələrin olduğu və onlara toxunulmayacağı.

A4. Quraşdırma (təsdiqdən sonra)
- `/opt/PROJECT_SLUG/` yarat; backend kodunu köçür (git clone və ya rsync; `.env`, `.git`, `__pycache__`, `tests`, `.venv` xaric).
- Production Dockerfile (multi-stage, non-root user, healthcheck) və `docker-compose.prod.yml` yoxdursa yarat:
  - api və db üçün `restart: unless-stopped`, `mem_limit` (api 512m, db 512m) və `cpus` limiti, log rotation (`max-size: 10m`, `max-file: 3`),
  - api: `ports: ["127.0.0.1:SEÇİLMİŞ_PORT:8000"]`,
  - db: `postgres:16` (yeni, ayrıca konteyner; mövcud heç bir DB-dən istifadə etmə), healthcheck, `PROJECT_SLUG_pgdata` volume, host portu yox.
- `.env` faylını serverdə YARAT (chmod 600, mənə məxsus): DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY (Fernet), DB parolu — hamısını serverdə `openssl rand` və `python -c "from cryptography.fernet import Fernet..."` ilə yarat. Bu dəyərləri söhbətə, loga və git-ə YAZMA.
- Build: `docker compose -p PROJECT_SLUG -f docker-compose.prod.yml build` (yük çoxdursa BUILDKIT paralelliyi azalt, digər layihələri ləngitmə).
- Alembic miqrasiyası (`alembic upgrade head`) entrypoint və ya ayrıca əmrlə, sonra seed skripti bir dəfə (idempotent).
- Yoxla: `curl 127.0.0.1:PORT/api/v1/health/ready` → OK; `GET /api/v1/hotels` → 10 otel.

A5. Reverse proxy (YENİ fayl, mövcudlara toxunma)
- Əvvəlcə proxy konfiqurasiya qovluğunun timestamp-lı ehtiyat nüsxəsini `/opt/PROJECT_SLUG/backups/` altına çıxar.
- Yalnız YENİ fayl yarat (məs. `/etc/nginx/sites-available/PROJECT_SLUG.conf` + symlink, və ya `conf.d/PROJECT_SLUG.conf`): `server_name BACKEND_DOMAIN;` → `proxy_pass http://127.0.0.1:SEÇİLMİŞ_PORT;`, düzgün proxy header-ləri (Host, X-Forwarded-For, X-Forwarded-Proto), `client_max_body_size 5m`, gzip, `/downloads/` üçün statik location (`/opt/PROJECT_SLUG/downloads/`, autoindex off).
- Əgər mövcud proxy nginx deyilsə (caddy/traefik), onun öz mexanizminə uyğun YENİ blok əlavə et, mövcud bloklara toxunma.
- `nginx -t` uğursuz olarsa: öz faylını sil, reload ETMƏ, mənə xəta göstər.
- Uğurlu olarsa yalnız `systemctl reload nginx` (restart yox).
- HTTPS: BACKEND_DOMAIN varsa Let's Encrypt sertifikatı üçün `certbot certonly --webroot` istifadə et (mövcud server bloklarını avtomatik redaktə edən `--nginx` plaginindən istifadə ETMƏ); sertifikatı YENİ server blokuna özün bağla, 80 → 443 yönləndirməsi yalnız bu domen üçün. Avto-yenilənmənin işlədiyini yoxla (`certbot renew --dry-run`). BACKEND_DOMAIN "YOXDUR" olarsa DAYAN və soruş (mobil tətbiq üçün HTTP production-da qəbuledilməzdir).

A6. Yoxlama və digər layihələrin sağlamlığı
- `https://BACKEND_DOMAIN/api/v1/health/ready` və `/api/v1/hotels` HTTPS ilə işləyir.
- A2-dəki baseline ilə müqayisə et: `docker ps` və `ss -tulpn` fərqi YALNIZ bizim yeni konteynerlər və 127.0.0.1:PORT olmalıdır; digər layihələrin HTTP status kodları dəyişməməlidir. Hər hansı fərq varsa DƏRHAL dayan və mənə bildir.
- Yaz: `/opt/PROJECT_SLUG/PORTS.md` (istifadə etdiyimiz port, konteynerlər, nginx faylı, tarix), `/opt/PROJECT_SLUG/deploy.sh` (git pull/rsync → build → migrate → up -d → health yoxla), `/opt/PROJECT_SLUG/rollback.sh` (öz nginx faylını sil → `nginx -t` → reload → `docker compose -p PROJECT_SLUG down` — volume-u `-v` ilə SİLMƏ, yalnız mənim ayrıca təsdiqimlə).
- GATE: A mərhələsi hesabatını ver (port, qovluqlar, fayl adları, yoxlama nəticələri, baseline müqayisəsi) və B-yə keçmək üçün "təsdiq" gözlə.

══════════ MƏRHƏLƏ B: FRONTEND İNTEQRASİYASI ══════════
FRONTEND_PATH layihəsində mock data-dan real API-yə keç:
1. `.env`-ə `EXPO_PUBLIC_API_URL=https://BACKEND_DOMAIN/api/v1` əlavə et (Google Maps açarları üçün olan `.env` qaydalarına toxunma, .gitignore-da qaldığını yoxla).
2. `services/api.ts`: fetch əsaslı client; hər sorğuya `X-Device-Id` header-i (ilk açılışda expo-crypto ilə UUID v4 yarat, expo-secure-store-da saxla); timeout (15s); backend xəta formatını (`error.code`, `error.message`) oxu və Azərbaycan dilində göstər.
3. `@tanstack/react-query` quraşdır. `hotelService` funksiyalarını (getHotels, getHotelById, getHotelsByIds) real API çağırışları ilə əvəz et, funksiya imzalarını DƏYİŞMƏ ki, ekranlar toxunulmasın. Ana səhifədə sonsuz scroll (page/pageSize), filtr və sıralamanı serverə göndər. Backend camelCase qaytarır, əlavə mapping yazma.
4. Favorites: ürək düyməsi optimistic update ilə `PUT/DELETE /favorites/{hotelId}` çağırsın; ilk açılışda lokal favoritləri `POST /favorites/sync` ilə serverə göndər; AsyncStorage yalnız offline cache olsun.
5. Rezervasiya: formanı `POST /bookings`-ə bağla. `Idempotency-Key` = forma açılanda yaradılan UUID (səhv zamanı təkrar cəhd eyni açarla). Qiymət serverin cavabından göstərilsin (frontend heç vaxt məbləğ göndərməsin). `NO_AVAILABILITY` və `CANCELLATION_NOT_ALLOWED` xətaları aydın mesajla göstərilsin.
6. Tarixçə → `GET /bookings`, ləğv → `POST /bookings/{id}/cancel`. Profil → `GET/PUT /profile`; rezervasiya formasının avtomatik doldurulması profil API-sindən gəlsin. Sənəd nömrəsi API-dən maskalı gəlir, redaktədə yenidən daxil edilənə qədər dəyişdirmə.
7. Şəbəkə xətası, loading, retry və boş vəziyyətlər bütün ekranlarda işləsin; offline olduqda banner göstər.
8. Yoxla: `npx tsc --noEmit` və lint xətasız; tətbiqi canlı API ilə işə sal (`npx expo start`), bu ssenariləri yoxla: otel siyahısı, detal, favorit əlavə/sil, rezervasiya yarat, tarixçədə görünür, profil avtomatik doldurulur, ləğv. Mock data istifadəsini sil (yalnız test fayllarında qala bilər).
9. GATE: nəticəni göstər, C-yə keçmək üçün "təsdiq" gözlə.

══════════ MƏRHƏLƏ C: FRONTEND BUILD VƏ PAYLAŞIM ══════════
ÖNƏMLİ: Mobil tətbiqi istehsal serverində BUILD ETMƏ (CPU/RAM digər layihələrə təsir edər). Build EAS cloud-da və ya mənim lokal kompüterimdə olmalıdır.
1. `eas.json` profilləri: `preview` (Android APK, internal distribution), `production` (Android AAB). `app.config.ts`-də `android.package` və `ios.bundleIdentifier` unikal olsun (məs. com.mydomain.staynow), versiya və `versionCode` təyin et. Google Maps açarları EAS secrets vasitəsilə ötürülsün (`eas secret:create`), repoya yazılmasın.
2. ANDROID_BUILD=EAS: `eas login` lazım olarsa mənə bildir, sonra `eas build -p android --profile preview`. LOCAL: yalnız Android SDK/JDK quraşdırılıbsa `npx expo prebuild` + `./gradlew assembleRelease`.
3. APK hazır olanda onu serverə `/opt/PROJECT_SLUG/downloads/PROJECT_SLUG-vX.Y.Z.apk` olaraq köçür (yalnız bu qovluğa) və `https://BACKEND_DOMAIN/downloads/...` ilə yüklənə bildiyini yoxla. SHA-256 checksum faylını da əlavə et.
4. Production AAB-ni (Play Store üçün) build et və mənə təhvil ver; Google Play Console yükləməsini mən edəcəyəm.
5. IOS_BUILD=YOX isə iOS-a toxunma; yalnız `eas.json`-da iOS profilini hazır saxla və Apple Developer tələblərini qısa sadala.
6. İstəyə görə (mən desəm): `expo export -p web` yalnız demo üçün, nəzərə al ki, react-native-maps web-də işləmir.

══════════ YEKUN HESABAT ══════════
Sonda mənə bunları ver: (1) nə edildi; (2) serverdə istifadə olunan port, qovluqlar, konteyner və nginx fayl adları; (3) backend-i yeniləmək üçün əmr (`/opt/PROJECT_SLUG/deploy.sh`), logları baxmaq üçün əmr, geri qaytarmaq üçün əmr; (4) baseline müqayisəsinin yekun nəticəsi (digər layihələrə təsir olmadığının sübutu); (5) APK linki; (6) qalan işlər və risklər (backup planı, parolun dəyişdirilməsi, monitorinq).