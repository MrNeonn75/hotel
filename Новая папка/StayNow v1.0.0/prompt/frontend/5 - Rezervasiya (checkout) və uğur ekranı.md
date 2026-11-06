app/booking/[id].tsx yarat (HotelTonight checkout üslubu: bölmələr ayrıca ağ kartlar, surfaceAlt fon üzərində, yuxarıda böyük başlıq "Rezervasiyanı tamamla", bağla/geri düyməsi).

BÖLMƏLƏR:
1) Otel xülasəsi: şəkil (80x80, radius 12), ad, ünvan, ulduzlar.
2) "Qalma detalları": tarixlər (check-in/out qutuları yanaşı, basanda təqvim sheet-i), gecə sayı, qonaq sayı (stepper-lər); giriş/çıxış saatları.
3) "Qonaq məlumatları": ad, soyad, telefon (+994), email, xüsusi istəklər (ixtiyari). Floating label input-lar (focus-da primary border).
4) "Qiymət detalları": gecə sayı × endirimli qiymət, endirim məbləği (savings rəngində, mənfi), xidmət haqqı 0, "Yekun məbləğ" (qabarıq). Qeyd: "Ödəniş otelə çatanda edilir" (hələlik onlayn ödəniş yoxdur).
5) "Ləğv şərtləri": freeCancellation varsa yaşıl info kartı.
6) Sticky alt: sol yekun qiymət, sağ "Rezervasiyanı təsdiqlə" düyməsi.
VALİDASİYA: react-hook-form + zod, Azərbaycan dilində xətalar. Forma açılanda profil store-da məlumat varsa avtomatik dolsun.
TƏSDİQDƏN SONRA: rezervasiyanı history store-una, ad/soyad/telefon/email-i profile store-una yaz. Uğur ekranı: primary fonlu tam ekran, animasiyalı ağ check, "Rezervasiya təsdiqləndi!" başlığı, rezervasiya nömrəsi, xülasə kartı, "Tarixçəyə bax" və "Ana səhifəyə qayıt" düymələri.
Rezervasiya forması mock rejimdə işləsin (məbləğləri client hesablasın, inteqrasiya mərhələsində serverin cavabı ilə əvəz olunacaq).