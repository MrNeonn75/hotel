import uuid

from app.core.errors import NotFoundError
from app.models.favorite import Favorite
from app.repositories.favorite_repo import FavoriteRepository
from app.repositories.hotel_repo import HotelRepository
from app.schemas.hotel import HotelListItem, HotelResponse
from app.services.hotel_service import serialize_hotel_list_item, serialize_hotel_response


def _to_uuid(val: str | uuid.UUID) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


class FavoriteService:
    def __init__(self, favorite_repo: FavoriteRepository, hotel_repo: HotelRepository):
        self.favorite_repo = favorite_repo
        self.hotel_repo = hotel_repo

    async def get_favorite_hotels(self, guest_id: uuid.UUID) -> list[HotelListItem]:
        """Cari qonağın favorit otellərini (HotelListItem) ən son əlavə olunan birinci qaytarır."""
        hotels = await self.favorite_repo.get_favorites_with_hotels(guest_id)
        return [serialize_hotel_list_item(h) for h in hotels]

    async def get_favorite_ids(self, guest_id: uuid.UUID) -> list[str]:
        """Yalnız favorit otel ID-lərini qaytarır."""
        return await self.favorite_repo.get_favorite_ids(guest_id)

    async def add_favorite(self, guest_id: uuid.UUID, hotel_id_str: str) -> tuple[Favorite, bool]:
        """
        Oteli favoritlərə əlavə edir.
        İdempotent: əgər artıq varsa is_new=False qaytarır.
        Otel bazada mövcud deyilsə və ya qeyri-aktivdirsə NotFoundError (404) atır.
        """
        try:
            hotel_uuid = _to_uuid(hotel_id_str)
        except (ValueError, TypeError):
            raise NotFoundError(f"'{hotel_id_str}' nömrəli otel tapılmadı") from None

        hotel = await self.hotel_repo.get_by_id(str(hotel_uuid))
        if not hotel or not hotel.is_active:
            raise NotFoundError(f"'{hotel_id_str}' nömrəli otel tapılmadı")

        return await self.favorite_repo.add_favorite(guest_id, hotel_uuid)

    async def remove_favorite(self, guest_id: uuid.UUID, hotel_id_str: str) -> bool:
        """Oteli favoritlərdən silir. İdempotent: həmişə uğurla tamamlanır."""
        try:
            hotel_uuid = _to_uuid(hotel_id_str)
        except (ValueError, TypeError):
            return False
        return await self.favorite_repo.remove_favorite(guest_id, hotel_uuid)

    async def sync_favorites(self, guest_id: uuid.UUID, hotel_id_strs: list[str]) -> list[str]:
        """
        Lokal cihazdakı favoritləri serverlə birləşdirir (union).
        Yekun ID siyahısını qaytarır.
        """
        valid_uuids: list[uuid.UUID] = []
        for hid in hotel_id_strs:
            try:
                valid_uuids.append(_to_uuid(hid))
            except (ValueError, TypeError):
                continue
        return await self.favorite_repo.sync_favorites(guest_id, valid_uuids)

    # Geriye uyğunluq üçün
    async def toggle_favorite(self, identifier: str, hotel_id: str | uuid.UUID) -> tuple[bool, str]:
        guest = await self.favorite_repo.get_or_create_guest(identifier)
        hotel_uuid = _to_uuid(hotel_id)

        existing = await self.favorite_repo.get_favorite(guest.id, hotel_uuid)
        if existing:
            await self.favorite_repo.remove_favorite(guest.id, hotel_uuid)
            return False, "Otel favoritlərdən çıxarıldı"
        else:
            await self.favorite_repo.add_favorite(guest.id, hotel_uuid)
            return True, "Otel favoritlərə əlavə olundu"

    async def get_user_favorites(self, identifier: str) -> tuple[list[str], list[HotelResponse]]:
        guest = await self.favorite_repo.get_or_create_guest(identifier)
        hotel_uuids = await self.favorite_repo.get_hotel_ids_by_guest(guest.id)
        str_ids = [str(hid) for hid in hotel_uuids]
        hotels = await self.hotel_repo.get_by_ids(str_ids)
        return str_ids, [serialize_hotel_response(h) for h in hotels]
