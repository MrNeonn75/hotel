from pydantic import Field

from app.schemas.base import CamelModel


class ReviewCreate(CamelModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: str = Field(..., min_length=3, max_length=1500)
    room_type: str | None = None
    user_name: str | None = None
    user_country: str | None = "Azərbaycan"


class ReviewResponse(CamelModel):
    id: str
    hotel_id: str
    user_name: str
    user_avatar: str | None = None
    user_country: str = "Azərbaycan"
    rating: float
    date: str
    comment: str
    room_type: str | None = None


class ReviewListResponse(CamelModel):
    items: list[ReviewResponse]
    total: int

