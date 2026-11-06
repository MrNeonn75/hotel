# HotelTonight (StayNow v2.0.0) — Mobil Otel Rezervasiya Tətbiqi

**HotelTonight (StayNow v2.0.0)** — qlobal HotelTonight mobil tətbiqinin dizayn və istifadəçi təcrübəsinin (UI/UX) tam eynisini təqdim edən, son dəqiqə və bu gecə üçün eksklüziv butik otel rezervasiya platformasıdır.

---

## 🌟 HotelTonight v2.0.0 Yenilikləri və Əsas Xüsusiyyətləri

1. **Daily Drop (Günün Təklifi):**
   - Hər gün yalnız bir dəfə açılan eksklüziv -50%-ə qədər gizli lüks otel endirimi.
   - Kilidi açdıqda 15 dəqiqəlik canlı geri sayım taymeri (`14:59`...) işə düşür.
   - Taymer bitdikdə təklif qapanır və sabahkı Daily Drop gözlənilir.

2. **HotelTonight Kateqoriyaları (Tiers):**
   - Hər otel rəsmi HotelTonight kateqoriyasına malikdir:
     - 💎 **LUXE:** Yüksək dəbdəbə, 5 ulduzlu zəriflik və premium xidmətlər.
     - ✨ **HIP:** Zövqlü dizayn, müasir butik interyer və canlı ab-hava.
     - 🛡️ **SOLID:** Etibarlı komfort, yüksək keyfiyyət və əla dəyər.
     - 🌹 **CHARMING:** Tarixi və fərdi xarakterli romantik butik məkanlar.
     - 🛏️ **BASIC:** Sadə, təmiz və münasib büdcəli ən yaxşı seçim.
     - 🌙 **CRASHPAD:** Gecələmək üçün sərfəli və sürətli seçim.
     - 🏆 **HIGHROLLER:** VIP suitlər və premium təcrübə.
   - Ana səhifədə və Xəritədə kateqoriyalar üzrə sürətli süzgəc.

3. **"Why We Like It" & "The Vibe":**
   - Otel detallarında HotelTonight-ın məşhur 3 əsas seçim üstünlüyü (perks).
   - "The Vibe" — məkanın ab-havası, aurası və mühit təsviri.
   - Otaq növləri seçimi (Deluxe King, Executive Suite və s.).

4. **"Slide to Book" (Sürüşdürərək Rezervasiya):**
   - Checkout ekranında HotelTonight-ın imza jesti olan sürüşdürmə düyməsi.
   - Haptik əks-əlaqə və hamar animasiya ilə təsdiq.

5. **Boarding-Pass Bilet Kartları:**
   - Tarixçə və təsdiq ekranlarında bilet/minik kartı üslubu, kəsik künclər və `HT-XXXXXX` təsdiq kodları.

6. **HT Perks & VIP Səviyyə Klubu:**
   - Profil ekranında HotelTonight Perks kartı.
   - Qənaət sayğacı (`180 ₼ qənaət`) və növbəti səviyyəyə yüksəliş tərəqqi paneli.

7. **İnteraktiv Xəritə (Google Maps):**
   - Tünd və açıq rejim dəstəyi ilə interaktiv qiymət markerləri (`120 ₼`).
   - Yuxarıda üzən kateqoriya çipləri və altda yığcam önizləmə kartı.

8. **İkiqat Şəbəkə Qatı (Real Backend + Oflayn Ehtiyat):**
   - Real FastAPI backend: `http://207.180.233.253:18000/api/v1`
   - Oflayn və ya server əlçatmaz olduqda avtomatik zəngin yerli məlumat ehtiyatı.

---

## 🚀 Texnoloji Stek

- **Freymvork:** [Expo SDK 58](https://expo.dev/) (React Native 0.88, React 19)
- **Naviqasiya:** [Expo Router](https://docs.expo.dev/router/introduction/) v58
- **Tip Sistemi:** [TypeScript 5+](https://www.typescriptlang.org/)
- **Vəziyyətin İdarəsi:** [Zustand](https://github.com/pmndrs/zustand) + `@react-native-async-storage/async-storage`
- **Server Sorğuları:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Xəritə:** [react-native-maps](https://github.com/react-native-maps/react-native-maps) (Google Maps SDK)
- **Geolokasiya:** `expo-location`
- **Şəkillər:** `expo-image` (memory-disk keşləmə)
- **Form və Validasiya:** `react-hook-form` & `zod`
- **Şriftlər:** Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`)
- **İkonlar:** `@expo/vector-icons` (Ionicons)
- **Haptik:** `expo-haptics`
- **Beynəlxalqlaşdırma (i18n):** `i18next`, `react-i18next`, `expo-localization` (AZ, EN, RU)

---

## 📂 Qovluq Strukturu

```text
StayNow v2.0.0/
├── app/                      # Expo Router marşrutları
│   ├── (tabs)/               # Əsas tab naviqasiyası
│   │   ├── index.tsx         # Kəşf et (Daily Drop, HT kateqoriyalar, otellər)
│   │   ├── map.tsx           # Google Maps xəritə və interaktiv qiymət markerləri
│   │   ├── favourites.tsx    # Seçilmiş otellər
│   │   ├── history.tsx       # Bilet üslublu rezervasiyalar (HT-XXXXXX)
│   │   ├── profile.tsx       # HT Perks səviyyəsi, şəxsi məlumatlar, dil və tema
│   │   └── _layout.tsx       # Tab bar tərtibatı
│   ├── hotel/
│   │   └── [id].tsx          # Otel detalları (Why We Like It, The Vibe, Otaqlar, Mini-xəritə)
│   ├── booking/
│   │   └── [id].tsx          # Checkout, Slide to Book və təsdiq kartı
│   └── _layout.tsx           # Qlobal Root Layout
├── components/
│   ├── booking/              # SlideToBook slideri
│   ├── hotel/                # DailyDropBanner, HTCategoryFilter, HotelCard, ImageCarousel...
│   ├── map/                  # HotelPriceMarker, SelectedHotelCard
│   └── ui/                   # Button, Badge, Chip, FloatingInput, EmptyState, Skeleton...
├── constants/
│   ├── theme.ts              # HotelTonight rəngləri (#592391, #806AEC, #1B1924, #00C48C...)
│   └── mapStyle.ts           # Xüsusi xəritə üslubları
├── data/
│   └── hotels.ts             # 10 zəngin HotelTonight otel modeli
├── services/                 # api.ts, hotelService.ts, bookingService.ts...
├── store/                    # dailyDropStore, favoritesStore, historyStore, profileStore, searchStore
└── i18n/                     # az.json, en.json, ru.json
```

---

## ⚙️ İşə Salma

```bash
# Asılılıqları yoxlayın
npm install

# Metro inkişaf serverini işə salın
npx expo start

# Android cihazda və ya emulatorda işə salmaq
npx expo run:android
```
