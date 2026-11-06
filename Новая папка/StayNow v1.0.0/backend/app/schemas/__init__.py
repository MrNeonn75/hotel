from app.schemas.base import CamelModel, SuccessResponse
from app.schemas.booking import (
    BookingCancelResponse,
    BookingCreate,
    BookingResponse,
)
from app.schemas.error import ErrorDetail, ErrorPayload, ErrorResponse
from app.schemas.favorite import (
    FavoriteListResponse,
    FavoriteToggleRequest,
    FavoriteToggleResponse,
)
from app.schemas.health import HealthCheckResponse
from app.schemas.hotel import (
    HotelAvailabilityResponse,
    HotelCreate,
    HotelFilterParams,
    HotelListItem,
    HotelListResponse,
    HotelResponse,
    HotelUpdate,
)
from app.schemas.profile import (
    GuestProfileBase,
    GuestProfileResponse,
    GuestProfileUpdate,
    UserProfileBase,
    UserProfileResponse,
    UserProfileUpdate,
)

__all__ = [
    "CamelModel",
    "SuccessResponse",
    "HealthCheckResponse",
    "ErrorDetail",
    "ErrorPayload",
    "ErrorResponse",
    "HotelCreate",
    "HotelUpdate",
    "HotelResponse",
    "HotelListItem",
    "HotelListResponse",
    "HotelAvailabilityResponse",
    "HotelFilterParams",
    "BookingCreate",
    "BookingResponse",
    "BookingCancelResponse",
    "GuestProfileBase",
    "GuestProfileResponse",
    "GuestProfileUpdate",
    "UserProfileBase",
    "UserProfileUpdate",
    "UserProfileResponse",
    "FavoriteToggleRequest",
    "FavoriteToggleResponse",
    "FavoriteListResponse",
]
