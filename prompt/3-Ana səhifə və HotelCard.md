Ana səhifəni (app/(tabs)/index.tsx) yarat.

HEADER: solda "Salam 👋" kiçik mətn və altında "Bu gecə hara?" başlığı (800 çəkili). Altda yalnız görünüş üçün axtarış sətri (ikonlu, hələlik toxunuşda heç nə etməsin).

SİYAHI: FlatList ilə otellər, aralarında 16px boşluq, pull-to-refresh, getItemLayout/keyExtractor optimizasiyası.

HotelCard komponenti (components/hotel/HotelCard.tsx):
- Üstdə expo-image ilə şəkil (hündürlük 200, radius 20 yuxarı küncdə), şəklin sol üst küncündə accent rəngli "-35%" endirim badge-i, sağ üst küncündə yarı şəffaf dairəvi ürək düyməsi (favoritə əlavə/çıxar, bu düymə karta basmanı tetiklməsin).
- Şəklin sol alt küncündə yarı şəffaf pill: ulduz ikonu + reytinq.
- Altda: otel adı (700, 17px, 1 sətir), ünvan (ikon + textSecondary, 1 sətir).
- Xidmətlər: amenity ikon+qısa yazı çipləri üfüqi sırada, maksimum 4 ədəd, qalanı "+N" çipi.
- Ən altda qiymət: standart qiymət (üstündən xətt çəkilmiş, textSecondary), endirimli qiymət (800 çəkili, 20px, primary rəng) və "gecə" yazısı.
- Press zamanı scale 0.97 animasiyası (reanimated). Basanda /hotel/[id]-yə keçid.

VƏZİYYƏTLƏR: skeleton loading (3 ədəd shimmer kart), xəta vəziyyəti ("Yenidən cəhd et" düyməsi ilə), boş vəziyyət.
Light və dark rejimdə düzgün göründüyünü yoxla.