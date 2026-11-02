app/booking/[id].tsx yarat (modal stil, aşağıdan açılsın). Standart rezervasiya forması:

BÖLMƏLƏR:
1) Otel xülasəsi: şəkil, ad, ünvan (kiçik kart).
2) Tarixlər: giriş və çıxış tarixi (native date picker, @react-native-community/datetimepicker). Giriş default bu gün, çıxış sabah. Çıxış girişdən əvvəl ola bilməz.
3) Qonaq sayı (böyük/uşaq) üçün +/- stepper-lər.
4) Şəxsi məlumatlar: ad, soyad, telefon (+994 formatı), email.
5) Xüsusi istəklər (çoxsətirli, ixtiyari).
6) Qiymət xülasəsi: gecə sayı × endirimli qiymət, endirim məbləği, xidmət haqqı (0), yekun məbləğ.
7) Sabit alt düymə: "Rezervasiyanı təsdiqlə".

VALİDASİYA: react-hook-form + zod, xətalar Azərbaycan dilində inputun altında göstərilsin, düzgün olmayan input qırmızı border alsın.

AVTOMATİK DOLDURMA: forma açılanda profile store-da ad, soyad, telefon, email varsa inputlar avtomatik dolsun.

TƏSDİQDƏN SONRA:
- Rezervasiyanı history store-una yaz (id, hotelId, hotel snapshot, tarixlər, qonaq sayı, yekun qiymət, status: 'confirmed', yaradılma tarixi).
- Ad, soyad, telefon, email-i profile store-una yaz.
- Uğur ekranı: animasiyalı yaşıl check, rezervasiya nömrəsi, xülasə, "Tarixçəyə bax" və "Ana səhifəyə qayıt" düymələri.