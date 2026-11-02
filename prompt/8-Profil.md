store/profileStore.ts: Zustand + persist. Sahələr: firstName, lastName, phone, email, birthDate, nationality, documentNumber, city, address, preferredLanguage.

Profil ekranı: yuxarıda dairəvi avatar (ad və soyadın baş hərfləri, primary fon), altında tam ad və email. Aşağıda bölmələr:
- "Şəxsi məlumatlar": ad, soyad, doğum tarixi, vətəndaşlıq.
- "Əlaqə məlumatları": telefon, email, şəhər, ünvan.
- "Sənəd məlumatları": sənəd nömrəsi (ixtiyari, maskalanmış göstərilsin).
- "Tətbiq ayarları": dil (AZ/EN/RU), tema (Sistem/Açıq/Tünd).
- Info mətni: "Bu məlumatlar növbəti rezervasiyalarda avtomatik doldurulacaq."
"Redaktə et" düyməsi ilə inputlar aktivləşsin, "Yadda saxla" düyməsi, zod validasiyası. Rezervasiya zamanı toplanan məlumatlar burada görünsün. Ən altda "Bütün məlumatlarımı sil" (qırmızı, təsdiq dialoqu ilə).