# StayNow — HotelTonight Tərzində Mobil Otel Rezervasiya Tətbiqi

**StayNow** — son dəqiqə və bu gecə üçün eksklüziv endirimli otellər təklif edən, HotelTonight dizayn fəlsəfəsinə (təmiz ağ/tünd fon, iri şəkilli kartlar, bol boşluq, yumşaq kölgələr, yuvarlaq sheet-lər və təcili təklif vurğusu) əsaslanan müasir mobil otel rezervasiya tətbiqidir.

---

## 🚀 Texnoloji Stek

- **Freymvork:** [Expo SDK 58](https://expo.dev/) (React Native 0.88, React 19)
- **Naviqasiya:** [Expo Router](https://docs.expo.dev/router/introduction/) v58 (Fayl əsaslı stack və bottom tab routing)
- **Tip Sistemi:** [TypeScript 5+](https://www.typescriptlang.org/)
- **Vəziyyətin İdarəsi (State Management):** [Zustand](https://github.com/pmndrs/zustand) + `@react-native-async-storage/async-storage` (Persisted storage)
- **Server Sorğuları:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Xəritə:** [react-native-maps](https://github.com/react-native-maps/react-native-maps) (Google Maps SDK inteqrasiyası ilə)
- **Geolokasiya və Şəbəkə:** `expo-location`, `expo-network`
- **Animasiyalar:** `react-native-reanimated` & `react-native-gesture-handler`
- **Şəkillər:** `expo-image` (memory-disk keşləmə, hamar keçid və optimizasiya)
- **Formlar və Validasiya:** `react-hook-form` & `zod`
- **Şriftlər:** Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`)
- **İkonlar:** `@expo/vector-icons` (Ionicons)
- **Haptik Əks-əlaqə:** `expo-haptics`
- **Beynəlxalqlaşdırma (i18n):** `i18next`, `react-i18next` və `expo-localization` (Azərbaycan, İngilis və Rus dilləri)

---

## 📂 Qovluq Strukturu

```text
├── app/                      # Expo Router səhifələri və marşrutlar
│   ├── (tabs)/               # Əsas tab naviqasiyası (Bottom Tabs)
│   │   ├── index.tsx         # Ana səhifə (HotelTonight üslublu sticky header, filtr çipləri, otel kartları)
│   │   ├── map.tsx           # Google Maps tam ekran xəritə və interaktiv qiymət markerləri
│   │   ├── favourites.tsx    # Saxlanılan favorit otellər siyahısı
│   │   ├── history.tsx       # Bilet üslublu rezervasiya tarixçəsi (Gələcək, Keçmiş, Ləğv edilmiş)
│   │   ├── profile.tsx       # Şəxsi profil, sənədlər, dil və tema seçimi
│   │   └── _layout.tsx       # Tab bar tərtibatı və dinamik i18n etiketləri
│   ├── hotel/
│   │   └── [id].tsx          # Otel detalları (340px avto-karusel, tam ekran baxıcı, mini xəritə, sifariş paneli)
│   ├── booking/
│   │   └── [id].tsx          # Rezervasiya checkout səhifəsi, Zod validasiyası və animasiyalı uğur ekranı
│   └── _layout.tsx           # Qlobal Root Layout (Şriftlər, QueryClient, ErrorBoundary, OfflineBanner)
├── components/               # Təkrar istifadə olunan komponentlər
│   ├── common/               # ModalSheet, ErrorBoundary, OfflineBanner
│   ├── hotel/                # HotelCard, ImageCarousel, ImageViewerModal, HotelMiniMap, FilterModal, CitySelectModal
│   ├── map/                  # HotelPriceMarker, SelectedHotelCard
│   └── ui/                   # Button, Badge, Chip, FloatingInput, EmptyState, Skeleton, Rating, Divider
├── constants/                # Layihə sabiti və dizayn sistemi
│   ├── theme.ts              # Rəng palitraları (#806AEC primary), Radius, Spacing, Typography
│   ├── amenities.ts          # 10 əsas xidmət (WiFi, baseyn, səhər yeməyi...) və ikon təyinatları
│   └── mapStyle.ts           # Google Maps üçün xüsusi tünd və açıq rejim JSON xəritə üslubları
├── data/
│   └── hotels.ts             # Bakı üzrə 10 real koordinatlı zəngin mock otel məlumatı
├── hooks/                    # Xüsusi hook-lar (useTheme və s.)
├── i18n/                     # Çoxdilli tərcümə resursları (az.json, en.json, ru.json, index.ts)
├── services/                 # Servis qatı (hotelService.ts)
├── store/                    # Zustand store-ları
│   ├── favoritesStore.ts     # Favoritlər store-u (persist)
│   ├── historyStore.ts       # Rezervasiyalar və ləğvetmə store-u (persist)
│   ├── profileStore.ts       # Profil, dil (az/en/ru) və tema (sistem/açıq/tünd) store-u (persist)
│   └── searchStore.ts        # Şəhər, tarixlər, qonaq sayı və filtr parametrləri
├── types/                    # TypeScript interfeysləri (Hotel, AmenityKey və s.)
├── utils/
│   └── format.ts             # Qiymət (AZN), tarix və gecə sayı köməkçiləri
├── app.config.ts             # Dinamik Expo konfiqurasiyası (.env dəstəyi ilə)
└── .env                      # Məxfi mühit dəyişənləri
```

---

## ⚙️ Ətraf Mühit Dəyişənləri (.env)

Layihənin kök qovluğundakı `.env` faylında aşağıdakı dəyişənlər təyin olunur:

```env
EXPO_PUBLIC_API_URL=http://207.180.233.253:18000/api/v1
GOOGLE_MAPS_ANDROID_API_KEY=AIzaSy...
GOOGLE_MAPS_IOS_API_KEY=AIzaSy...
```

- `EXPO_PUBLIC_API_URL`: Backend API server ünvanı.
- `GOOGLE_MAPS_ANDROID_API_KEY`: Android Google Maps SDK açarı (`app.config.ts`-ə avtomatik ötürülür).
- `GOOGLE_MAPS_IOS_API_KEY`: iOS Google Maps SDK açarı.

---

## 🏃 İşə Salma və Kompilyasiya

### 1. Asılılıqları quraşdırın:
```bash
npm install
```

### 2. TypeScript statik yoxlanışı:
```bash
npx tsc --noEmit
```

### 3. Expo inkişaf serverini başladın:
```bash
# Metro serverini işə sal
npx expo start

# Və ya konkret platforma üçün
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## 🗺️ Google Maps və Android Build

`react-native-maps` paketi Google Maps üçün yerli native SDK-lardan istifadə edir. Expo Go daxilində xəritə məhdud funksionallıqla işləyə bildiyi üçün tam yerli təcrübə və APK istehsalı üçün Development Build və ya Release APK build istifadə olunur:

### Yerli Android Run:
```bash
npx expo run:android
```

### Release APK generasiyası:
```bash
cd android
./gradlew assembleRelease
```
Yaranmış APK faylı: `android/app/build/outputs/apk/release/app-release.apk`
