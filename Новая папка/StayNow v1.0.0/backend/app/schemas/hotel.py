from datetime import date

from pydantic import Field

from app.schemas.base import CamelModel


class HotelBase(CamelModel):
    name: str
    city: str = "Bakı"
    address: str
    latitude: float
    longitude: float
    images: list[str] = []
    rating: float = 8.5
    review_count: int = 0
    description: str = ""
    standard_price: float
    discounted_price: float
    discount_percent: int = 0
    currency: str = "AZN"
    amenities: list[str] = []
    advantages: list[str] = []
    rules: list[str] = []
    important_info: list[str] = []
    check_in_time: str = "14:00"
    check_out_time: str = "12:00"

    # HotelTonight yeni sahələri (camelCase avtomatik yaranır)
    star_rating: int = 3
    neighborhood: str = ""
    tagline: str = ""
    free_cancellation: bool = True
    deal_label: str | None = None
    review_label: str = "Orta"
    rooms_left: int | None = None


class HotelCreate(HotelBase):
    id: str


class HotelUpdate(CamelModel):
    name: str | None = None
    city: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    images: list[str] | None = None
    rating: float | None = None
    review_count: int | None = None
    description: str | None = None
    standard_price: float | None = None
    discounted_price: float | None = None
    discount_percent: int | None = None
    currency: str | None = None
    amenities: list[str] | None = None
    advantages: list[str] | None = None
    rules: list[str] | None = None
    important_info: list[str] | None = None
    check_in_time: str | None = None
    check_out_time: str | None = None

    star_rating: int | None = None
    neighborhood: str | None = None
    tagline: str | None = None
    free_cancellation: bool | None = None
    deal_label: str | None = None


class HotelListItem(CamelModel):
    id: str
    name: str
    city: str = "Bakı"
    address: str
    latitude: float
    longitude: float
    images: list[str] = []
    rating: float = 8.5
    review_count: int = 0
    standard_price: float
    discounted_price: float
    discount_percent: int = 0
    currency: str = "AZN"
    amenities: list[str] = []
    advantages: list[str] = []
    check_in_time: str = "14:00"
    check_out_time: str = "12:00"
    distance_km: float | None = None
    is_active: bool = True

    # HotelTonight yeni sahələri
    star_rating: int = 3
    neighborhood: str = ""
    tagline: str = ""
    free_cancellation: bool = True
    deal_label: str | None = None
    review_label: str = "Orta"
    rooms_left: int | None = None


class HotelResponse(HotelBase):
    id: str
    distance_km: float | None = None
    is_active: bool = True


class HotelListResponse(CamelModel):
    items: list[HotelListItem]
    page: int
    page_size: int
    total: int


class HotelAvailabilityResponse(CamelModel):
    available: bool
    rooms_left: int


class HotelFilterParams(CamelModel):
    q: str | None = Field(None, max_length=200)
    city: str | None = Field(None, max_length=100)
    min_price: float | None = None
    max_price: float | None = None
    amenities: list[str] | None = None
    min_rating: float | None = None
    min_stars: int | None = Field(None, ge=1, le=5)
    has_discount: bool | None = None
    sort: str | None = None  # recommended | price_asc | price_desc | rating_desc | discount_desc
    check_in: date | None = None
    check_out: date | None = None
    guests: int | None = None
    lat: float | None = None
    lng: float | None = None
    radius_km: float | None = None
    page: int = 1
    page_size: int = 20


class CityResponse(CamelModel):
    name: str
    hotel_count: int
