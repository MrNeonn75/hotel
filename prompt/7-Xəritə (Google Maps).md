1) Açarlar: layihənin kökündə .env faylı var, içində GOOGLE_MAPS_ANDROID_API_KEY və GOOGLE_MAPS_IOS_API_KEY dəyişənləri yazılıb. app.json-u app.config.ts-ə çevir və açarları process.env-dən oxuyub bu yerlərə yaz: ios.config.googleMapsApiKey və android.config.googleMaps.apiKey. Həmçinin expo-location plugin-i və iOS üçün NSLocationWhenInUseUsageDescription mətnini (Azərbaycan dilində) əlavə et. .env faylını .gitignore-a əlavə et. Expo Go-da Google Maps məhdud işlədiyi üçün development build (npx expo prebuild / eas build --profile development) üçün qısa addım-addım təlimat yaz.

2) Xəritə ekranı (app/(tabs)/map.tsx): PROVIDER_GOOGLE, tam ekran. Bütün otelləri xüsusi marker-lərlə göstər: qiymət yazılı pill (məs. "120 ₼", primary fon, ağ yazı, seçiləndə accent rəng və böyüyür). Xəritə ilk açılanda bütün otelləri əhatə edəcək şəkildə fitToCoordinates olsun.

3) Marker-ə basanda altdan kiçik otel kartı çıxsın (şəkil, ad, reytinq, qiymət), kartı yuxarı sürüşdürüb və ya basıb detala keçmək olsun, xəritəyə basanda kart bağlansın.

4) İstifadəçinin yeri: expo-location ilə icazə istə, verilərsə mavi nöqtə (showsUserLocation) göstər və sağ altda "Mənim yerim" düyməsi (xəritəni istifadəçiyə mərkəzləsin). İcazə verilməzsə xəritə otellərlə işləməyə davam etsin, kiçik bir banner ilə "Yeriniz üçün icazə verin" mesajı və "Ayarlar" düyməsi göstər.

5) Dark rejim üçün Google Maps customMapStyle əlavə et.

6) Otel detalındakı kiçik xəritəyə toxunanda bu ekrana keçid olsun və həmin otel seçilmiş vəziyyətdə fokuslansın (route param ilə).