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
    rating: float = 5.0
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


class HotelListItem(CamelModel):
    id: str
    name: str
    city: str = "Bakı"
    address: str
    latitude: float
    longitude: float
    images: list[str] = []
    rating: float = 5.0
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
