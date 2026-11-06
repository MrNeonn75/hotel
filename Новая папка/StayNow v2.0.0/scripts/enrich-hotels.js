const fs = require('fs');
const path = require('path');

const filePath = 'C:\\staynow_v2\\data\\hotels.ts';
let content = fs.readFileSync(filePath, 'utf8');

const hotelUpdates = {
  'hotel-1': {
    htCategory: 'LUXE',
    whyWeLikeIt: [
      '21-ci mərtəbədə yerləşən panoramik dəniz mənzərəli SPA mərkəzi',
      'Azadlıq meydanına və Dənizkənarı Bulvara birbaşa çıxış',
      'OroNero italyan restoranı və zərif kokteyl barı',
    ],
    theVibe: 'Şəhərin qəlbində dəniz mehli zərif lüks və beynəlxalq standartlar',
    roomOptions: [
      {
        id: 'r1-1',
        name: 'Deluxe King Room',
        bedType: '1 King yataq',
        capacity: 2,
        pricePerNight: 247,
        originalPrice: 380,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        amenities: ['WiFi', 'Dəniz mənzərəsi', 'Kondisioner', 'Mini-bar'],
        freeCancellation: true,
      },
      {
        id: 'r1-2',
        name: 'Executive Suite',
        bedType: '1 King yataq + qonaq otağı',
        capacity: 3,
        pricePerNight: 390,
        originalPrice: 560,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        amenities: ['Lounge girişi', 'Panoramik balkon', 'Jakuzi', 'Səhər yeməyi daxil'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-2': {
    htCategory: 'LUXE',
    whyWeLikeIt: [
      'İçərişəhərin Qoşa Qala qapıları ilə qonşu tarixi Beaux-Arts sarayı',
      'Klassik Roma sütunlu möhtəşəm qapalı hovuz və Jashan SPA',
      'Xəzər dənizinə açılan xüsusi eyvanlı otaqlar',
    ],
    theVibe: 'Kral saraylarını xatırladan mərmər zərifliyi və fərdi konsyerj diqqəti',
    roomOptions: [
      {
        id: 'r2-1',
        name: 'Deluxe City View Room',
        bedType: '1 King yataq',
        capacity: 2,
        pricePerNight: 337,
        originalPrice: 450,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        amenities: ['Mərmər vanna', 'Bulvar mənzərəsi', 'L’Occitane kosmetikası'],
        freeCancellation: true,
      },
      {
        id: 'r2-2',
        name: 'Four Seasons Caspian Suite',
        bedType: '1 King yataq + balkon',
        capacity: 3,
        pricePerNight: 520,
        originalPrice: 690,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        amenities: ['Dəniz panoraması', 'Xüsusi xidmət', 'Açıq eyvan'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-3': {
    htCategory: 'LUXE',
    whyWeLikeIt: [
      'Bakının simvolu olan Flame Towers qüllələrində ikonik qalma təcrübəsi',
      'Bütün Bakı buxtasını seyr edən ən yüksək panoramik mənzərə',
      'ESPA mərkəzində iki mərtəbəli saunalar və açıq terras hovuzu',
    ],
    theVibe: 'Futuristik memarlıq, göydələnlər yüksəkliyi və axşam alov şousu',
    roomOptions: [
      {
        id: 'r3-1',
        name: 'Fairmont Deluxe Room',
        bedType: '1 King yataq',
        capacity: 2,
        pricePerNight: 216,
        originalPrice: 320,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
        amenities: ['Panoramik pəncərələr', 'Ağıllı idarəetmə', 'Nespresso'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-4': {
    htCategory: 'HIP',
    whyWeLikeIt: [
      'Tarixi Xəzər Gəmiçilik binasının heyranedici butik restavrasiyası',
      'Mərmər döşəmələr, retro freskalar və dəbli daxili həyət restoranı',
      'Nizami (Tarqovı) küçəsinə və Fəvvarələr meydanına 2 addımlıq məsafə',
    ],
    theVibe: 'Müasir incəsənət həvəskarları və butik otel aşiqləri üçün unikal cazibə',
    roomOptions: [
      {
        id: 'r4-1',
        name: 'Merchant Heritage Room',
        bedType: '1 Queen yataq',
        capacity: 2,
        pricePerNight: 161,
        originalPrice: 230,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        amenities: ['Tarixi tavanlar', 'Yağış duşu', 'Organik çay dəsti'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-5': {
    htCategory: 'CHARMING',
    whyWeLikeIt: [
      'İçərişəhərin dar daş döşəməli küçələrində sakit və səmimi atmosfer',
      'Köhnə Bakı üslubunda taxta eyvanlar və yerli qonaqpərvərlik',
      'Ənənəvi təndir çörəyi və zəngin milli səhər yeməyi',
    ],
    theVibe: 'Tarixin qoynunda romantik və rahat nostalji',
    roomOptions: [
      {
        id: 'r5-1',
        name: 'Old City Classic Room',
        bedType: '1 Double yataq',
        capacity: 2,
        pricePerNight: 98,
        originalPrice: 140,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        amenities: ['Qala mənzərəsi', 'Milli çay dəstgahı', 'WiFi'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-6': {
    htCategory: 'SOLID',
    whyWeLikeIt: [
      'Qış Parkı və Füzuli meydanı yanında ultra-müasir rahatlıq',
      'Erqonomik iş zonası və səs izolyasiyalı geniş otaqlar',
      'Barmara restoranında təzə kofe və beynəlxalq mətbəx',
    ],
    theVibe: 'Dəqiq, funksional və iş adamları üçün ideal etibarlılıq',
    roomOptions: [
      {
        id: 'r6-1',
        name: 'Courtyard Standard King',
        bedType: '1 King yataq',
        capacity: 2,
        pricePerNight: 144,
        originalPrice: 180,
        image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
        amenities: ['İş masası', 'Sürətli WiFi', 'Smart TV'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-7': {
    htCategory: 'SOLID',
    whyWeLikeIt: [
      'Qış parkına açılan geniş pəncərələr və təmiz interyer',
      '15-ci mərtəbədə şəhər mənzərəli terras restoranı',
      'Bütün ictimai nəqliyyat qovşaqlarına çox yaxın mövqe',
    ],
    theVibe: 'Geniş park yaşıllığı və sakit şəhər ritmi',
    roomOptions: [
      {
        id: 'r7-1',
        name: 'Park View Superior Room',
        bedType: '1 King və ya 2 Twin yataq',
        capacity: 2,
        pricePerNight: 119,
        originalPrice: 170,
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
        amenities: ['Park mənzərəsi', 'Çay/kofe dəsti', 'Seyf'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-8': {
    htCategory: 'HIP',
    whyWeLikeIt: [
      'Ağ Şəhər və dəniz bulvarı boyunca uzanan müasir dizayn',
      'Black City Cafe və dəbli axşam tədbirləri',
      'Açıq hava velosiped zolaqlarına və parka birbaşa çıxış',
    ],
    theVibe: 'Gənclik enerjisi, dəniz kənarı gəzintilər və dinamik şəhər mühiti',
    roomOptions: [
      {
        id: 'r8-1',
        name: 'Boulevard Deluxe Sea View',
        bedType: '1 King yataq',
        capacity: 2,
        pricePerNight: 168,
        originalPrice: 240,
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        amenities: ['Balkon', 'Dəniz mənzərəsi', 'Fitness girişi'],
        freeCancellation: true,
      },
    ],
  },
  'hotel-9': {
    htCategory: 'BASIC',
    whyWeLikeIt: [
      'Qız Qalasına 100 metr məsafədə ən sərfəli gecələmə',
      'Təmiz otaqlar, sürətli Wi-Fi və 24 saat açıq resepsiyon',
      'Qədim qala divarları arasında yerləşən sərfəli qiymət',
    ],
    theVibe: 'Büdcəli səyahətçilər və şəhəri kəşf etmək istəyənlər üçün ideal baza',
    roomOptions: [
      {
        id: 'r9-1',
        name: 'Budget Double Room',
        bedType: '1 Double yataq',
        capacity: 2,
        pricePerNight: 68,
        originalPrice: 85,
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
        amenities: ['Fərdi duş', 'WiFi', 'Kondisioner'],
        freeCancellation: false,
      },
    ],
  },
  'hotel-10': {
    htCategory: 'SOLID',
    whyWeLikeIt: [
      'Tam təchiz olunmuş mətbəx zonası və geniş studiya otaqlar',
      '28 Mall ticarət mərkəzi və Dəmiryol Vağzalı ilə üzbəüz',
      'Gündəlik pulsuz qəlyanaltı və isti içki təklifləri',
    ],
    theVibe: 'Ev rahatlığında uzunmüddətli və ya ailəvi dincəlmə',
    roomOptions: [
      {
        id: 'r10-1',
        name: 'Studio Suite with Kitchen',
        bedType: '1 King yataq + mətbəx',
        capacity: 2,
        pricePerNight: 153,
        originalPrice: 220,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        amenities: ['Mətbəx ləvazimatları', 'Soyuducu', 'Paltaryuyan', 'Səhər yeməyi daxil'],
        freeCancellation: true,
      },
    ],
  },
};

for (const [id, data] of Object.entries(hotelUpdates)) {
  const pattern = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?dealLabel:\\s*(?:'[^']*'|null),)`);
  if (pattern.test(content)) {
    const replacement = `$1\n    htCategory: '${data.htCategory}',\n    whyWeLikeIt: ${JSON.stringify(data.whyWeLikeIt, null, 6)},\n    theVibe: ${JSON.stringify(data.theVibe)},\n    roomOptions: ${JSON.stringify(data.roomOptions, null, 6)},`;
    content = content.replace(pattern, replacement);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('HOTELS UPDATED SUCCESSFULLY!');

