import asyncio
import sys
import uuid
from decimal import Decimal
from pathlib import Path

# Set stdout encoding to UTF-8 for Windows PowerShell support
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from sqlalchemy import func, select  # noqa: E402
from sqlalchemy.orm import selectinload  # noqa: E402

from app.core.database import AsyncSessionLocal, Base, engine  # noqa: E402
from app.models.guest import Guest, GuestProfile  # noqa: E402
from app.models.hotel import Amenity, Hotel, HotelImage  # noqa: E402

# Deterministic namespace for hotel UUIDs
HOTEL_NAMESPACE = uuid.UUID("a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d")

AMENITIES_DATA = [
    {"key": "wifi", "label_az": "Pulsuz Wi-Fi"},
    {"key": "breakfast", "label_az": "Səhər yeməyi"},
    {"key": "parking", "label_az": "Pulsuz parkinq"},
    {"key": "gym", "label_az": "Fitnes mərkəzi"},
    {"key": "pool", "label_az": "Üzmə hovuzu"},
    {"key": "spa", "label_az": "Spa və sağlamlıq"},
    {"key": "ac", "label_az": "Kondisioner"},
    {"key": "restaurant", "label_az": "Restoran"},
    {"key": "airportShuttle", "label_az": "Hava limanı transferi"},
    {"key": "petFriendly", "label_az": "Ev heyvanlarına icazə"},
]

SEED_HOTELS = [
    {
        "id": "hotel-1",
        "name": "The Boulevard Hotel Baku",
        "city": "Bakı",
        "address": "Xəqani Rüstəmov küç. 4C, Ağ Şəhər Bulvarı, Bakı",
        "latitude": 40.3804,
        "longitude": 49.8821,
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.8,
        "review_count": 342,
        "description": "Xəzər dənizinin sahilində, Ağ Şəhər Bulvarında yerləşən lüks 5 ulduzlu otel. Geniş nömrələri, müasir spa mərkəzi və dəniz panoraması ilə işgüzar və istirahət səfərləri üçün ideal məkandır.",
        "standard_price": 220.0,
        "discounted_price": 145.0,
        "rooms_total": 48,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "pool", "spa", "ac", "restaurant"],
        "advantages": [
            "Xəzər dənizinə birbaşa açılan panoramik mənzərə",
            "Olimpiya ölçülü qapalı hovuz və hidroterapiya zonası",
            "Bakı Ağ Şəhər gəzinti zolağına birbaşa çıxış",
            "Açıq terrasda zəngin beynəlxalq və milli səhər yeməyi",
        ],
        "rules": [
            "Giriş (Check-in) saatı: 14:00-dan etibarən",
            "Çıxış (Check-out) saatı: 12:00-a qədər",
            "Otaqlarda siqaret çəkmək qəti qadağandır",
            "Otel daxilində səs-küy saatları: 23:00 - 08:00",
            "Giriş zamanı şəxsiyyəti təsdiq edən sənəd tələb olunur",
        ],
        "important_info": [
            "Şəhər mərkəzinə pulsuz avtobus xidməti mövcuddur",
            "Spa mərkəzindən istifadə üçün əvvəlcədən rezervasiya tövsiyə olunur",
            "Hava limanından gediş-gəliş məsafəsi 20 dəqiqədir",
        ],
        "check_in_time": "14:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-2",
        "name": "Four Seasons Hotel Baku",
        "city": "Bakı",
        "address": "Neftçilər prospekti 1, Sahil, Bakı",
        "latitude": 40.3644,
        "longitude": 49.8335,
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.9,
        "review_count": 520,
        "description": "Klassik fransız qəsri üslubunda inşa olunmuş Four Seasons Hotel Baku, İçərişəhərin qədim qala divarlarının qarşısında və Milli Park Bulvarının tam kənarında yerləşir.",
        "standard_price": 440.0,
        "discounted_price": 320.0,
        "rooms_total": 55,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "pool", "spa", "ac", "restaurant"],
        "advantages": [
            "İçərişəhər və Xəzər dənizinə baxan fransız eyvanları",
            "Klassik Beaux-Arts memarlıq incisi və mərmər interyerlər",
            "Məşhur Kaspia dəniz məhsulları restoranı",
            "Yüksək səviyyəli konsyerj və 24 saat otaq xidməti",
        ],
        "rules": [
            "Giriş saatı: 15:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Heyvanların qalması üçün öncədən bildiriş vacibdir",
            "Bütün qapalı ərazilərdə siqaret qadağandır",
            "Depozit məbləği kartla bloklanır",
        ],
        "important_info": [
            "Valet parkinq xidməti ödənişsiz təqdim olunur",
            "İtalyan Zafferano restoranında axşam yeməyi üçün əvvəlcədən yer bron edilməlidir",
            "Uşaqlar üçün xüsusi əyləncə otağı və uşaq baxıcısı mövcuddur",
        ],
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-3",
        "name": "Fairmont Flame Towers Baku",
        "city": "Bakı",
        "address": "Mehdizadə küç. 1A, Alov Qüllələri, Bakı",
        "latitude": 40.3598,
        "longitude": 49.8265,
        "images": [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.8,
        "review_count": 418,
        "description": "Bakının müasir rəmzi olan Alov Qüllələrinin daxilində yerləşən bu otel, şəhərin və Bakı buxtasının ən yüksək nöqtəsindən möhtəşəm mənzərə təqdim edir.",
        "standard_price": 380.0,
        "discounted_price": 245.0,
        "rooms_total": 60,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "pool", "spa", "ac", "restaurant"],
        "advantages": [
            "Bütün şəhərə və dənizə baxan döşəmədən tavana panoramik pəncərələr",
            "Açıq hava və qapalı ikimərtəbəli ESPA spa mərkəzi",
            "Böyük kinoteatr kompleksi və alış-veriş mərkəzinə birbaşa keçid",
            "Müasir texnologiyalarla təchiz olunmuş ağıllı otaq idarəetməsi",
        ],
        "rules": [
            "Giriş saatı: 15:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Hovuz zonasına 16 yaşdan kiçik uşaqlar yalnız valideynlə buraxılır",
            "Parti və kütləvi toplanışlar qadağandır",
            "Qonaqların şəxsiyyət vəsiqəsi qeydiyyat üçün tələb olunur",
        ],
        "important_info": [
            "Dağüstü Park və Funikulyor piyada 3 dəqiqəlik məsafədədir",
            "Alov Qüllələrinin işıq şousunu terrasdan seyr etmək olar",
            "Otaq servisində gecə menyusu fəaliyyət göstərir",
        ],
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-4",
        "name": "Shirvanshah Boutique Hotel",
        "city": "Bakı",
        "address": "Qüllə küçəsi 16, İçərişəhər Tarixi Qoruğu, Bakı",
        "latitude": 40.3662,
        "longitude": 49.8352,
        "images": [
            "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.7,
        "review_count": 236,
        "description": "İçərişəhərin dar daş döşənmiş küçələrində gizlənmiş bu butik otel, XIX əsr Şirvan memarlığı ilə müasir komfortu birləşdirir. Qədim xalçalar və orijinal əl işləri ilə bəzədilmişdir.",
        "standard_price": 160.0,
        "discounted_price": 99.0,
        "rooms_total": 18,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "ac", "restaurant", "airportShuttle"],
        "advantages": [
            "Şirvanşahlar Sarayı və Qız Qalasına piyada 2 dəqiqə",
            "Tarixi daş divarlar və unikal şərq ornamentli interyer",
            "Dam terrasında ənənəvi samovar çayı və milli şirniyyatlar",
            "Sakit və avtomobil səs-küyündən uzaq unikal mühit",
        ],
        "rules": [
            "Giriş saatı: 14:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Tarixi qala divarlarına zərər yetirmək qadağandır",
            "Sakitlik rejimi saat 22:00-dan sonra qüvvədədir",
            "Siqaret yalnız açıq həyətyanı sahədə icazəlidir",
        ],
        "important_info": [
            "İçərişəhərə maşınla daxil olmaq üçün otel öncədən buraxılış verir",
            "Gəliş günü hava limanından transfer üçün zəng edə bilərsiniz",
            "Səhər yeməyi ev üslubunda təbii kənd məhsulları ilə təqdim olunur",
        ],
        "check_in_time": "14:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-5",
        "name": "Nizami Boutique Suites",
        "city": "Bakı",
        "address": "Nizami küçəsi 68 (Tarqovı), Bakı",
        "latitude": 40.3728,
        "longitude": 49.8412,
        "images": [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.6,
        "review_count": 195,
        "description": "Bakının ən canlı piyada küçəsi olan Nizami küçəsində (Tarqovı) yerləşən dəbli apart-otel. Şəhərin ən yaxşı kafe, teatr və butikləri addımlığınızdadır.",
        "standard_price": 130.0,
        "discounted_price": 85.0,
        "rooms_total": 24,
        "currency": "AZN",
        "amenities": ["wifi", "ac", "restaurant", "petFriendly", "airportShuttle"],
        "advantages": [
            "Nizami küçəsinin tam mərkəzində mükəmməl piyada lokatsiyası",
            "Tam təchizatlı müasir mətbəx guşəsi olan geniş suitlər",
            "Sürətli optik internet və rahat iş masası",
            "24 saat fəaliyyət göstərən self check-in imkanı",
        ],
        "rules": [
            "Giriş saatı: 14:00-dan etibarən",
            "Çıxış saatı: 11:30-a qədər",
            "Heyvanlar üçün kiçik çəki limiti (maksimum 8 kq)",
            "Otaqlarda qonaq qəbulu saat 22:00-a qədər icazəlidir",
            "Mənzillərdə siqaret qəti qadağandır",
        ],
        "important_info": [
            "Küçə piyada zonası olduğu üçün avtomobil dayanacağı 150 metr aralıdadır",
            "Fəvvarələr meydanına cəmi 4 dəqiqəlik piyada yol",
            "Uzunmüddətli qalmaq üçün xüsusi endirim tarifləri mövcuddur",
        ],
        "check_in_time": "14:00",
        "check_out_time": "11:30",
        "is_active": True,
    },
    {
        "id": "hotel-6",
        "name": "JW Marriott Absheron Baku",
        "city": "Bakı",
        "address": "674 Azadlıq meydanı, Port Baku yanı, Bakı",
        "latitude": 40.3742,
        "longitude": 49.8546,
        "images": [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.9,
        "review_count": 680,
        "description": "Azadlıq Meydanında, Port Baku Mall və biznes mərkəzinin yanında möhtəşəm 5 ulduzlu otel. Şəhərin ən yaxşı steak-house restoranları və 21-ci mərtəbədəki panoramik spa mərkəzi ilə tanınır.",
        "standard_price": 390.0,
        "discounted_price": 260.0,
        "rooms_total": 52,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "pool", "spa", "ac", "restaurant"],
        "advantages": [
            "21-ci mərtəbədə Bakı körfəzinə açılan qapalı hovuz və spa",
            "Port Baku lüks alış-veriş mərkəzinə piyada 3 dəqiqə",
            "Məşhur OroNero Bar & Ristorante və Fireworks Urban Kitchen",
            "Marriott Bonvoy üzvləri üçün xüsusi xidmət üstünlükləri",
        ],
        "rules": [
            "Giriş saatı: 15:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Siqaret çəkilməyən tam qapalı mühit",
            "Təhlükəsizlik üçün qonaqların qeydiyyat kartı doldurması vacibdir",
            "Yalnız müəyyən edilmiş saatlarda canlı musiqi təşkil edilir",
        ],
        "important_info": [
            "Yeraltı mühafizə olunan çoxmərtəbəli avtodayanacaq mövcuddur",
            "Heydər Əliyev Beynəlxalq Hava Limanına birbaşa transfer sifarişi",
            "İşgüzar görüşlər üçün ən müasir konfrans zalları",
        ],
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-7",
        "name": "Fountain Square Heritage Hotel",
        "city": "Bakı",
        "address": "Tərlan Əliyarbəyov küç. 8, Fəvvarələr Meydanı, Bakı",
        "latitude": 40.3705,
        "longitude": 49.8375,
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.5,
        "review_count": 164,
        "description": "Fəvvarələr Meydanının tarixi binalarından birində yerləşən bu otel, Bakının əyləncə, qastronomiya və gəzinti mərkəzində unudulmaz təcrübə vəd edir.",
        "standard_price": 140.0,
        "discounted_price": 95.0,
        "rooms_total": 28,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "ac", "restaurant", "airportShuttle"],
        "advantages": [
            "Fəvvarələr Meydanına birbaşa baxan pəncərələr",
            "Ən yaxşı yerli restoran və kafelərə addımlıq məsafə",
            "Hər səhər təzə bişmiş fransız kruasanları və yerli mürəbbələr",
            "Mehriban və çoxdilli personal (Azərbaycan, İngilis, Rus)",
        ],
        "rules": [
            "Giriş saatı: 14:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Otaqlarda siqaret çəkmək qadağandır",
            "Gecə saat 23:00-dan sonra sakitlik rejimi",
            "Qonaqların qalması üçün pasport qeydiyyatı tələb olunur",
        ],
        "important_info": [
            "Piyada ərazisində yerləşdiyi üçün taksi 50 metr məsafədə saxlayır",
            "Gec gəlişlər üçün 24 saat resepsiya xidməti aktivdir",
            "Şəhər turları və bələdçi sifarişi üçün köməklik göstərilir",
        ],
        "check_in_time": "14:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-8",
        "name": "Bayil Marine Bay Resort",
        "city": "Bakı",
        "address": "Qurban Abbasov küç. 34, Bayıl Sahili, Bakı",
        "latitude": 40.347,
        "longitude": 49.839,
        "images": [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.6,
        "review_count": 178,
        "description": "Bakı Kristal Zalı və Dövlət Bayrağı Meydanının yaxınlığında dənizkənarı rahat istirahət məkanı. Sakit mühit, təmiz dəniz havası və geniş terraslar təklif edir.",
        "standard_price": 180.0,
        "discounted_price": 115.0,
        "rooms_total": 32,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "pool", "ac", "restaurant"],
        "advantages": [
            "Baku Crystal Hall və Su İdmanı Sarayına yaxın yerləşmə",
            "Açıq mövsümi hovuz və günəşlənmə terası",
            "Geniş və ödənişsiz şəxsi avtoparkinq",
            "Dəniz məhsulları üzrə ixtisaslaşmış sahil restoranı",
        ],
        "rules": [
            "Giriş saatı: 14:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Hovuzda spirtli içki və şüşə qabların istifadəsi qadağandır",
            "Otaqlarda siqaret çəkmək qadağandır",
            "Uşaqlar hovuzda mütləq böyüklərin nəzarətində olmalıdır",
        ],
        "important_info": [
            "Şəhər mərkəzinə taksi ilə cəmi 7 dəqiqəlik məsafə",
            "Bibiheybət istiqamətinə rahat çıxış imkanı",
            "Otel qonaqları üçün velosiped icarəsi ödənişsizdir",
        ],
        "check_in_time": "14:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-9",
        "name": "Crescent Pearl Luxury Hotel",
        "city": "Bakı",
        "address": "Neftçilər prospekti 128, Crescent Bay, Bakı",
        "latitude": 40.3768,
        "longitude": 49.861,
        "images": [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.9,
        "review_count": 295,
        "description": "Bakının ən yeni memarlıq şahəsəri Crescent kompleksində yerləşən ultra-lüks otel. Müasir dizayn, fərdi xidmət və Xəzər dənizinə heyranedici mənzərə.",
        "standard_price": 420.0,
        "discounted_price": 285.0,
        "rooms_total": 44,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "pool", "spa", "ac", "restaurant"],
        "advantages": [
            "Crescent Mall və sahil parkına birbaşa keçid",
            "İnfinity tipli açıq və qapalı dəniz mənzərəli hovuzlar",
            "Dünya səviyyəli Mişlen ulduzlu şeflərin menyusu",
            "Fərdi konsyerj və VIP qonaq qarşılama xidməti",
        ],
        "rules": [
            "Giriş saatı: 15:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Bütün otaqlarda siqaret çəkilməsi qəti qadağandır",
            "Ev heyvanları qəbul olunmur",
            "Depozit ödənişi tələb olunur",
        ],
        "important_info": [
            "Gecə gəlişləri üçün 24/7 qeydiyyat və otaq xidməti aktivdir",
            "Helikopter meydançası və VIP transfer xidməti mövcuddur",
            "Geniş iclas otaqları ən son texnologiya ilə təchiz edilib",
        ],
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
    {
        "id": "hotel-10",
        "name": "Narimanov Palace & Residences",
        "city": "Bakı",
        "address": "Təbriz küçəsi 82, Nərimanov, Bakı",
        "latitude": 40.396,
        "longitude": 49.868,
        "images": [
            "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
        ],
        "rating": 4.7,
        "review_count": 215,
        "description": "Zaha Hadid tərəfindən layihələndirilmiş Heydər Əliyev Mərkəzinə yaxın məsafədə yerləşən zərif otel. İşgüzar səfərlər və rahat ailə tətilləri üçün geniş nömrələr təqdim edir.",
        "standard_price": 175.0,
        "discounted_price": 110.0,
        "rooms_total": 36,
        "currency": "AZN",
        "amenities": ["wifi", "breakfast", "parking", "gym", "spa", "ac", "restaurant", "airportShuttle"],
        "advantages": [
            "Heydər Əliyev Mərkəzinə və parkına piyada 5 dəqiqə",
            "Nərimanov metro stansiyasına yaxın əlverişli nəqliyyat qovşağı",
            "Geniş ailəvi nömrələr və müasir fitnes mərkəzi",
            "Hava limanına birbaşa Heydər Əliyev prospekti ilə 15 dəqiqəyə çıxış",
        ],
        "rules": [
            "Giriş saatı: 14:00-dan etibarən",
            "Çıxış saatı: 12:00-a qədər",
            "Bütün otaqlarda siqaret çəkmək qadağandır",
            "Otel ərazisində səs-küy qaydalarına riayət olunmalıdır",
            "Qonaqların rəsmi qeydiyyatı üçün pasport tələb olunur",
        ],
        "important_info": [
            "Qonaqlar üçün yeraltı qapalı dayanacaq ödənişsizdir",
            "Səhər yeməyi zəngin bufet üslubunda 07:00 - 10:30 arası təqdim edilir",
            "Konfrans və tədbir zalları mövcuddur",
        ],
        "check_in_time": "14:00",
        "check_out_time": "12:00",
        "is_active": True,
    },
]


def calculate_discount_percent(standard: Decimal, discounted: Decimal) -> int:
    """standard_price və discounted_price-dan faiz hesablayır."""
    if standard <= 0:
        return 0
    percent = round(((standard - discounted) / standard) * 100)
    return max(0, min(100, int(percent)))


async def seed():
    print("🌱 Verilənlər bazası cədvəlləri yoxlanılır...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Amenities (Idempotent: açara görə axtarılır, varsa saxlanılır)
        print("🌱 Xidmətlər (Amenities) yoxlanılır və əlavə edilir...")
        existing_amenities = await session.execute(select(Amenity))
        amenities_map = {a.key: a for a in existing_amenities.scalars().all()}

        added_amenity_count = 0
        for a_data in AMENITIES_DATA:
            if a_data["key"] not in amenities_map:
                amenity = Amenity(key=a_data["key"], label_az=a_data["label_az"])
                session.add(amenity)
                amenities_map[a_data["key"]] = amenity
                added_amenity_count += 1

        await session.flush()
        print(f"✨ Xidmətlər hazırlandı: {len(amenities_map)} aktiv xidmət (Yeni əlavə olunan: {added_amenity_count})")

        # 2. Hotels (Idempotent: unikal deterministik UUID və adına görə)
        print("🌱 Otellər yoxlanılır və sinxronlaşdırılır...")
        existing_hotels_result = await session.execute(
            select(Hotel).options(selectinload(Hotel.images), selectinload(Hotel.amenities))
        )
        existing_hotels_by_name = {h.name: h for h in existing_hotels_result.scalars().all()}

        new_hotels_count = 0
        updated_hotels_count = 0

        for data in SEED_HOTELS:
            hotel_id = uuid.uuid5(HOTEL_NAMESPACE, data["id"])
            standard_price = Decimal(str(data["standard_price"]))
            discounted_price = Decimal(str(data["discounted_price"]))
            discount_percent = calculate_discount_percent(standard_price, discounted_price)

            hotel_name = data["name"]

            if hotel_name in existing_hotels_by_name:
                # Mövcud otelin məlumatlarını yenilə (idempotent sinxronizasiya)
                hotel = existing_hotels_by_name[hotel_name]
                hotel.city = data["city"]
                hotel.address = data["address"]
                hotel.latitude = data["latitude"]
                hotel.longitude = data["longitude"]
                hotel.description = data["description"]
                hotel.standard_price = standard_price
                hotel.discounted_price = discounted_price
                hotel.discount_percent = discount_percent
                hotel.currency = data["currency"]
                hotel.rating = Decimal(str(data["rating"]))
                hotel.review_count = data["review_count"]
                hotel.rooms_total = data["rooms_total"]
                hotel.check_in_time = data["check_in_time"]
                hotel.check_out_time = data["check_out_time"]
                hotel.is_active = data["is_active"]
                hotel.advantages = data["advantages"]
                hotel.rules = data["rules"]
                hotel.important_info = data["important_info"]

                # Şəkillər yoxlanılır
                existing_urls = {img.url for img in hotel.images}
                for pos, img_url in enumerate(data["images"]):
                    if img_url not in existing_urls:
                        img = HotelImage(hotel_id=hotel.id, url=img_url, position=pos)
                        session.add(img)

                # Xidmətlər yoxlanılır
                current_amenity_keys = {a.key for a in hotel.amenities}
                for a_key in data["amenities"]:
                    if a_key in amenities_map and a_key not in current_amenity_keys:
                        hotel.amenities.append(amenities_map[a_key])

                updated_hotels_count += 1
            else:
                # Yeni otel üçün xidmətlər və şəkillər kolleksiyası
                hotel_amenities_list = [
                    amenities_map[a_key] for a_key in data["amenities"] if a_key in amenities_map
                ]
                hotel_images_list = [
                    HotelImage(url=url, position=pos) for pos, url in enumerate(data["images"])
                ]

                # Yeni otel əlavə edilir
                hotel = Hotel(
                    id=hotel_id,
                    name=hotel_name,
                    city=data["city"],
                    address=data["address"],
                    latitude=data["latitude"],
                    longitude=data["longitude"],
                    description=data["description"],
                    standard_price=standard_price,
                    discounted_price=discounted_price,
                    discount_percent=discount_percent,
                    currency=data["currency"],
                    rating=Decimal(str(data["rating"])),
                    review_count=data["review_count"],
                    rooms_total=data["rooms_total"],
                    check_in_time=data["check_in_time"],
                    check_out_time=data["check_out_time"],
                    is_active=data["is_active"],
                    advantages=data["advantages"],
                    rules=data["rules"],
                    important_info=data["important_info"],
                    amenities=hotel_amenities_list,
                    images=hotel_images_list,
                )
                session.add(hotel)
                new_hotels_count += 1

        # 3. Anonim default qonaq və profil (Idempotent)
        default_guest_res = await session.execute(
            select(Guest).where(Guest.device_id == "default-device")
        )
        guest = default_guest_res.scalars().first()
        if not guest:
            guest = Guest(device_id="default-device")
            session.add(guest)
            await session.flush()

            profile = GuestProfile(
                guest_id=guest.id,
                first_name="Elşən",
                last_name="Məmmədov",
                phone="+994501234567",
                email="elshan@staynow.az",
                nationality="Azərbaycan",
                city="Bakı",
                preferred_language="AZ",
            )
            session.add(profile)
            print("👤 Nümunə qonaq profili yaradıldı (default-device).")

        await session.commit()

        # 4. Yekun statistik məlumatın bazadan hesablanması və konsola yazılması
        total_hotels_count = await session.scalar(select(func.count(Hotel.id)))

        print("--------------------------------------------------")
        print("✅ Seed əməliyyatı uğurla tamamlandı!")
        print(f"🏨 Yeni yaradılan otellər: {new_hotels_count}")
        print(f"🔄 Mövcud yenilənən otellər: {updated_hotels_count}")
        print(f"📊 Bazadakı ümumi otel sayı: {total_hotels_count}")
        print("--------------------------------------------------")


if __name__ == "__main__":
    asyncio.run(seed())
