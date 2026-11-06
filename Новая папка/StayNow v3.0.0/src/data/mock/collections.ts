import { Collection } from '@/types/hotel';
import { getHotelImageUrl } from '@/config/images';

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-sea-view',
    title: 'Xəzər Sahili & Bulvar',
    subtitle: 'Milli park və dəniz sahili boyu yerləşən ən gözəl otellər',
    image: getHotelImageUrl(0),
    hotelIds: ['bulevard-house', 'intourist-hotel-baku', 'sahil-boutique-hotel', 'jw-marriott-absheron'],
    hotelCount: 4,
  },
  {
    id: 'col-old-city',
    title: 'Qədim Bakı & İçərişəhər',
    subtitle: 'Tarixi qala divarları daxilində unikal butik məkanlar',
    image: getHotelImageUrl(11),
    hotelIds: ['shirvanshah-hotel', 'old-city-inn', 'the-merchant-baku'],
    hotelCount: 3,
  },
  {
    id: 'col-city-center',
    title: 'Şəhər Mərkəzi & Fəvvarələr',
    subtitle: 'Nizami küçəsi və şəhərin qaynar həyatının mərkəzində',
    image: getHotelImageUrl(10),
    hotelIds: ['the-merchant-baku', 'dinamo-hotel-baku', 'winter-park-hotel', 'hilton-baku'],
    hotelCount: 4,
  },
  {
    id: 'col-luxury-panorama',
    title: 'Lüks & Panorama',
    subtitle: 'Alov Qüllələri və möhtəşəm körfəz mənzərəli 5 ulduzlu suitlər',
    image: getHotelImageUrl(4),
    hotelIds: ['fairmont-baku', 'four-seasons-baku', 'jw-marriott-absheron'],
    hotelCount: 3,
  },
];

