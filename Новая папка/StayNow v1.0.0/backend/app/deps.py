import uuid

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import BadRequestError
from app.models.guest import Guest
from app.repositories.booking_repo import BookingRepository
from app.repositories.favorite_repo import FavoriteRepository
from app.repositories.guest_repo import GuestRepository
from app.repositories.hotel_repo import HotelRepository
from app.repositories.profile_repo import ProfileRepository
from app.services.booking_service import BookingService
from app.services.favorite_service import FavoriteService
from app.services.hotel_service import HotelService
from app.services.profile_service import ProfileService


def get_guest_repo(session: AsyncSession = Depends(get_db)) -> GuestRepository:
    return GuestRepository(session)


def get_hotel_repo(session: AsyncSession = Depends(get_db)) -> HotelRepository:
    return HotelRepository(session)


def get_booking_repo(session: AsyncSession = Depends(get_db)) -> BookingRepository:
    return BookingRepository(session)


def get_favorite_repo(session: AsyncSession = Depends(get_db)) -> FavoriteRepository:
    return FavoriteRepository(session)


def get_profile_repo(session: AsyncSession = Depends(get_db)) -> ProfileRepository:
    return ProfileRepository(session)


def get_hotel_service(
    hotel_repo: HotelRepository = Depends(get_hotel_repo),
    booking_repo: BookingRepository = Depends(get_booking_repo),
) -> HotelService:
    return HotelService(hotel_repo, booking_repo)


def get_booking_service(
    booking_repo: BookingRepository = Depends(get_booking_repo),
    hotel_repo: HotelRepository = Depends(get_hotel_repo),
    profile_repo: ProfileRepository = Depends(get_profile_repo),
) -> BookingService:
    return BookingService(booking_repo, hotel_repo, profile_repo)


def get_favorite_service(
    favorite_repo: FavoriteRepository = Depends(get_favorite_repo),
    hotel_repo: HotelRepository = Depends(get_hotel_repo),
) -> FavoriteService:
    return FavoriteService(favorite_repo, hotel_repo)


def get_profile_service(
    profile_repo: ProfileRepository = Depends(get_profile_repo),
    booking_repo: BookingRepository = Depends(get_booking_repo),
) -> ProfileService:
    return ProfileService(profile_repo, booking_repo)


async def get_current_guest(
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
    guest_repo: GuestRepository = Depends(get_guest_repo),
) -> Guest:
    """
    Anonim cihaz identifikasiyası dependency-si.
    X-Device-Id başlıq parametrini oxuyur və cari Guest modelini qaytarır.

    Qaydalar:
    - Başlıq məcburidir, yoxdursa 400 Bad Request qaytarır.
    - Dəyər etibarlı UUID v4 formatında olmalıdır, əks halda 400 Bad Request qaytarır.
    - Bazada yoxdursa avtomatik yaradılır (get_or_create), last_seen_at yenilənir.

    QEYD (Gələcək JWT miqrasiyası):
    Gələcəkdə istifadəçi qeydiyyatı/JWT auth əlavə edildikdə yalnız bu dependency dəyişəcək.
    JWT token olduqda Guest.user_id = User.id ilə əlaqələndiriləcək.
    """
    if not x_device_id or not x_device_id.strip():
        raise BadRequestError("X-Device-Id header-i tələb olunur")

    clean_id = x_device_id.strip()
    try:
        val = uuid.UUID(clean_id)
        if val.version != 4:
            raise ValueError("UUID is not version 4")
    except Exception:
        raise BadRequestError("X-Device-Id etibarlı UUID v4 formatında olmalıdır") from None

    return await guest_repo.get_or_create_by_device_id(str(val))


async def get_optional_guest(
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
    guest_repo: GuestRepository = Depends(get_guest_repo),
) -> Guest | None:
    """Public endpoint-lər üçün (məs. /hotels) könüllü cihaz tanıma."""
    if not x_device_id or not x_device_id.strip():
        return None
    try:
        val = uuid.UUID(x_device_id.strip())
        if val.version == 4:
            return await guest_repo.get_or_create_by_device_id(str(val))
    except Exception:
        pass
    return None
