import { Review } from '@/types/hotel';

export const MOCK_REVIEWS: Review[] = [
  // Bulevard House
  {
    id: 'rev-bh-1',
    hotelId: 'bulevard-house',
    userName: 'Rəşad Əliyev',
    userCountry: 'Azərbaycan',
    rating: 5.0,
    date: '2 gün əvvəl',
    comment:
      'Bulvara çox yaxındır, axşam gəzintiləri üçün əla yerdir. Otaqlar çox təmiz, personal çox nəzakətli idi. Səhər yeməyi xüsusilə xoşuma gəldi.',
    roomType: 'Deluxe Dəniz Mənzərəli Otaq',
  },
  {
    id: 'rev-bh-2',
    hotelId: 'bulevard-house',
    userName: 'Leyla Məmmədova',
    userCountry: 'Azərbaycan',
    rating: 4.8,
    date: '1 həftə əvvəl',
    comment:
      'Gecə vaxtı StayNow ilə rezerv etdik, 10 dəqiqəyə otağımızda idik. Sürətli qeydiyyat və rahat yataq. Tövsiyə edirəm.',
    roomType: 'Deluxe Dəniz Mənzərəli Otaq',
  },
  {
    id: 'rev-bh-3',
    hotelId: 'bulevard-house',
    userName: 'Dmitry Ivanov',
    userCountry: 'Qazaxıstan',
    rating: 4.9,
    date: '2 həftə əvvəl',
    comment:
      'Super location right on the boulevard! Clean modern rooms with sea view. Breakfast was delicious with local pastries.',
    roomType: 'Executive Lüks Suite',
  },
  {
    id: 'rev-bh-4',
    hotelId: 'bulevard-house',
    userName: 'Aysel Qasımova',
    userCountry: 'Azərbaycan',
    rating: 4.7,
    date: '3 həftə əvvəl',
    comment: 'Pəncərədən dəniz mənzərəsi inanılmaz gözəl idi. Spa və masaj xidməti də çox bəyənildi.',
    roomType: 'Deluxe Dəniz Mənzərəli Otaq',
  },
  {
    id: 'rev-bh-5',
    hotelId: 'bulevard-house',
    userName: 'Murad Həsənov',
    userCountry: 'Türkiyə',
    rating: 5.0,
    date: '1 ay əvvəl',
    comment: 'Konum harika, odalar ferah ve personel çok ilgili. Bakü seyahatimde tekrar kalacağım.',
    roomType: 'Executive Lüks Suite',
  },
  {
    id: 'rev-bh-6',
    hotelId: 'bulevard-house',
    userName: 'Sophie Martin',
    userCountry: 'Fransa',
    rating: 4.8,
    date: '1 ay əvvəl',
    comment: 'Charming boutique hotel with wonderful hospitality. The sea breeze on the balcony is magical.',
    roomType: 'Deluxe Dəniz Mənzərəli Otaq',
  },
  {
    id: 'rev-bh-7',
    hotelId: 'bulevard-house',
    userName: 'Kamran Nəcəfov',
    userCountry: 'Azərbaycan',
    rating: 4.6,
    date: '2 ay əvvəl',
    comment: 'Qiymət və keyfiyyət nisbəti tam yerindədir. Mərkəzdə belə sakit otel tapmaq nadirdir.',
    roomType: 'Deluxe Dəniz Mənzərəli Otaq',
  },
  {
    id: 'rev-bh-8',
    hotelId: 'bulevard-house',
    userName: 'Nigar İsmayılova',
    userCountry: 'Azərbaycan',
    rating: 5.0,
    date: '2 ay əvvəl',
    comment: 'Hər şey mükəmməl təşkil olunmuşdu. Ailə ilə istirahət üçün çox uyğundur.',
    roomType: 'Executive Lüks Suite',
  },

  // Four Seasons Baku
  {
    id: 'rev-fs-1',
    hotelId: 'four-seasons-baku',
    userName: 'Teymur Vəliyev',
    userCountry: 'Azərbaycan',
    rating: 5.0,
    date: '3 gün əvvəl',
    comment:
      'Əsl 5 ulduz lüksü. SPA, hovuz və restoranlar ən yüksək beynəlxalq səviyyədədir.',
    roomType: 'Superior King Otaq',
  },
  {
    id: 'rev-fs-2',
    hotelId: 'four-seasons-baku',
    userName: 'Elena Petrova',
    userCountry: 'BƏƏ',
    rating: 5.0,
    date: '1 həftə əvvəl',
    comment: 'World class hotel with outstanding service and great view of the Old City.',
    roomType: 'Superior King Otaq',
  },
  {
    id: 'rev-fs-3',
    hotelId: 'four-seasons-baku',
    userName: 'Elnur Cəfərov',
    userCountry: 'Azərbaycan',
    rating: 4.9,
    date: '2 həftə əvvəl',
    comment: 'İçərişəhərə piyada 1 dəqiqə. Zala daxil olanda ab-hava valeh edir.',
    roomType: 'Diplomatic Suite',
  },

  // Fairmont Baku
  {
    id: 'rev-fb-1',
    hotelId: 'fairmont-baku',
    userName: 'Cavid Quliyev',
    userCountry: 'Azərbaycan',
    rating: 4.9,
    date: '4 gün əvvəl',
    comment:
      'Alov Qüllələrində qalmaq unudulmaz təcrübədir. 24-cü mərtəbədən gecə Bakısı möhtəşəm görünür.',
    roomType: 'Flame Towers Deluxe Körfəz Mənzərəsi',
  },
  {
    id: 'rev-fb-2',
    hotelId: 'fairmont-baku',
    userName: 'Sarah Jenkins',
    userCountry: 'Böyük Britaniya',
    rating: 4.8,
    date: '10 gün əvvəl',
    comment: 'Iconic architecture and luxurious amenities. Spa facilities are top tier.',
    roomType: 'Flame Towers Deluxe Körfəz Mənzərəsi',
  },

  // Şirvanşah Hotel
  {
    id: 'rev-sh-1',
    hotelId: 'shirvanshah-hotel',
    userName: 'Nərgiz Məcidova',
    userCountry: 'Azərbaycan',
    rating: 5.0,
    date: '5 gün əvvəl',
    comment:
      'İçərişəhərdə nağılvari atmosfer! Otaqlardakı qədimi daş naxışlar və milli səhər süfrəsi çox ləzzətli idi.',
    roomType: 'Şərq Üslublu Lüks Otaq',
  },
  {
    id: 'rev-sh-2',
    hotelId: 'shirvanshah-hotel',
    userName: 'Ali Yılmaz',
    userCountry: 'Türkiyə',
    rating: 4.9,
    date: '2 həftə əvvəl',
    comment: 'Tarihi doku ve mükemmel hamam. Kendinizi sultan gibi hissediyorsunuz.',
    roomType: 'Şərq Üslublu Lüks Otaq',
  },
];

