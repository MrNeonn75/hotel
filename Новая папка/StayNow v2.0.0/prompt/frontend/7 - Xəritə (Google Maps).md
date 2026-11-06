Xəritə ilə bağlı funksionallıq və səhifə quruluşu əvvəlki kimi qalır, yalnız vizual stil HotelTonight dizayn sisteminə uyğunlaşdırılır.

1) app.json-u app.config.ts-ə çevir; açarları .env-dən (GOOGLE_MAPS_ANDROID_API_KEY, GOOGLE_MAPS_IOS_API_KEY) oxuyub ios.config.googleMapsApiKey və android.config.googleMaps.apiKey-ə yaz. expo-location plugin-i və iOS NSLocationWhenInUseUsageDescription (Azərbaycan dilində) əlavə et. .env .gitignore-da olsun. Expo Go-da Google Maps məhdud işlədiyi üçün development build təlimatı yaz.
2) Xəritə ekranı (app/(tabs)/map.tsx): PROVIDER_GOOGLE, tam ekran. Otellər xüsusi marker-lərlə: qiymət yazılı pill ("120 ₼", ağ fon, mətn qara, nazik kölgə; seçiləndə primary fon + ağ mətn və böyüyür). İlk açılışda bütün otelləri əhatə etsin (fitToCoordinates).
3) Marker-ə basanda altdan HotelTonight üslublu yığcam kart (şəkil, ad, ulduz, xal çipi, qiymət, ürək düyməsi) çıxsın; kartın üstünə basanda detala keçid; xəritəyə basanda kart bağlansın.
4) İstifadəçinin yeri: expo-location icazəsi, showsUserLocation, sağ altda dairəvi "Mənim yerim" düyməsi (primary ikon). İcazə verilməzsə xəritə otellərlə işləməyə davam etsin və yuxarıda yığcam banner "Yeriniz üçün icazə verin" + "Ayarlar".
5) Dark rejim üçün customMapStyle.
6) Detal səhifəsindəki kiçik xəritəyə basanda bu ekrana keçid və həmin otelin seçilmiş fokuslanması (route param).