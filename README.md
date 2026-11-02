# StayNow — HotelTonight Tərzində Mobil Otel Rezervasiya Tətbiqi

**StayNow** — son dəqiqə və bu gecə üçün eksklüziv endirimli otellər təklif edən, müasir, yüksək performanslı və zərif dizaynlı mobil otel rezervasiya tətbiqidir.

---

## 🚀 Texnoloji Stek

- **Freymvork:** [Expo SDK 57](https://expo.dev/) (React Native 0.86)
- **Naviqasiya:** [Expo Router](https://docs.expo.dev/router/introduction/) (Fayl əsaslı stack və bottom tab routing)
- **Tip Sistemi:** [TypeScript](https://www.typescriptlang.org/)
- **Vəziyyətin İdarəsi (State Management):** [Zustand](https://github.com/pmndrs/zustand) + `@react-native-async-storage/async-storage` (Persisted storage)
- **Xəritə:** [react-native-maps](https://github.com/react-native-maps/react-native-maps) (Google Maps SDK inteqrasiyası ilə)
- **Geolokasiya:** [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- **Animasiyalar:** [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) & [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- **Şəkillər:** [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) (Keşləmə, hamar keçid və optimizasiya)
- **Formlar və Validasiya:** [react-hook-form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Şriftlər:** Plus Jakarta Sans (`@expo-google-fonts/plus-jakarta-sans`)
- **İkonlar:** `@expo/vector-icons` (Ionicons)
- **Haptik Əks-əlaqə:** `expo-haptics`
- **Beynəlxalqlaşdırma (i18n):** `i18next`, `react-i18next` və `expo-localization` (AZ, EN, RU dəstəyi)

---

## 📂 Qovluq Strukturu

```text
├── app/                      # Expo Router səhifələri və marşrutlar
│   ├── (tabs)/               # Əsas tab naviqasiyası (Bottom Tabs)
│   │   ├── index.tsx         # Ana səhifə (Axtarış, filtr çipləri, otel kartları)
│   │   ├── map.tsx           # İnteraktiv Google Maps xəritə ekranı
│   │   ├── favourites.tsx    # Saxlanılan favorit otellər siyahısı
│   │   ├── history.tsx       # Rezervasiya tarixçəsi (aktiv və ləğv edilmiş)
│   │   └── profile.tsx       # Şəxsi profil, sənədlər, dil və tema ayarları
│   ├── hotel/
│   │   └── [id].tsx          # Otel detalları (Karusel, önizləmə xəritəsi, qaydalar, rezervasiya paneli)
│   ├── booking/
│   │   └── [id].tsx          # Rezervasiya formu (Tarix, qonaq sayı, Zod validasiyası, uğur ekranı)
│   ├── _layout.tsx           # Qlobal Root Layout (Şriftlər, tema provayderi, ErrorBoundary, OfflineBanner)
│   └── +not-found.tsx        # 404 ekranı
├── components/               # Təkrar istifadə olunan komponentlər
│   ├── common/               # Qlobal komponentlər (ErrorBoundary, OfflineBanner)
│   ├── hotel/                # Otel komponentləri (HotelCard, ImageCarousel, BookingBar, MiniMap və s.)
│   └── map/                  # Xəritə komponentləri (HotelMarker, SelectedHotelCard, FullMapView)
├── constants/                # Layihə sabiti və dizayn sistemi
│   ├── theme.ts              # Rəng palitraları (Light/Dark), radius, spacing, şriftlər və useTheme() hook-u
│   ├── amenities.ts          # Otel xidmətləri siyahısı və ikon təyinatları
│   └── mapStyle.ts           # Google Maps tünd rejim xəritə üslubu
├── data/
│   └── hotels.ts             # Bakı üzrə 10 real koordinatlı və zəngin məlumatlı mock otel bazası
├── hooks/                    # Xüsusi React hook-ları
├── i18n/                     # Çoxdilli tərcümə resursları (az.json, en.json, ru.json, index.ts)
├── services/
│   └── hotelService.ts       # Simulyasiyalı asinxron otel servis qatı (loading testi üçün)
├── store/                    # Zustand store-ları
│   ├── favoritesStore.ts     # Favoritlər store-u (persist)
│   ├── historyStore.ts       # Rezervasiya tarixçəsi store-u (persist)
│   ├── profileStore.ts       # İstifadəçi profili, dil və tema seçimi store-u (persist)
│   └── index.ts              # Store mərkəzi ixrac nöqtəsi
├── types/                    # TypeScript interfeysləri və tipləri
├── utils/
│   └── format.ts             # Qiymət, tarix və gecə sayı formatlaşdırma köməkçiləri
├── app.config.ts             # Dinamik Expo konfiqurasiyası (.env dəstəyi ilə)
└── .env                      # Məxfi açarlar (Google Maps API açarları)
```

---

## ⚙️ Quraşdırma və İşə Salma

### 1. Asılılıqların quraşdırılması
```bash
npm install
```

### 2. Ətraf mühit dəyişənləri (.env)
Layihənin kök qovluğunda `.env` faylı yaradın və ya mövcud fayla Google Maps API açarlarınızı qeyd edin:
```env
GOOGLE_MAPS_ANDROID_API_KEY=your_android_api_key_here
GOOGLE_MAPS_IOS_API_KEY=your_ios_api_key_here
```

### 3. Tətbiqi inkişaf rejimində başlatmaq
```bash
# Metro serverini işə sal
npx expo start

# Və ya birbaşa platformalar üzrə
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## 🗺️ Google Maps və Development Build Təlimatı

`react-native-maps` paketi Google Maps provayderi ilə yerli native SDK-lardan istifadə edir. Expo Go daxilində tam Google Maps xüsusiyyətlərini (xüsusi markerlər, stil və animasiyalar) test etmək üçün **Development Build** yaradılması tövsiyə olunur:

### Yerli Development Build (Prebuild):
```bash
# Yerli ios/ və android/ qovluqlarını generatsiya etmək üçün:
npx expo prebuild

# Android cihaz və ya emulyatorda işə salmaq:
npx expo run:android

# iOS cihaz və ya simulyatorda işə salmaq (macOS tələb olunur):
npx expo run:ios
```

### EAS Cloud vasitəsilə Build:
```bash
# EAS CLI quraşdırın (əgər yoxdursa):
npx eas-cli@latest login

# Development profil ilə buludda build edin:
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

---

## 🎨 Əsas Xüsusiyyətlər

1. **Ana Səhifə (Home):**
   - Interaktiv axtarış sətri (şəhər, otel və ərazi axtarışı)
   - Çip filtrləri: "Hamısı", "Ən ucuz", "Ən yüksək reytinq", "Endirimli", "Səhər yeməyi", "Hovuz"
   - Shimmer skelet yüklənməsi, pull-to-refresh və optimizasiya olunmuş `FlatList`
   - Reanimated ilə toxunma reaksiyası və bir toxunuşla favoritə əlavə etmə

2. **Otel Detalları:**
   - 300px avtomatik dövr edən şəkil karuseli (əl ilə toxunduqda pauza, 4 saniyədən sonra davam)
   - Tam ekran interaktiv şəkil baxıcısı (ImageViewerModal)
   - İnteraktiv kiçik xəritə önizləməsi və Google Maps ilə xarici naviqasiyaya keçid
   - 2 sütunlu xidmətlər şəbəkəsi, üstünlüklər, qaydalar və xəbərdarlıq kartı
   - Aşağıda yapışqan rezervasiya paneli və haptik favorit düyməsi

3. **Rezervasiya Ekranı (Bottom Sheet Modal):**
   - Giriş və çıxış tarixlərinin native seçimi (Giriş bu gün, çıxış minimum sabah)
   - Böyük və uşaq sayı üçün stepper düymələri
   - Zod və React Hook Form ilə Azərbaycan dilində xəta bildirişləri
   - Profil store-dan avtomatik doldurulma və təsdiqdən sonra avtomatik yaddaşa yazılma
   - Animasiyalı yaşıl təsdiq ekranı və unikal rezervasiya nömrəsi

4. **Xəritə (Google Maps):**
   - Bütün otellər üçün qiymət yazılmış interaktiv pill markerləri
   - Marker seçildikdə animasiyalı böyümə və altdan önizləmə kartının çıxması
   - İstifadəçi geolokasiyası ("Mənim yerim" düyməsi) və icazə rədd edildikdə yumşaq xəbərdarlıq banneri
   - Tünd rejim üçün xüsusi Google Maps JSON palitrası

5. **Profil və Ayarlar:**
   - Şəxsi məlumatlar, əlaqə və sənəd məlumatları (maskalanmış təhlükəsiz görünüşlə)
   - Tətbiq dili seçimi: **AZ** / **EN** / **RU**
   - Görünüş rejimi seçimi: **Sistem** / **Açıq** / **Tünd** (dərhal bütün tətbiqdə tətbiq olunur)
   - Məlumatların təhlükəsiz sıfırlanması dialoqu

6. **Keyfiyyət və Etibarlılıq:**
   - `ErrorBoundary` ilə gözlənilməz xətaların qarşısının alınması
   - `OfflineBanner` ilə internet bağlantısı kəsildikdə istifadəçiyə dərhal bildiriş
   - 100% təmiz TypeScript yoxlaması (`npx tsc --noEmit`)
   - 100% təmiz ESLint qaydaları (`npx expo lint`)

