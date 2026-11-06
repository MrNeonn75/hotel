SƏN KİMSƏN: Təcrübəli DevOps + full-stack mühəndis. Tapşırıq 3 mərhələdən ibarətdir və ARDICIL icra olunmalıdır: (A) backend-i serverə deploy et, (B) frontend-i real API-yə inteqrasiya et, (C) Android APK build et. Hər mərhələnin sonunda yoxlama aparıb nəticəni mənə bildir, yoxlama keçməyibsə növbəti mərhələyə KEÇMƏ.

═══ GİRİŞ MƏLUMATLARI (mən dolduracağam) ═══
SERVER_IP: 207.180.233.253
SSH_USER: root
SSH_PASSWORD: AlohomoraServer2026ServerUYOL
SSH_PORT: 22
DOMAIN (API üçün subdomen, yoxdursa boş burax): ____________
BACKEND_PATH (lokal backend qovluğu): C:\Users\Elshan\Desktop\1gecə\hotel\backend
FRONTEND_PATH (lokal Expo layihəsi qovluğu): C:\Users\Elshan\Desktop\1gecə\hotel
GOOGLE_MAPS_ANDROID_API_KEY: AIzaSyDBeSjckG5kn5l2UcQ0h_4UrjjGbp7TrY0
EXPO_TOKEN (varsa): ____________

═══ ÜMUMİ QAYDALAR (pozulmaz) ═══
1. Giriş məlumatlarını (parol, token, açar) HEÇ VAXT fayla, git-ə, loqa, README-yə, docker image-ə və ya mənə göndərdiyin hesabata yazma. Yalnız mühit dəyişəni və ya sessiya daxilində istifadə et. SSH üçün parol lazımdırsa sshpass istifadə et, imkan olarsa ilk girişdə yalnız bu iş üçün SSH açarı yaradıb serverə əlavə et (mövcud authorized_keys-i silmə, yalnız əlavə et).
2. Serverdə AKTİV İŞLƏYƏN BAŞQA LAYİHƏLƏR VAR. Onlara heç bir zərər vurma. Qadağan olunanlar: mövcud konteynerləri/servisləri dayandırmaq, silmək və ya restart etmək; `docker system prune`, `docker volume prune`, `docker network prune`; Docker daemon-un və ya nginx/caddy servisinin RESTART edilməsi (yalnız konfiqurasiya testindən sonra RELOAD); mövcud nginx/caddy konfiqurasiya fayllarının redaktəsi; firewall-ı sıfırlamaq/dəyişmək (yalnız lazım olan tək yeni qayda əlavə oluna bilər); sistem paketlərinin (python, node, postgres, nginx və s.) qlobal versiyasını yeniləmək/silmək; başqa layihələrin qovluqlarına, .env fayllarına və verilənlər bazalarına toxunmaq; sudo apt upgrade/dist-upgrade.
3. Hər dəyişiklikdən əvvəl BACKUP: dəyişəcəyin hər mövcud sistem faylının surətini /root/backup-staynow-YYYYMMDD/ (və ya sudo icazəsi yoxdursa ~/backup-staynow-.../) qovluğuna al.
4. Bütün mənim yaratdığım resurslar "staynow" prefiksi ilə adlansın (konteyner, şəbəkə, volume, qovluq, systemd/compose layihə adı), ki, aid olduğu aydın görünsün və asan silinsin.
5. Şübhə yaranarsa (port toqquşması, naməlum konfiqurasiya, icazə problemi, mövcud servisə təsir riski) DAYAN və mənə sual ver. Təxmin edib davam etmə.
6. Hər mərhələdən sonra icra etdiyin əmrlərin xülasəsini və nəticəni yaz.

═══ MƏRHƏLƏ A: BACKEND DEPLOY ═══

A1. SERVERİN KƏŞFİ (yalnız OXUMA əmrləri, heç nəyi dəyişmə):
- OS/resurslar: `uname -a`, `cat /etc/os-release`, `df -h`, `free -h`, `nproc`.
- Aktiv portlar: `ss -tulpn` (sudo ilə), onların hansı proses/konteynerə aid olduğunu müəyyən et.
- Docker varsa: `docker ps -a`, `docker network ls`, `docker volume ls`, `docker compose ls`; hər layihənin hansı portları host-a açdığını yaz.
- Reverse proxy: nginx/caddy/traefik varsa necə qurulub (`nginx -T` və ya konfiqurasiya qovluğu, sites-enabled, conf.d), mövcud server_name-lər, 80/443 portunu kim dinləyir, SSL sertifikatları necə idarə olunur (certbot/caddy).
- Firewall statusu (ufw/iptables/cloud firewall): yalnız oxu.
- Docker, docker compose plugin, git, curl quraşdırılıbmı. Qurulmayıbsa və lazımdırsa dayan, mənə nə qurmaq istədiyini və mövcud layihələrə təsir riskini yaz, icazəmi gözlə.
Nəticədə mənə qısa XÜLASƏ ver: mövcud layihələr, məşğul portlar, proxy növü, mənim üçün təklif etdiyin plan.

A2. PORT STRATEGİYASI (mütləq belə):
- Backend və Postgres host-a PUBLİK port açmasın. Postgres heç bir host portu açmasın (yalnız staynow daxili docker şəbəkəsi). API konteyneri yalnız loopback-ə bind olunsun: `127.0.0.1:<PORT>:8000`.
- <PORT> üçün 18000-18999 aralığından, `ss -tulpn`-də və bütün docker layihələrinin port xəritəsində OLMAYAN birini seç, seçimi və niyə təhlükəsiz olduğunu mənə yaz. Port rezerv etməzdən əvvəl təkrar yoxla.
- Konteynerlər ayrıca docker şəbəkəsində olsun (`staynow_net`), mövcud şəbəkələrə qoşulma. Mövcud şəbəkələrin subnet-i ilə toqquşmasın (docker network inspect ilə yoxla).
- Compose layihə adı: `staynow`. Konteyner adları: staynow-api, staynow-db. Volume: staynow_pgdata. Heç bir adı mövcud olanla toqquşdurma.
- Resurs limitləri qoy (api: mem_limit 512m, db: 512m, cpus 0.5-1.0) ki, serverdəki digər layihələrin resursunu yeməsin. Restart policy: unless-stopped.

A3. KODUN SERVERƏ ÇATDIRILMASI:
- Qovluq: /opt/staynow (və ya mövcud konvensiya varsa ona uyğun, yoxlayıb mənə de). Kodu rsync/scp ilə göndər (.env, .git, __pycache__, node_modules, test bazaları kimi lazımsızları göndərmə).
- Serverdə /opt/staynow/.env yarat: güclü təsadüfi DB parolu, SECRET_KEY, ENCRYPTION_KEY (Fernet.generate_key()), ENV=production, CORS_ORIGINS. Fayl icazəsi chmod 600. Bu dəyərləri mənə də göstərmə, yalnız "yaradıldı" de.
- Production Dockerfile və docker-compose.prod.yml (artıq repoda varsa onlardan, yoxdursa yaz: multi-stage, non-root user, healthcheck).

A4. İŞƏ SALMA:
- `docker compose -p staynow -f docker-compose.prod.yml up -d --build`. Yalnız staynow servislərini idarə et.
- Alembic miqrasiyalarını tətbiq et, sonra `scripts/seed.py` ilə seed et (idempotent işləməlidir).
- Konteyner sağlamlığını yoxla: `docker ps`, `docker logs staynow-api --tail 50`, `curl http://127.0.0.1:<PORT>/api/v1/health/ready`.

A5. REVERSE PROXY VƏ HTTPS (mövcud proxy-ni pozmadan):
- Əgər nginx varsa: ayrıca YENİ fayl yarat (`/etc/nginx/sites-available/staynow-api` + symlink), mövcud fayllara toxunma. `server_name` DOMAIN olsun, `proxy_pass http://127.0.0.1:<PORT>`. Əvvəl `nginx -t`, uğurlu olarsa `systemctl reload nginx` (restart yox). Uğursuz olarsa dərhal öz faylını sil/deaktiv et və mənə bildir.
- Caddy/Traefik varsa: onların öz mexanizminə uyğun YENİ, izolə blok/label əlavə et, mövcud bloklara toxunma, reload (restart yox).
- Heç bir proxy yoxdursa: dayan və mənə variantları təklif et (caddy konteyneri ayrıca portlarda və s.), özbaşına 80/443-ü tutma.
- DOMAIN verilibsə: DNS A qeydinin serverin IP-sinə baxdığını yoxla (`dig +short`), certbot/caddy ilə Let's Encrypt sertifikatı al (mövcud sertifikatlara toxunma). Yoxlama: `curl -I https://DOMAIN/api/v1/health`.
- DOMAIN yoxdursa (müvəqqəti ehtiyat variant): API-ni `http://SERVER_IP:<PORT>` üzərindən elə açma ki, başqa layihələri pozsun. Variantı mənə izah et: ya nginx-də IP üzərindən ayrıca portda server bloku, ya da bu mərhələni dayandırıb mənə domen tələb et. Qərarı mənimlə razılaşdır. Qeyd: bu halda APK-da cleartext HTTP aktivləşdiriləcək və bu yalnız test üçündür.
- Firewall: lazım olan tək yeni port (yalnız proxy portu 80/443 artıq açıqdırsa heç nə əlavə etmə) üçün minimal qayda əlavə et. Digər qaydalara toxunma.

A6. MƏRHƏLƏNİN YOXLAMASI (hamısı keçməlidir):
- Mövcud layihələr sağlamdır: deploy-dan əvvəl və sonra `docker ps` və `ss -tulpn` müqayisə et, mənim əlavə etdiyim istisna olmaqla heç nə dəyişməyib. Cədvəllə göstər.
- GET /api/v1/hotels 10 otel qaytarır, /hotels/{id} işləyir.
- Xarici dünyadan (öz lokal maşınından) API URL-ə sorğu uğurludur.
- Test rezervasiya axını: yeni X-Device-Id ilə POST /bookings (Idempotency-Key ilə), GET /bookings, POST /bookings/{id}/cancel. Test məlumatlarını sonra təmizlə (yalnız staynow bazasında).
Nəticəni mənə bildir: API-nin final URL-i, istifadə olunan port, yaradılan fayllar/resurslar.

═══ MƏRHƏLƏ B: FRONTEND İNTEQRASİYASI ═══

B1. FRONTEND_PATH-də işlə. `.env`-ə (və `.env.example`-a) `EXPO_PUBLIC_API_URL=<A mərhələsindəki final URL>/api/v1` əlavə et. `.env` git-ə düşməsin.
B2. `services/api.ts` yarat: fetch əsaslı client; hər sorğuya `X-Device-Id` header-i (ilk açılışda expo-crypto ilə UUID yarat, expo-secure-store-da saxla); 15 san timeout; xəta formatını ({error:{code,message}}) oxuyub istifadəçiyə Azərbaycan dilində mesaj göstər; şəbəkə xətası üçün ayrıca mesaj.
B3. @tanstack/react-query quraşdır, QueryClientProvider əlavə et. services/hotelService.ts-dəki funksiyaları (getHotels, getHotelById, getHotelsByIds) imzaları DƏYİŞMƏDƏN real API çağırışları ilə əvəz et ki, ekranlar toxunulmasın. Ana səhifədə sonsuz scroll (page/pageSize) və filtr/sıralamanı serverə göndər.
B4. Favorites: ürək düyməsi optimistic update ilə PUT/DELETE /favorites/{hotelId} çağırsın. İlk açılışda lokal favoritləri POST /favorites/sync ilə serverə göndər, AsyncStorage yalnız offline cache olsun.
B5. Rezervasiya forması POST /bookings-ə qoşulsun: Idempotency-Key forma açılanda yaradılan UUID, təkrar cəhd eyni açarla. Yekun qiymət və rezervasiya nömrəsi serverin cavabından göstərilsin (client heç bir məbləğ göndərməsin). NO_AVAILABILITY və CANCELLATION_NOT_ALLOWED xətaları aydın Azərbaycan mesajları ilə göstərilsin.
B6. Tarixçə ekranı GET /bookings, ləğv POST /bookings/{id}/cancel. Profil ekranı GET/PUT/DELETE /profile; rezervasiya formasının avtomatik doldurulması profil API-dən gəlsin.
B7. Loading (skeleton), xəta (retry düyməsi), offline banner bütün ekranlarda işləsin. Mock data fayllarını yalnız test üçün saxla, istehsal kodunda istifadə olunmasın.
B8. YOXLAMA: `npx tsc --noEmit` və lint xətasız; tətbiqi işə sal (npx expo start) və real serverə qarşı əsas axını (siyahı → detal → favorit → rezervasiya → tarixçə → profil avtodoldurma) yoxla, nəticəni qısa yaz.

═══ MƏRHƏLƏ C: ANDROID APK BUILD ═══

C1. app.config.ts-də yoxla: android.package (məs. com.staynow.app, unikal), version/versionCode, ikon və splash, Google Maps açarı `process.env.GOOGLE_MAPS_ANDROID_API_KEY`-dən, expo-location icazələri. Əgər API http (cleartext) olacaqsa: yalnız bu halda expo-build-properties ilə `android.usesCleartextTraffic: true` əlavə et və bunu "müvəqqəti" kimi qeyd et. HTTPS varsa əlavə ETMƏ.
C2. EAS qurulumu: `eas-cli` quraşdır (lokal, qlobal sistem paketlərinə toxunma), `eas init`/`eas build:configure`. eas.json-da `preview` profili: `distribution: internal`, `android.buildType: "apk"`, env dəyişənləri (EXPO_PUBLIC_API_URL). Google Maps açarını EAS secret kimi əlavə et (`eas secret:create` / `eas env:create`), faylda açıq yazma. Expo girişi üçün EXPO_TOKEN istifadə et.
C3. Build: `eas build -p android --profile preview --non-interactive`. Build bitəndən sonra APK linkini və ya faylı götür. (Əgər EAS hesabı yoxdursa və ya limit bitibsə: ehtiyat yol `npx expo prebuild --platform android` + `cd android && ./gradlew assembleRelease`; bu halda Android SDK/JDK-nin lokal olduğunu yoxla, çatışmırsa mənə de.)
C4. İmza barmaq izi: `eas credentials` ilə build-in SHA-1 dəyərini çıxar və mənə ver. Mən bunu Google Cloud Console-da Android API açarının məhdudiyyətinə (package name + SHA-1) əlavə edəcəyəm. Bunu etməyincə xəritənin APK-da boş görünə biləcəyini mənə xatırlat.
C5. YOXLAMA: APK-nın yükləmə linkini (və ya yerli faylın yolunu) ver. APK real telefonda quraşdırılandan sonra yoxlanmalı əsas ssenarilər siyahısı hazırla (internet, siyahı, detal və karusel, favorit, rezervasiya, xəritə və istifadəçi mövqeyi, profil avtodoldurma).

═══ YEKUN HESABAT (məcburi) ═══
Sonda bir hesabat ver:
1. API URL, serverdə istifadə olunan port(lar), qovluqlar, konteyner/volume/şəbəkə adları, yaradılan nginx/caddy faylı.
2. Mövcud layihələrə toxunulmadığının sübutu (əvvəl/sonra müqayisəsi).
3. Backup faylları harada.
4. Geri qaytarma (rollback) əmrləri: staynow-u tam silmək üçün dəqiq əmrlər (yalnız staynow resurslarını silən), proxy faylını çıxarma.
5. APK linki, SHA-1, və mənim əl ilə etməli olduğum qalan işlər (Google Cloud açarı, domen/DNS, parolu dəyişmək və s.).
6. Gələcək yeniləmə üçün qısa deploy əmri (git pull / rsync + docker compose up -d --build).