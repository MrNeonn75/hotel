Bu qovluqdakı mövcud Expo (React Native) frontend layihəsini TƏMİZLƏYİB sıfırdan yenidən qurmaq istəyirəm.

ADDIMLAR:
1) Əvvəl backup: bütün layihəni qovluqdan kənara, yanındakı "staynow-frontend-old-backup" qovluğuna kopyala (node_modules və .expo xaric). Git varsa, əlavə olaraq "backup-before-redesign" adlı tag/branch yarat.
2) Aşağıdakıları SAXLA: .git qovluğu, .env və .env.* faylları (içində Google Maps açarları və EXPO_PUBLIC_API_URL var), .gitignore, və ya eas.json (varsa).
3) Qalan hər şeyi sil: app/, components/, services/, store/, types/, constants/, data/, hooks/, i18n/, utils/, assets/ (yeni ikon və splash-ı sonra əlavə edəcəyik), package.json-dakı köhnə asılılıqlar daxil olmaqla köhnə konfiqurasiyanı.
4) Eyni qovluqda təzə Expo layihəsi (ən son stabil SDK, TypeScript, Expo Router) yarat. Saxladığın .env fayllarını yerində qoy.
5) Nəticədə mənə de: nəyi sildin, nəyi saxladın, backup harada. Növbəti addıma özbaşına keçmə.