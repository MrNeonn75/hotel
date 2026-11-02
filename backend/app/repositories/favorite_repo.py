import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.favorite import Favorite
from app.models.guest import Guest
from app.models.hotel import Hotel
from app.repositories.base import BaseRepository


class FavoriteRepository(BaseRepository[Favorite]):
    def __init__(self, session: AsyncSession):
        super().__init__(Favorite, session)

    async def get_or_create_guest(self, device_id: str) -> Guest:
        query = select(Guest).where(Guest.device_id == device_id)
        result = await self.session.execute(query)
        guest = result.scalars().first()
        if not guest:
            guest = Guest(device_id=device_id)
            self.session.add(guest)
            await self.session.commit()
            await self.session.refresh(guest)
        return guest

    async def get_favorite(self, guest_id: uuid.UUID, hotel_id: uuid.UUID) -> Favorite | None:
        query = select(Favorite).where(
            Favorite.guest_id == guest_id,
            Favorite.hotel_id == hotel_id,
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def add_favorite(self, guest_id: uuid.UUID, hotel_id: uuid.UUID) -> tuple[Favorite, bool]:
        fav = await self.get_favorite(guest_id, hotel_id)
        if fav:
            return fav, False
        fav = Favorite(guest_id=guest_id, hotel_id=hotel_id)
        self.session.add(fav)
        await self.session.commit()
        await self.session.refresh(fav)
        return fav, True

    async def remove_favorite(self, guest_id: uuid.UUID, hotel_id: uuid.UUID) -> bool:
        stmt = delete(Favorite).where(
            Favorite.guest_id == guest_id,
            Favorite.hotel_id == hotel_id,
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

    async def get_hotel_ids_by_guest(self, guest_id: uuid.UUID) -> list[uuid.UUID]:
        query = select(Favorite.hotel_id).where(Favorite.guest_id == guest_id).order_by(Favorite.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_favorite_ids(self, guest_id: uuid.UUID) -> list[str]:
        hotel_ids = await self.get_hotel_ids_by_guest(guest_id)
        return [str(hid) for hid in hotel_ids]

    async def get_favorites_with_hotels(self, guest_id: uuid.UUID) -> list[Hotel]:
        query = (
            select(Hotel)
            .join(Favorite, Favorite.hotel_id == Hotel.id)
            .where(
                Favorite.guest_id == guest_id,
                Hotel.is_active.is_(True),
            )
            .order_by(Favorite.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def sync_favorites(self, guest_id: uuid.UUID, hotel_ids: list[uuid.UUID]) -> list[str]:
        if not hotel_ids:
            return await self.get_favorite_ids(guest_id)

        # Mövcud aktiv otelləri filtrasiya et
        valid_query = select(Hotel.id).where(Hotel.id.in_(hotel_ids), Hotel.is_active.is_(True))
        valid_res = await self.session.execute(valid_query)
        valid_ids = set(valid_res.scalars().all())

        # Qonağın cari favoritləri
        curr_query = select(Favorite.hotel_id).where(Favorite.guest_id == guest_id)
        curr_res = await self.session.execute(curr_query)
        curr_ids = set(curr_res.scalars().all())

        new_favs = [
            Favorite(guest_id=guest_id, hotel_id=hid)
            for hid in hotel_ids
            if hid in valid_ids and hid not in curr_ids
        ]
        if new_favs:
            self.session.add_all(new_favs)
            await self.session.commit()

        return await self.get_favorite_ids(guest_id)
