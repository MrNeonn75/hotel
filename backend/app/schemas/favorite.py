from pydantic import Field

from app.schemas.base import CamelModel
from app.schemas.hotel import HotelResponse


class FavoriteActionResponse(CamelModel):
    hotel_id: str
    is_favorite: bool
    message: str


class FavoriteSyncRequest(CamelModel):
    hotel_ids: list[str] = Field(..., max_length=100)


class FavoriteSyncResponse(CamelModel):
    hotel_ids: list[str]


# Keçmiş modellərlə uyğunluq üçün
class FavoriteToggleRequest(CamelModel):
    hotel_id: str = Field(..., max_length=100)
    user_id: str | None = Field(None, max_length=100)
    device_id: str | None = Field(None, max_length=100)


class FavoriteToggleResponse(CamelModel):
    hotel_id: str
    is_favorite: bool
    message: str


class FavoriteListResponse(CamelModel):
    device_id: str
    hotel_ids: list[str]
    hotels: list[HotelResponse]
