Expo (SDK-nın ən son stabil versiyası), TypeScript və Expo Router ilə HotelTonight tərzində otel rezervasiya mobil tətbiqi qur. Tətbiqin adı müvəqqəti "StayNow".

QURULUM:
- Paketlər: zustand, @react-native-async-storage/async-storage, react-native-maps, expo-location, expo-image, react-hook-form, zod, @hookform/resolvers, @expo-google-fonts/plus-jakarta-sans, expo-font, react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, @expo/vector-icons, expo-haptics, i18next, react-i18next, expo-localization.
- Qovluq strukturu: app/, components/, services/, store/, types/, constants/, data/, hooks/, i18n/, utils/.
- Login və qeydiyyat OLMASIN.

DİZAYN SİSTEMİ (constants/theme.ts):
Light palitra: primary #4F46E5, primaryDark #3730A3, accent #FF6B57, background #F7F7FB, surface #FFFFFF, text #12122B, textSecondary #6B6F8D, border #E6E7F0, success #16A34A, warning #F59E0B.
Dark palitra: primary #818CF8, primaryDark #6366F1, accent #FF7F6E, background #0E0F1F, surface #181A33, text #F4F4FB, textSecondary #A0A4C4, border #2A2D4D, success #22C55E, warning #FBBF24.
Radius: card 20, button 14, pill 999. Spacing scale: 4, 8, 12, 16, 20, 24, 32.
Şrift: Plus Jakarta Sans (400, 500, 600, 700, 800). Şriftlər yüklənənə qədər splash screen qalsın.
Kölgə: yumşaq, geniş, opacity 0.08.
useTheme() hook-u yarat: sistem rejiminə görə light/dark palitranı qaytarsın.

NAVİQASİYA:
Bottom tab bar (app/(tabs)/): index (Ana səhifə), map (Xəritə), favourites (Favoritlər), history (Tarixçə), profile (Profil).
İkonlar Ionicons: home, map, heart, time, person (aktiv halda filled, passiv outline).
Tab bar: surface rəngi, üstdə nazik border, aktiv rəng primary, passiv textSecondary, aktiv tab-a keçəndə yüngül haptic feedback.
Hər ekranda hələlik yalnız başlıq yazılsın.

Nəticədə layihənin işlədiyini (npx expo start) və tab-lar arasında keçidin düzgün olduğunu yoxla.