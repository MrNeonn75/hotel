Login olmadığı üçün istifadəçini X-Device-Id header-i ilə tanı.

deps.py-də get_current_guest dependency-si yaz:
- Header məcburidir, UUID v4 formatında olmalıdır, yoxsa 400 qaytarsın.
- Guest cədvəlində yoxdursa avtomatik yaradılsın (get_or_create, race condition-a davamlı, unique constraint + ON CONFLICT), last_seen_at yenilənsin.
- Hotels endpoint-ləri bu header olmadan da işləsin (public), favorites/bookings/profile isə məcburi tələb etsin.
- Bir guest-in məlumatı başqa guest-ə heç vaxt görünməsin (bütün sorğular guest_id ilə filtrlənsin, başqasının resursuna 404 qaytarılsın).
- Kod elə yazılsın ki, sonradan JWT auth əlavə ediləndə yalnız bu dependency dəyişsin və Guest qeydi User ilə birləşdirilə bilsin (guest_id -> user_id keçid üçün yer saxla, README-də qeyd et).
Testlər: header yoxdur, səhv format, yeni guest yaranması, eyni guest təkrar sorğusu.