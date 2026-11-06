Expo (TypeScript, Expo Router) layihəsində otel rezervasiya tətbiqinin əsasını qur. Tətbiq adı müvəqqəti "StayNow". Dizayn dili HotelTonight tətbiqinin dizayn dilidir (təmiz ağ fon, iri şəkilli kartlar, bol boşluq, yumşaq kölgələr, yuvarlaq sheet-lər, qiymət və "bu gecə" təcililiyinin vurğulanması). HotelTonight-ın adı, loqosu, ikonları və şəkilləri istifadə OLUNMASIN, yalnız dizayn dili təkrarlanır. Login/qeydiyyat OLMASIN. Abunəlik/perks səhifəsi OLMASIN.

PAKETLƏR: zustand, @react-native-async-storage/async-storage, react-native-maps, expo-location, expo-image, react-hook-form, zod, @hookform/resolvers, @expo-google-fonts/plus-jakarta-sans, expo-font, react-native-reanimated, react-native-gesture-handler, react-native-safe-area-context, @gorhom/bottom-sheet, @expo/vector-icons, expo-haptics, expo-linear-gradient, i18next, react-i18next, expo-localization, @react-native-community/datetimepicker, react-native-calendars, expo-secure-store, expo-crypto, @tanstack/react-query.

QOVLUQ: app/, components/ (ui/, hotel/, booking/, common/), services/, store/, types/, constants/, data/, hooks/, i18n/, utils/.

DİZAYN TOKENLƏRİ (constants/theme.ts):
Light: primary #806AEC, primaryPressed #6A52D9, primaryTint #F1EEFD, background #FFFFFF, surfaceAlt #F6F6F9, text #17171F, textSecondary #6C6C7A, border #E8E8EF, savings #0E9F6E, urgency #E5484D, star #F5A623.
Dark: primary #9B88F2, primaryPressed #806AEC, primaryTint #241F3D, background #0F0E17, surfaceAlt #1A1926, text #F5F5FA, textSecondary #A3A3B5, border #2B2A3A, savings #34D399, urgency #FF6B70, star #FFC24D.
Radius: card 16, image 16, button 14, sheetTop 24, pill 999. Spacing: 4, 8, 12, 16, 20, 24, 32, 40.
Tipoqrafiya (Plus Jakarta Sans): display 28/800, title 22/700, heading 18/700, body 15/500, caption 13/500, micro 11/600.
Kölgə: çox yumşaq (opacity 0.06, radius 16, offsetY 4), əsas ayırıcı nazik border.
useTheme() hook-u: sistem rejiminə görə light/dark palitra qaytarsın. Şriftlər yüklənənə qədər splash qalsın.

ORTAQ UI KOMPONENTLƏRİ (components/ui/): Button (primary dolu, secondary outline, ghost; hündürlük 52, radius 14, loading vəziyyəti, press scale 0.98), IconButton (dairəvi, yarı şəffaf fonlu variant şəkil üzərində üçün), Chip (filter çipi: passiv border, aktiv primaryTint fon + primary border/mətn), Badge, Skeleton (shimmer), Toast, EmptyState, Divider, SectionHeader, Rating (xal çipi), PriceBlock (üstündən xətt çəkilmiş köhnə qiymət + yeni qiymət + "gecə").

NAVİQASİYA (app/(tabs)/): bu sıra ilə: index (etiket "Ana səhifə", ikon bed), map ("Xəritə", ikon map), favourites ("Favoritlər", ikon heart), history ("Tarixçə", ikon receipt/calendar), profile ("Profil", ikon person). Ionicons outline passiv, filled aktiv.
Tab bar: ağ (dark-da background) fon, üstdə 1px border, hündürlük 64 + safe area, etiket 11/600, aktiv rəng primary, passiv textSecondary. Aktiv tab-a keçəndə yüngül haptic.
Hər ekranda hələlik yalnız başlıq olsun. İşlədiyini yoxla (npx expo start).