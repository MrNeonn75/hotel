# StayNow v3.0.0 — Frontend

StayNow son dəqiqə otel rezervasiyası mobil tətbiqinin React Native / Expo əsaslı frontend layihəsidir. Figma dizayn sisteminə (Dark Theme) tam uyğun olaraq hazırlanmışdır.

---

## 🛠 Texnoloji Stack

- **Framework**: Expo (SDK 52+) + React Native + TypeScript (strict)
- **Naviqasiya**: `expo-router` (file-based routing, tabs + stack)
- **State Management**: Zustand (`persist` + AsyncStorage)
- **Server Data**: TanStack Query (React Query)
- **Xəritə**: `react-native-maps` (Google Maps Provider)
- **Animasiyalar**: `react-native-reanimated` & `react-native-gesture-handler`
- **İkonlar**: `lucide-react-native`
- **Şəkillər**: `expo-image`
- **Məkan**: `expo-location`

---

## 🗺️ Google Maps Quraşdırılması və API Açarının Əlavə Edilməsi

Layihədə xəritə funksionallığı (`react-native-maps`) **Google Maps** provayderi üzərində qurulub.

### 1. API Açarının Alınması (Google Cloud Console)
1. [Google Cloud Console](https://console.cloud.google.com/)-a daxil olun və ya yeni layihə yaradın.
2. **APIs & Services** > **Library** bölməsinə keçin.
3. Aşağıdakı iki API xidmətini axtarıb **Enable** (Aktivləşdir) edin:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
4. **APIs & Services** > **Credentials** bölməsinə keçin və **Create Credentials** > **API Key** seçin.
5. *(Tövsiyə olunur)* Təhlükəsizlik üçün API açarına məhdudiyyət (Key restrictions) qoyun:
   - **Android apps**: Paket adı `com.staynow.app` və SHA-1 barmaq iziniz.
   - **iOS apps**: Bundle identifier `com.staynow.app`.

### 2. Açarın Layihəyə Əlavə Edilməsi
Açar **YALNIZ** bir mərkəzi faylda saxlanılır:
👉 [`src/config/maps.ts`](file:///C:/staynow_v3/src/config/maps.ts)

Faylı açın və açarınızı daxil edin:
```typescript
export const GOOGLE_MAPS_API_KEY = "AIzaSyYourActualGoogleMapsApiKeyHere...";
```

> **Avtomatik Sinxronizasiya**: `app.config.ts` həmin açarı birbaşa `src/config/maps.ts` faylından oxuyaraq Android (`android.config.googleMaps.apiKey`) və iOS (`ios.config.googleMapsApiKey`) native konfiqurasiyasına avtomatik tətbiq edir. Əlavə konfiqurasiya tələb olunmur.

---

## ⚠️ Açar Olmadıqda Fallback Rejimi

Əgər API açarı daxil edilməyibsə və ya `BURAYA_API_ACARINI_YAZ` olaraq qalıbsa:
- Tətbiq qəzaya uğramır (crash olmur).
- Xəritə ekranında izahlı xəbərdarlıq bildirişi göstərilir:
  > *"Google Maps Açarı Əlavə Olunmayıb. Xəritənin tam işləməsi üçün Google Maps API açarınızı src/config/maps.ts faylındakı GOOGLE_MAPS_API_KEY sahəsinə yazın."*
- İstifadəçiyə iki rahat seçim verilir:
  1. **"Xəritəni Yenə də Göstər"**: Açar olmadan xəritə kətanını test etməyə imkan verir.
  2. **"Siyahı Görünüşünə Keç"**: Birbaşa filtr və axtarış nəticələri siyahısına yönləndirir.

---

## 📱 Expo Go və Development Build (expo-dev-client)

Google Maps (`react-native-maps`, `PROVIDER_GOOGLE`) yerli (native) C++ və Java/Obj-C kodları və Google Play Services tələb edir:
- **Expo Go**: Standart Expo Go tətbiqində Google Maps Android/iOS-da API açarını tam dəstəkləməyə və ya ağ xəritə kətanı göstərə bilər.
- **Development Build (Tövsiyə olunur)**: Ən yaxşı və stabil təcrübə üçün xüsusi development build yaradın:

### Lokal İcra (Local Prebuild / Run):
```bash
# Android üçün lokal build və emulyatorda/telefonda icra:
npx expo run:android

# iOS üçün (yalnız macOS):
npx expo run:ios
```

### EAS Build (Buludda):
```bash
# EAS CLI quraşdırın (əgər yoxdursa)
npm install -g eas-cli

# Development profile ilə Android APK/AAB build edin:
eas build --profile development --platform android
```

Build quraşdırıldıqdan sonra layihəni bu əmrlə işə salın:
```bash
npx expo start --dev-client
```

---

## 🚀 Layihəni İşə Salmaq

```bash
# Asılılıqları quraşdırın
npm install

# Metro serverini işə salın
npx expo start
```

---

## 🎨 Tətbiq Ekranları (v3.0.0 mərhələsi)

- **Xoş gəldin** (`/welcome`): Tam ekran Bakı hero şəkli, tünd scrim, axtarış kartı və keçid animasiyası.
- **Kəşf et** (`/(tabs)/index`): Brend başlıq, Bakı sürətli axtarış kartı, bu gecə təklifləri (HotelOfferCard) və kolleksiyalar.
- **Axtarış Nəticələri** (`/search/results`): Canlı nəticə sayı, çeşidləmə, filtr badge-i, sonsuz sürüşdürmə və xəritə qısayolu.
- **Filtrlər Modalı** (`/filters`): Qiymət aralığı slider-i, qonaq reytinqi chip-ləri, xidmət checkbox-ları, otel üslubu və canlı nəticə sayı.
- **Xəritə** (`/(tabs)/map`): Tünd Google Maps üslubu, 38px qiymət pinləri (seçiləndə brend rəngi və animasiya), "Bu ərazidə axtar", istifadəçi yeri ("Yerim" düyməsi) və seçilmiş otel alt kartı (98x102 şəkil, qiymət, `/hotel/[id]` keçidi).

