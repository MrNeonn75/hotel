app/hotel/[id].tsx səhifəsini HotelTonight üslubunda yarat. Stack screen (tab bar görünməsin), header tam şəffaf.

1) ImageCarousel (hündürlük 340, tam en): hər 1 saniyədə avtomatik növbəti şəkil (sonuncudan sonra birinciyə). İstifadəçi əl ilə sürüşdürəndə/toxunanda avto-keçid dayansın, 4 saniyə sonra davam etsin. Sağ altda "3/6" pill-i. Üstdə (safe-area-dan aşağı): sol dairəvi yarı şəffaf geri düyməsi, sağda paylaş düyməsi. Şəklə basdıqda ImageViewerModal: tam ekran qara fon, pinch-to-zoom, horizontal swipe, aşağı sürüşdürüb bağlama, bağla düyməsi, "2/6" sayğac.
2) Məzmun kartı şəklin altına 24px "üst-üstə" çıxsın (radius 24 yuxarı, background rəngi), içində:
   - Otel adı (display 28/800), altında ulduzlar + neighborhood.
   - Xal çipi + reviewLabel + rəy sayı.
   - dealLabel/urgency/freeCancellation pill-ləri (bir sətirdə, wrap).
   - "Niyə bu otel?" bölməsi: primaryTint fonlu kart içində tagline.
   - "Otel haqqında": description, uzundursa 4 sətirdən sonra "Daha çox" ilə açılan.
   - "Üstünlüklər və xidmətlər": amenity-lər 2 sütunlu grid-də ikonlu; üstünlüklər savings rəngli check ikonlu siyahı.
   - "Ünvan": yazılı ünvan + 160 hündürlüklü kiçik xəritə önizləməsi (react-native-maps, otelin marker-i, scroll söndürülmüş, radius 16); toxunanda Xəritə tabına otel fokuslanmış şəkildə keçid; "Yol tarifi" düyməsi (Linking ilə Google Maps).
   - "Bilməli olduğunuz qaydalar": giriş/çıxış saatları və qaydalar siyahısı. "Vacib məlumatlar" ayrıca xəbərdarlıq kartında (sol border star rəngi, surfaceAlt fon).
   - Altdan 120px boş yer.
3) STICKY ALT PANEL (BookingBar): background rəngi, üstdə border, safe-area padding. Solda: köhnə qiymət (xətt çəkilmiş) + yeni qiymət (title/800) + "gecə · vergilər daxil". Sağda: ürək düyməsi (52x52, radius 14, border; favoritdədirsə dolu primary ürək, spring animasiya + haptic + Toast "Favoritlərə əlavə olundu") və yanında flex-1 primary "Rezervasiya et" düyməsi. Düymə /booking/[id]-ə keçsin.