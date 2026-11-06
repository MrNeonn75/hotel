import { Hotel } from '@/types/hotel';

export const HOTELS: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'JW Marriott Absheron Baku',
    city: 'Bakı',
    neighborhood: 'Sahil',
    address: '674 Azadlıq meydanı, Nəsimi r-nu',
    latitude: 40.3725,
    longitude: 49.8532,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 5,
    rating: 9.5,
    reviewLabel: 'Müstəsna',
    reviewCount: 1420,
    tagline: 'Xəzər dənizinə açılan panoramik mənzərə və 21-ci mərtəbədə yerləşən lüks SPA mərkəzi.',
    description:
      'JW Marriott Absheron Baku şəhərin tam mərkəzində, Azadlıq meydanında və Xəzər dənizinin sahilində yerləşir. Müasir dizaynlı geniş otaqlar, zərif interyer və dünya səviyyəli qonaqpərvərlik sizə unudulmaz gecə vəd edir. Oteldə 4 fərqli restoran, qapalı panoramik hovuz və 24 saat fəaliyyət göstərən fitnes mərkəzi mövcuddur.',
    standardPrice: 380,
    discountedPrice: 247,
    discountPercent: 35,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'parking', 'gym', 'pool', 'spa', 'ac', 'restaurant'],
    advantages: [
      'Xəzər dənizinə və Bulvara birbaşa baxan panoramik pəncərələr',
      'Absheron Spa & Wellness — ən son texnologiyalı istirahət zonası',
      'Şəhərin əsas ticarət və iş mərkəzlərinə bir neçə dəqiqəlik piyada məsafə',
      'İtalyan və yerli ləzzətləri birləşdirən "OroNero Bar & Ristorante"',
    ],
    rules: [
      'Otaqlarda siqaret çəkmək qəti qadağandır.',
      'Sakitlik saatları: 23:00 - 08:00.',
      'Hovuza yalnız çimərlik geyimində girişə icazə verilir.',
    ],
    importantInfo: [
      'Giriş üçün şəxsiyyət vəsiqəsi və ya xarici pasport tələb olunur.',
      'Depozit ödənişi qeydiyyat zamanı bloklana bilər.',
    ],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 2,
    dealLabel: 'Bu gecənin təklifi',
    htCategory: 'LUXE',
    whyWeLikeIt: [
      "21-ci mərtəbədə yerləşən panoramik dəniz mənzərəli SPA mərkəzi",
      "Azadlıq meydanına və Dənizkənarı Bulvara birbaşa çıxış",
      "OroNero italyan restoranı və zərif kokteyl barı"
],
    theVibe: "Şəhərin qəlbində dəniz mehli zərif lüks və beynəlxalq standartlar",
    roomOptions: [
      {
            "id": "r1-1",
            "name": "Deluxe King Room",
            "bedType": "1 King yataq",
            "capacity": 2,
            "pricePerNight": 247,
            "originalPrice": 380,
            "image": "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "WiFi",
                  "Dəniz mənzərəsi",
                  "Kondisioner",
                  "Mini-bar"
            ],
            "freeCancellation": true
      },
      {
            "id": "r1-2",
            "name": "Executive Suite",
            "bedType": "1 King yataq + qonaq otağı",
            "capacity": 3,
            "pricePerNight": 390,
            "originalPrice": 560,
            "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Lounge girişi",
                  "Panoramik balkon",
                  "Jakuzi",
                  "Səhər yeməyi daxil"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-2',
    name: 'Four Seasons Hotel Baku',
    city: 'Bakı',
    neighborhood: 'İçərişəhər',
    address: '1 Neftçilər prospekti, Səbail r-nu',
    latitude: 40.3644,
    longitude: 49.8347,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 5,
    rating: 9.6,
    reviewLabel: 'Müstəsna',
    reviewCount: 980,
    tagline: 'Klassik fransız memarlığı, İçərişəhərin qədim qala divarları ilə həmsərhəd krallıq komfortu.',
    description:
      'Four Seasons Hotel Baku, Xəzər dənizinin və qədim İçərişəhərin kəsişməsində, zərif Beaux-Arts üslubunda inşa olunmuş premium oteldir. Mərmər hamamlar, incə toxunmuş ipək xalçalar və hər bir qonağa fərdi xidmət yanaşması ilə Bakının ən prestijli ünvanıdır.',
    standardPrice: 450,
    discountedPrice: 337,
    discountPercent: 25,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'parking', 'gym', 'pool', 'spa', 'ac', 'restaurant', 'airportShuttle'],
    advantages: [
      'İçərişəhərin tarixi Qoşa Qala qapılarına və Dənizkənarı parka 1 dəqiqəlik məsafə',
      'Klassik Roma üslubunda işıqlı qapalı üzgüçülük hovuzu',
      'Xüsusi fərdi konsyerj və 24 saatlıq otaq servisi',
      'Zafferano restoranında zərif italyan şam yeməyi',
    ],
    rules: [
      'Oteldə sakitlik rejimi 22:30-dan sonra qüvvədədir.',
      'Ev heyvanları üçün əvvəlcədən xüsusi razılıq tələb olunur.',
    ],
    importantInfo: [
      'Hava limanından premium avtomobillə qarşılama xidməti mövcuddur.',
      'Erkən giriş mövcud otaq sayından asılıdır.',
    ],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: null,
    dealLabel: 'Lüks seçim',
    htCategory: 'LUXE',
    whyWeLikeIt: [
      "İçərişəhərin Qoşa Qala qapıları ilə qonşu tarixi Beaux-Arts sarayı",
      "Klassik Roma sütunlu möhtəşəm qapalı hovuz və Jashan SPA",
      "Xəzər dənizinə açılan xüsusi eyvanlı otaqlar"
],
    theVibe: "Kral saraylarını xatırladan mərmər zərifliyi və fərdi konsyerj diqqəti",
    roomOptions: [
      {
            "id": "r2-1",
            "name": "Deluxe City View Room",
            "bedType": "1 King yataq",
            "capacity": 2,
            "pricePerNight": 337,
            "originalPrice": 450,
            "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Mərmər vanna",
                  "Bulvar mənzərəsi",
                  "L’Occitane kosmetikası"
            ],
            "freeCancellation": true
      },
      {
            "id": "r2-2",
            "name": "Four Seasons Caspian Suite",
            "bedType": "1 King yataq + balkon",
            "capacity": 3,
            "pricePerNight": 520,
            "originalPrice": 690,
            "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Dəniz panoraması",
                  "Xüsusi xidmət",
                  "Açıq eyvan"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-3',
    name: 'Fairmont Baku Flame Towers',
    city: 'Bakı',
    neighborhood: 'Flame Towers ətrafı',
    address: '1A Mehdi Hüseyn küçəsi, Səbail r-nu',
    latitude: 40.3596,
    longitude: 49.8273,
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 5,
    rating: 9.3,
    reviewLabel: 'Mükəmməl',
    reviewCount: 1840,
    tagline: 'Bakının simvolu olan Alov Qüllələrində əvəzolunmaz şəhər və buxta mənzərəsi.',
    description:
      'Məşhur Alov Qüllələri (Flame Towers) kompleksində yerləşən Fairmont Baku, şəhərə quşbaxışı mənzərəsi ilə fərqlənir. Otaqlar ultra-müasir texnologiyalar və rahatlıqla təchiz olunub. Oteldə ESPA tərəfindən idarə olunan 2 mərtəbəli geniş spa kompleksi fəaliyyət göstərir.',
    standardPrice: 340,
    discountedPrice: 238,
    discountPercent: 30,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'parking', 'gym', 'pool', 'spa', 'ac', 'restaurant'],
    advantages: [
      'Bakı buxtasının və gecə şəhər işıqlarının ən möhtəşəm quşbaxışı mənzərəsi',
      'Açıq terrasda yay hovuzu və elit kokteyl barı',
      'Dağüstü park və Şəhidlər Xiyabanına birbaşa çıxış',
    ],
    rules: [
      'Bütün otaqlar qeyri-siqaret zonasındadır.',
      'Otağa kənar qonaqların dəvət edilməsi saat 23:00-dək mümkündür.',
    ],
    importantInfo: [
      'SPA xidmətləri üçün qabaqcadan rezervasiya tövsiyə olunur.',
      'Təmiz dağ havası və füsunkar günəş batımı mənzərəsi.',
    ],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 4,
    dealLabel: 'Populyar seçim',
    htCategory: 'LUXE',
    whyWeLikeIt: [
      "Bakının simvolu olan Flame Towers qüllələrində ikonik qalma təcrübəsi",
      "Bütün Bakı buxtasını seyr edən ən yüksək panoramik mənzərə",
      "ESPA mərkəzində iki mərtəbəli saunalar və açıq terras hovuzu"
],
    theVibe: "Futuristik memarlıq, göydələnlər yüksəkliyi və axşam alov şousu",
    roomOptions: [
      {
            "id": "r3-1",
            "name": "Fairmont Deluxe Room",
            "bedType": "1 King yataq",
            "capacity": 2,
            "pricePerNight": 216,
            "originalPrice": 320,
            "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Panoramik pəncərələr",
                  "Ağıllı idarəetmə",
                  "Nespresso"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-4',
    name: 'Hilton Baku',
    city: 'Bakı',
    neighborhood: 'Bulvar',
    address: '1B Azadlıq prospekti, Səbail r-nu',
    latitude: 40.3708,
    longitude: 49.8499,
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 5,
    rating: 9.1,
    reviewLabel: 'Mükəmməl',
    reviewCount: 1560,
    tagline: '360 dərəcə fırlanan "360 Bar" və Dənizkənarı Milli Parkın bir addımlığı.',
    description:
      'Hilton Baku Bakının tam işgüzar və istirahət mərkəzində, Park Bulvar AVM ilə üzbəüz yerləşir. Otelin 25-ci mərtəbəsindəki 360 dərəcə fırlanan barından bütün Bakını seyr etmək mümkündür. Eforea Spa, geniş idman zalı və zərif interyer qonaqların xidmətindədir.',
    standardPrice: 290,
    discountedPrice: 188,
    discountPercent: 35,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'parking', 'gym', 'pool', 'spa', 'ac', 'restaurant'],
    advantages: [
      '25-ci mərtəbədə unikal fırlanan panoramik "360 Bar"',
      'Park Bulvar ticarət mərkəzi ilə üzbəüz əlverişli yerləşmə',
      'Böyük qapalı hovuz və eforea: spa mərkəzi',
    ],
    rules: [
      'Heyvanlar qəbul edilmir (bələdçi itlər istisna olmaqla).',
      'Otaqlarda siqaret çəkilməsinə icazə verilmir.',
    ],
    importantInfo: [
      'Uşaqlar üçün beşik sorğu əsasında pulsuz təqdim olunur.',
      'Sürətli check-in və check-out xidməti mövcuddur.',
    ],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 3,
    dealLabel: 'Bu gecənin təklifi',
    htCategory: 'HIP',
    whyWeLikeIt: [
      "Tarixi Xəzər Gəmiçilik binasının heyranedici butik restavrasiyası",
      "Mərmər döşəmələr, retro freskalar və dəbli daxili həyət restoranı",
      "Nizami (Tarqovı) küçəsinə və Fəvvarələr meydanına 2 addımlıq məsafə"
],
    theVibe: "Müasir incəsənət həvəskarları və butik otel aşiqləri üçün unikal cazibə",
    roomOptions: [
      {
            "id": "r4-1",
            "name": "Merchant Heritage Room",
            "bedType": "1 Queen yataq",
            "capacity": 2,
            "pricePerNight": 161,
            "originalPrice": 230,
            "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Tarixi tavanlar",
                  "Yağış duşu",
                  "Organik çay dəsti"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-5',
    name: 'The Merchant Baku',
    city: 'Bakı',
    neighborhood: 'Nizami küçəsi',
    address: '4A Hacı Zeynalabdin Tağıyev küç., Səbail r-nu',
    latitude: 40.3692,
    longitude: 49.8415,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 4,
    rating: 9.0,
    reviewLabel: 'Mükəmməl',
    reviewCount: 640,
    tagline: 'Tarixi Xəzər Gəmiçilik binasında zərif butik rahatlığı və Fəvvarələr meydanına yaxınlıq.',
    description:
      'The Merchant Baku tarixi 1858-ci ilə dayanan memarlıq abidəsində yerləşən premium butik oteldir. Zəngin tavan bəzəkləri, xüsusi dizaynlı taxta mebellər və şüşə qübbəli həyət restoranı ilə unikal atmosfer təqdim edir. Nizami küçəsinə və Fəvvarələr meydanına cəmi 2 dəqiqəlik piyada məsafədədir.',
    standardPrice: 210,
    discountedPrice: 147,
    discountPercent: 30,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'gym', 'ac', 'restaurant', 'airportShuttle'],
    advantages: [
      'Fəvvarələr meydanı və "Tarqovı" küçəsinin tam qəlbində',
      'Tarixi memarlıq və retro-lüks butik interyeri',
      'Şüşə tavanlı daxili atrium və zərif kokteyl barı',
    ],
    rules: [
      'Siqaret çəkmək qadağandır.',
      'Sakitliyə riayət olunması xahiş olunur.',
    ],
    importantInfo: [
      'Butik otel olduğu üçün otaq sayı məhduddur.',
      'Romantik istirahət və şəhər gəzintiləri üçün ideal seçimdir.',
    ],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 1,
    dealLabel: 'Son 1 otaq',
    htCategory: 'CHARMING',
    whyWeLikeIt: [
      "İçərişəhərin dar daş döşəməli küçələrində sakit və səmimi atmosfer",
      "Köhnə Bakı üslubunda taxta eyvanlar və yerli qonaqpərvərlik",
      "Ənənəvi təndir çörəyi və zəngin milli səhər yeməyi"
],
    theVibe: "Tarixin qoynunda romantik və rahat nostalji",
    roomOptions: [
      {
            "id": "r5-1",
            "name": "Old City Classic Room",
            "bedType": "1 Double yataq",
            "capacity": 2,
            "pricePerNight": 98,
            "originalPrice": 140,
            "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Qala mənzərəsi",
                  "Milli çay dəstgahı",
                  "WiFi"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-6',
    name: 'Radisson Hotel Baku',
    city: 'Bakı',
    neighborhood: 'Sahil',
    address: '34 Azadlıq prospekti / Puşkin küç., Nəsimi r-nu',
    latitude: 40.3741,
    longitude: 49.8519,
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 4,
    rating: 8.8,
    reviewLabel: 'Çox yaxşı',
    reviewCount: 1120,
    tagline: 'Sahil parkının qarşısında müasir skandinav üslubu və funksional işgüzar rahatlıq.',
    description:
      'Tamamilə yenilənmiş Radisson Hotel Baku Dənizkənarı Bulvarın qarşısında yerləşir. İşıqlı otaqlar, ergonomik iş masaları və "Lagom" restoranında təqdim olunan yerli və beynəlxalq təamlar həm işgüzar səfərlər, həm də istirahət üçün əladır.',
    standardPrice: 180,
    discountedPrice: 126,
    discountPercent: 30,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'parking', 'gym', 'ac', 'restaurant'],
    advantages: [
      'Sahil metrosuna və Dənizkənarı parka 3 dəqiqəlik piyada yolu',
      'Geniş və sürətli işgüzar internet bağlantısı',
      'Şəhərə və Xəzər dənizinə açılan mənzərəli otaqlar',
    ],
    rules: [
      'Giriş saatı 15:00-dan etibarəndir.',
      'Otaqda siqaret çəkmək qadağandır.',
    ],
    importantInfo: [
      'Biznes mərkəzi və konfrans otaqları qonaqlar üçün xidmət göstərir.',
      'Səhər yeməyi 06:30 - 10:30 arası açıq büfe şəklindədir.',
    ],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 5,
    dealLabel: null,
    htCategory: 'SOLID',
    whyWeLikeIt: [
      "Qış Parkı və Füzuli meydanı yanında ultra-müasir rahatlıq",
      "Erqonomik iş zonası və səs izolyasiyalı geniş otaqlar",
      "Barmara restoranında təzə kofe və beynəlxalq mətbəx"
],
    theVibe: "Dəqiq, funksional və iş adamları üçün ideal etibarlılıq",
    roomOptions: [
      {
            "id": "r6-1",
            "name": "Courtyard Standard King",
            "bedType": "1 King yataq",
            "capacity": 2,
            "pricePerNight": 144,
            "originalPrice": 180,
            "image": "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "İş masası",
                  "Sürətli WiFi",
                  "Smart TV"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-7',
    name: 'Shah Palace Hotel',
    city: 'Bakı',
    neighborhood: 'İçərişəhər',
    address: '47 Qala küçəsi, İçərişəhər, Səbail r-nu',
    latitude: 40.3662,
    longitude: 49.8358,
    images: [
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 4,
    rating: 8.6,
    reviewLabel: 'Çox yaxşı',
    reviewCount: 780,
    tagline: 'Şərq nağılları ab-havası, qədim Qız Qalası və Şirvanşahlar Sarayının tam qonşuluğunda.',
    description:
      'Qədim Qala divarları daxilində yerləşən Shah Palace Hotel klassik şərq üslubunda taxta oyma sənəti, milli xalçalar və zərif daş işləmələri ilə dizayn edilib. Ənənəvi Azərbaycan hamamı və saunası ilə qonaqlara əsl tarixi Bakı təcrübəsi yaşadır.',
    standardPrice: 160,
    discountedPrice: 112,
    discountPercent: 30,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'gym', 'spa', 'ac', 'restaurant'],
    advantages: [
      'UNESCO irsi olan İçərişəhərin qəlbində, daş döşənmiş sakit küçədə',
      'Ənənəvi şərq hamamı, sauna və masaj otaqları',
      'Milli təamlar təqdim edən "Xan Çinar" restoranı',
    ],
    rules: [
      'Tarixi zonada avtomobil girişi üçün otel administrasiyasına əvvəlcədən nömrə bildirilməlidir.',
      'Siqaret çəkmək qadağandır.',
    ],
    importantInfo: [
      'İçərişəhər metro stansiyasına 300 metr piyada məsafədədir.',
      'Sakit və tarixi mühit axtaranlar üçün idealdır.',
    ],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: null,
    dealLabel: 'Tarixi məkan',
    htCategory: 'SOLID',
    whyWeLikeIt: [
      "Qış parkına açılan geniş pəncərələr və təmiz interyer",
      "15-ci mərtəbədə şəhər mənzərəli terras restoranı",
      "Bütün ictimai nəqliyyat qovşaqlarına çox yaxın mövqe"
],
    theVibe: "Geniş park yaşıllığı və sakit şəhər ritmi",
    roomOptions: [
      {
            "id": "r7-1",
            "name": "Park View Superior Room",
            "bedType": "1 King və ya 2 Twin yataq",
            "capacity": 2,
            "pricePerNight": 119,
            "originalPrice": 170,
            "image": "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Park mənzərəsi",
                  "Çay/kofe dəsti",
                  "Seyf"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-8',
    name: 'Holiday Inn Baku',
    city: 'Bakı',
    neighborhood: 'Port Baku',
    address: '1 Keykab Xanım Səfərəliyeva küç., Nəsimi r-nu',
    latitude: 40.3776,
    longitude: 49.8596,
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 4,
    rating: 8.5,
    reviewLabel: 'Çox yaxşı',
    reviewCount: 920,
    tagline: 'Port Baku Mall və Dənizkənarı Bulvara yaxın məsafədə komfortlu ailə və işgüzar istirahət.',
    description:
      'Holiday Inn Baku Port Baku ticarət mərkəzinin və Xəzər dənizi sahilinin yaxınlığında yerləşir. Oteldə spa mərkəzi, sauna və qapalı üzgüçülük hovuzu qonaqların ixtiyarındadır. 18-ci mərtəbədəki "Marina 18" restoranında dəniz mənzərəsi fonunda yeməklərdən zövq ala bilərsiniz.',
    standardPrice: 150,
    discountedPrice: 105,
    discountPercent: 30,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'parking', 'gym', 'pool', 'spa', 'ac', 'restaurant'],
    advantages: [
      'Port Baku lüks ticarət və biznes mərkəzinə piyada 5 dəqiqə',
      'Qapalı hovuz və istirahət spa zonası',
      'Ailəvi səyahətlər üçün geniş və rahat ailə otaqları',
    ],
    rules: [
      'Bütün otaqlarda siqaret çəkilməsi qadağandır.',
      'Giriş üçün depozit tələb oluna bilər.',
    ],
    importantInfo: [
      'Qonaqlar üçün ödənişsiz yeraltı parkinq mövcuddur.',
      'Hava limanına 20 dəqiqəlik avtomobil məsafəsindədir.',
    ],
    checkInTime: '15:00',
    checkOutTime: '12:00',
    freeCancellation: false,
    roomsLeft: null,
    dealLabel: null,
    htCategory: 'HIP',
    whyWeLikeIt: [
      "Ağ Şəhər və dəniz bulvarı boyunca uzanan müasir dizayn",
      "Black City Cafe və dəbli axşam tədbirləri",
      "Açıq hava velosiped zolaqlarına və parka birbaşa çıxış"
],
    theVibe: "Gənclik enerjisi, dəniz kənarı gəzintilər və dinamik şəhər mühiti",
    roomOptions: [
      {
            "id": "r8-1",
            "name": "Boulevard Deluxe Sea View",
            "bedType": "1 King yataq",
            "capacity": 2,
            "pricePerNight": 168,
            "originalPrice": 240,
            "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Balkon",
                  "Dəniz mənzərəsi",
                  "Fitness girişi"
            ],
            "freeCancellation": true
      }
],
  },
  {
    id: 'hotel-9',
    name: 'Promenade Hotel Baku',
    city: 'Bakı',
    neighborhood: 'Bulvar',
    address: '14 Neftçilər prospekti, Səbail r-nu',
    latitude: 40.3671,
    longitude: 49.8385,
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 4,
    rating: 8.4,
    reviewLabel: 'Çox yaxşı',
    reviewCount: 510,
    tagline: 'Bulvarın qarşısında münasib qiymətə yüksək komfort və dam terrası.',
    description:
      'Promenade Hotel Baku dəniz sahilində, Xalça Muzeyi və Kiçik Venesiya şəhərciyi yaxınlığında yerləşir. Otelin damında yerləşən terras restorandan Xəzər dənizinə və axşam şəhərinə möhtəşəm mənzərə açılır. Rahat otaqlar və səmimi xidmət səyahətinizi xoş edəcək.',
    standardPrice: 120,
    discountedPrice: 96,
    discountPercent: 20,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'ac', 'restaurant', 'airportShuttle'],
    advantages: [
      'Dənizkənarı Bulvara və Dəniz Mall-a birbaşa çıxış',
      'Dam terrasında romantik şam yeməyi mənzərəsi',
      'Şəhər mərkəzində münasib qiymət və yüksək keyfiyyət balansı',
    ],
    rules: [
      'Siqaret çəkmək qadağandır.',
      'Sakitlik saatı: 23:00 - 08:00.',
    ],
    importantInfo: [
      'Dəniz Mall ticarət mərkəzinə cəmi 5 dəqiqəlik piyada yolu.',
      'Şəhər velosiped icarəsi məntəqəsi otelin qarşısındadır.',
    ],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 2,
    dealLabel: 'Büdcəyə uyğun',
    htCategory: 'BASIC',
    whyWeLikeIt: [
      "Qız Qalasına 100 metr məsafədə ən sərfəli gecələmə",
      "Təmiz otaqlar, sürətli Wi-Fi və 24 saat açıq resepsiyon",
      "Qədim qala divarları arasında yerləşən sərfəli qiymət"
],
    theVibe: "Büdcəli səyahətçilər və şəhəri kəşf etmək istəyənlər üçün ideal baza",
    roomOptions: [
      {
            "id": "r9-1",
            "name": "Budget Double Room",
            "bedType": "1 Double yataq",
            "capacity": 2,
            "pricePerNight": 68,
            "originalPrice": 85,
            "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Fərdi duş",
                  "WiFi",
                  "Kondisioner"
            ],
            "freeCancellation": false
      }
],
  },
  {
    id: 'hotel-10',
    name: 'Old Street Boutique Hotel',
    city: 'Bakı',
    neighborhood: 'İçərişəhər',
    address: '18 Sabir küçəsi, İçərişəhər, Səbail r-nu',
    latitude: 40.368,
    longitude: 49.8369,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    ],
    starRating: 3,
    rating: 8.2,
    reviewLabel: 'Yaxşı',
    reviewCount: 390,
    tagline: 'Qədim daş divarlar arasında büdcənizə qənaət edən isti və rahat butik məkan.',
    description:
      'Old Street Boutique Hotel İçərişəhərin sakit döngələrindən birində yerləşən şirin butik oteldir. Qonaqpərvər personal, təmiz və isti otaqlar, səhərlər təqdim olunan isti təndir çörəkli milli səhər yeməyi ilə ev rahatlığını hiss etdirir.',
    standardPrice: 95,
    discountedPrice: 80,
    discountPercent: 16,
    currency: 'AZN',
    amenities: ['wifi', 'breakfast', 'ac', 'restaurant'],
    advantages: [
      'İçərişəhərin qəlbində ən münasib büdcəli otel təklifi',
      'Evsayağı dadlı milli səhər yeməyi',
      'Görkəmli tarixi məkanlara və kafelərə piyada yaxınlıq',
    ],
    rules: [
      'Otaqlarda siqaret çəkmək qadağandır.',
      'Giriş zamanı pasport qeydiyyatı mütləqdir.',
    ],
    importantInfo: [
      'Metronun İçərişəhər stansiyasına 4 dəqiqəlik piyada yolu.',
      'Sakit və avtomobil səslərindən uzaq məkan.',
    ],
    checkInTime: '13:00',
    checkOutTime: '12:00',
    freeCancellation: true,
    roomsLeft: 3,
    dealLabel: 'Əla qiymət',
    htCategory: 'SOLID',
    whyWeLikeIt: [
      "Tam təchiz olunmuş mətbəx zonası və geniş studiya otaqlar",
      "28 Mall ticarət mərkəzi və Dəmiryol Vağzalı ilə üzbəüz",
      "Gündəlik pulsuz qəlyanaltı və isti içki təklifləri"
],
    theVibe: "Ev rahatlığında uzunmüddətli və ya ailəvi dincəlmə",
    roomOptions: [
      {
            "id": "r10-1",
            "name": "Studio Suite with Kitchen",
            "bedType": "1 King yataq + mətbəx",
            "capacity": 2,
            "pricePerNight": 153,
            "originalPrice": 220,
            "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            "amenities": [
                  "Mətbəx ləvazimatları",
                  "Soyuducu",
                  "Paltaryuyan",
                  "Səhər yeməyi daxil"
            ],
            "freeCancellation": true
      }
],
  },
];