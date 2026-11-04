import uuid

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import BadRequestError, UnauthorizedError
from app.core.security import decode_access_token
from app.models.guest import Guest
from app.models.user import User
from app.repositories.booking_repo import BookingRepository
from app.repositories.collection_repo import CollectionRepository
from app.repositories.favorite_repo import FavoriteRepository
from app.repositories.guest_repo import GuestRepository
from app.repositories.hotel_repo import HotelRepository
from app.repositories.profile_repo import ProfileRepository
from app.repositories.review_repo import ReviewRepository
from app.repositories.room_repo import RoomRepository
from app.repositories.user_repo import UserRepository
from app.services.auth_service import AuthService
from app.services.booking_service import BookingService
from app.services.collection_service import CollectionService
from app.services.favorite_service import FavoriteService
from app.services.hotel_service import HotelService
from app.services.profile_service import ProfileService
from app.services.review_service import ReviewService
from app.services.room_service import RoomService


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


def get_user_repo(session: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(session)


def get_review_repo(session: AsyncSession = Depends(get_db)) -> ReviewRepository:
    return ReviewRepository(session)


def get_room_repo(session: AsyncSession = Depends(get_db)) -> RoomRepository:
    return RoomRepository(session)


def get_collection_repo(session: AsyncSession = Depends(get_db)) -> CollectionRepository:
    return CollectionRepository(session)


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


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repo),
) -> AuthService:
    return AuthService(user_repo)


def get_review_service(
    review_repo: ReviewRepository = Depends(get_review_repo),
    hotel_repo: HotelRepository = Depends(get_hotel_repo),
) -> ReviewService:
    return ReviewService(review_repo, hotel_repo)


def get_room_service(
    room_repo: RoomRepository = Depends(get_room_repo),
    hotel_repo: HotelRepository = Depends(get_hotel_repo),
) -> RoomService:
    return RoomService(room_repo, hotel_repo)


def get_collection_service(
    collection_repo: CollectionRepository = Depends(get_collection_repo),
    hotel_repo: HotelRepository = Depends(get_hotel_repo),
) -> CollectionService:
    return CollectionService(collection_repo, hotel_repo)


async def get_optional_user(
    authorization: str | None = Header(None),
    user_repo: UserRepository = Depends(get_user_repo),
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_uuid = uuid.UUID(payload["sub"])
        user = await user_repo.get_by_id(user_uuid)
        if user and user.is_active:
            return user
    except Exception:
        pass
    return None


async def get_current_user(
    authorization: str | None = Header(None),
    user_repo: UserRepository = Depends(get_user_repo),
) -> User:
    user = await get_optional_user(authorization=authorization, user_repo=user_repo)
    if not user:
        raise UnauthorizedError("Giriş tələb olunur")
    return user


async def get_current_guest(
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
    guest_repo: GuestRepository = Depends(get_guest_repo),
    optional_user: User | None = Depends(get_optional_user),
) -> Guest:
    """
    Cihaz identifikasiyası dependency-si.
    X-Device-Id oxuyur, həmçinin JWT auth mövcuddursa guest.user_id ilə əlaqələndirir.
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

    guest = await guest_repo.get_or_create_by_device_id(str(val))
    if optional_user and guest.user_id != optional_user.id:
        guest.user_id = optional_user.id
        await guest_repo.session.commit()
        await guest_repo.session.refresh(guest)
    return guest


async def get_optional_guest(
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
    guest_repo: GuestRepository = Depends(get_guest_repo),
) -> Guest | None:
    if not x_device_id or not x_device_id.strip():
        return None
    try:
        val = uuid.UUID(x_device_id.strip())
        if val.version == 4:
            return await guest_repo.get_or_create_by_device_id(str(val))
    except Exception:
        pass
    return None
