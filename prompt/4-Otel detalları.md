app/hotel/[id].tsx səhifəsini yarat. Tab bar bu səhifədə görünməsin (stack screen), header şəffaf olsun və üzərində geri düyməsi (dairəvi, yarı şəffaf) və paylaş ikonu olsun.

ScrollView-un məzmunu yuxarıdan aşağıya:
1) components/hotel/ImageCarousel.tsx: eni ekran qədər, hündürlük 300. Hər 1 saniyədə növbəti şəkilə avtomatik keçsin (sonuncudan sonra birinciyə). İstifadəçi əl ilə sürüşdürəndə və ya toxunanda avto-keçid dayansın, 4 saniyə sonra davam etsin. Altda nöqtəli indikator, sağ altda "3/5" sayğacı. Şəklə basdıqda ImageViewerModal açılsın: tam ekran qara fon, pinch-to-zoom, horizontal swipe, aşağı sürüşdürüb bağlama, bağla düyməsi.
2) Otel adı (800, 24px), yanında reytinq və rəy sayı.
3) Ünvan bölməsi: yazılı ünvan + ikon, altında 160 hündürlüklü kiçik xəritə önizləməsi (react-native-maps, otelin marker-i, scroll/zoom söndürülmüş), toxunanda Xəritə tabına otel fokuslanmış şəkildə keçid, "Yol tarifi" düyməsi (Linking ilə Google Maps-i açsın).
4) "Otel haqqında" bölməsi: təsvir, uzundursa "Daha çox" ilə açılan.
5) "Üstünlüklər və xidmətlər": amenity-lər 2 sütunlu grid-də ikon+ad ilə, üstünlüklər isə yaşıl check ikonlu siyahı ilə.
6) "Bilməli olduğunuz qaydalar": giriş/çıxış saatları və qaydalar siyahısı. "Vacib məlumatlar" ayrıca xəbərdarlıq kartında (warning rəngli sol border).
7) Aşağıdan 120px boş yer (sticky panelin altında qalmasın).

STICKY ALT PANEL (components/hotel/BookingBar.tsx): surface rəngi, üstdə border, safe-area padding. Solda qiymət (üstündən xətt çəkilmiş standart + endirimli, "gecə"), mərkəzdə-sağda geniş accent rəngli "Rezervasiya et" düyməsi (flex 1), yanında 52x52 kvadrat ürək düyməsi (favoritdədirsə dolu accent ürək, deyilsə outline). Ürəyə basanda spring animasiya + haptic + qısa toast ("Favoritlərə əlavə olundu").
"Rezervasiya et" düyməsi /booking/[id]-ə keçsin.