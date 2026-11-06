PROFİL ekranı (store/profileStore.ts: Zustand + persist; sahələr firstName, lastName, phone, email, birthDate, nationality, documentNumber, city, address, preferredLanguage). HotelTonight "Hesab" üslubunda:
- Yuxarıda boyük başlıq "Profil"; altında dairəvi avatar (ad və soyadın baş hərfləri, primary fon), tam ad, email. Məlumat yoxdursa "Məlumatlarınızı əlavə edin" mesajı.
- Qruplaşdırılmış siyahı (ağ kartlar, sətir sağında chevron): "Şəxsi məlumatlar", "Əlaqə məlumatları", "Sənəd məlumatları" (sənəd nömrəsi maskalanmış), "Dil" (AZ/EN/RU), "Görünüş" (Sistem/Açıq/Tünd), "Məxfilik və şərtlər", "Haqqında" (versiya).
- Hər sətir bottom sheet və ya alt səhifədə redaktə formasını açır (zod validasiyası, "Yadda saxla"). Mesaj: "Bu məlumatlar növbəti rezervasiyalarda avtomatik doldurulacaq."
- Ən altda "Bütün məlumatlarımı sil" (urgency rəngində, təsdiq dialoqu ilə).

CİLALAMA:
1) i18n: bütün mətnləri az.json-a çıxar, en.json və ru.json tərcümələri əlavə et, dil dəyişdirmə işləsin.
2) Keçid animasiyaları, bütün düymələrdə haptic və press animasiyası.
3) Performans: FlatList optimizasiyası, expo-image cachePolicy="memory-disk", memo/useCallback.
4) Accessibility: accessibilityLabel-lər, 44x44 toxunma sahəsi, kontrast.
5) ErrorBoundary, şəbəkə yoxdursa banner.
6) İkon və splash: primary (#806AEC) fonlu sadə "S" monoqram (müvəqqəti), adaptive icon.
7) TypeScript və ESLint xətalarını təmizlə.
8) README.md: işə salma, .env izahı, struktur.