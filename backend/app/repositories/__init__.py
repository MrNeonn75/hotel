from app.repositories.base import BaseRepository
from app.repositories.booking_repo import BookingRepository
from app.repositories.favorite_repo import FavoriteRepository
from app.repositories.hotel_repo import HotelRepository
from app.repositories.profile_repo import ProfileRepository

__all__ = [
    "BaseRepository",
    "HotelRepository",
    "BookingRepository",
    "FavoriteRepository",
    "ProfileRepository",
]

