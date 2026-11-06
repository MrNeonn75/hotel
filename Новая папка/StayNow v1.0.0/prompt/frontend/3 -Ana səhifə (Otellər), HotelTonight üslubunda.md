Ana səhifəni (app/(tabs)/index.tsx) HotelTonight üslubunda yarat.

ÜST HİSSƏ (sticky, scroll zamanı kölgə alır):
- Sol üst: kiçik caption "Hara gedirik?" altında şəhər seçimi "Bakı ▾" (basanda aşağıdan bottom sheet: şəhər siyahısı, hələlik Bakı + 3-4 digər şəhər mock).
- Altında bir sətirlik "axtarış xülasə pill-i" (radius 999, surfaceAlt fon, nazik border): sol ikon, "12-13 Okt · 1 gecə · 2 qonaq" mətni. Basanda bottom sheet açılsın: təqvim (react-native-calendars, aralıq seçimi, primary rəng), qonaq sayı stepper-ləri, "Axtar" düyməsi.
- Sürətli tarix çipləri: "Bu gecə", "Sabah", "Həftə sonu", "Tarix seç" (aktiv çip primaryTint).
- Filtr çipləri sırası (üfüqi scroll): "Sırala", "Qiymət", "Ulduz", "Xidmətlər", "Endirimli" (hər biri bottom sheet açır: sıralama seçimləri; qiymət slider; ulduz çoxlu seçim; xidmət çoxlu seçim; endirimli toggle). Aktiv filtrli çipdə sayğac.

SİYAHI (FlatList, pull-to-refresh, sonsuz scroll üçün hazırlıq):
Başlıq: "Bu gecə üçün ən yaxşı təkliflər" (title 22/700) və altında "{N} otel tapıldı".
HotelCard (components/hotel/HotelCard.tsx), tam en, kənarlarda 16 padding, aralarında 24 boşluq, kartın özü fonsuz/kölgəsiz (şəkil əsasdır):
 • Şəkil: nisbət 4:3, radius 16, expo-image, yuxarı sol: primary rəngli "Bu gecənin təklifi" pill-i (dealLabel varsa) və ya "-35%" badge; yuxarı sağ: dairəvi yarı şəffaf ürək düyməsi (favorit, spring animasiya + haptic, kartın press-ini tetiklməsin); şəklin altında kiçik dot indikator (şəkil sayı).
 • Şəklin altında iki sütun: SOL: otel adı (heading 18/700, 1 sətir), altında "★★★★ · {neighborhood}" (caption), altında xal çipi (primary fonlu kvadrat radius 6, ağ xal "8.7") + reviewLabel + "({reviewCount} rəy)". SAĞ (sağa düzlənmiş): köhnə qiymət (üstündən xətt, textSecondary), yeni qiymət (title 22/800), "gecə" caption, "vergilər daxil" micro, savings rəngində "-35%".
 • Altda: urgency sətri, roomsLeft varsa urgency rəngində "Yalnız {N} otaq qalıb" (ikonlu); freeCancellation varsa savings rəngində "Pulsuz ləğv".
 • Xidmət ikonları sırası: ilk 4 amenity ikon+qısa yazı (caption), qalanı "+N".
 • Press: scale 0.98, /hotel/[id] səhifəsinə keçid.
Skeleton loading (3 kart), xəta vəziyyəti (retry), boş vəziyyət (illustrasiya + "Filtrləri təmizlə").
Light və dark rejimdə yoxla.