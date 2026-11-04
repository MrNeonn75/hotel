import uuid
from collections.abc import Sequence

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.hotel import Amenity, Hotel
from app.repositories.base import BaseRepository

HOTEL_NAMESPACE = uuid.UUID("a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d")


class HotelRepository(BaseRepository[Hotel]):
    def __init__(self, session: AsyncSession):
        super().__init__(Hotel, session)

    async def get_by_id(self, hotel_id: str | uuid.UUID) -> Hotel | None:
        try:
            h_uuid = uuid.UUID(str(hotel_id))
        except ValueError:
            h_uuid = uuid.uuid5(HOTEL_NAMESPACE, str(hotel_id))

        query = (
            select(Hotel)
            .options(
                selectinload(Hotel.images),
                selectinload(Hotel.amenities),
                selectinload(Hotel.rooms),
            )
            .where(Hotel.id == h_uuid)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_hotels(
        self,
        q: str | None = None,
        city: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        amenities: list[str] | None = None,
        min_rating: float | None = None,
        has_discount: bool | None = None,
        sort: str | None = None,
        unavailable_hotel_ids: set[uuid.UUID] | None = None,
    ) -> list[Hotel]:
        query = (
            select(Hotel)
            .options(selectinload(Hotel.images), selectinload(Hotel.amenities))
            .where(Hotel.is_active.is_(True))
        )

        if city:
            query = query.where(Hotel.city.ilike(f"%{city}%"))

        if q:
            clean_q = f"%{q.strip()}%"
            query = query.where(
                or_(
                    Hotel.name.ilike(clean_q),
                    Hotel.address.ilike(clean_q),
                    Hotel.description.ilike(clean_q),
                )
            )

        if min_price is not None:
            query = query.where(Hotel.discounted_price >= min_price)

        if max_price is not None:
            query = query.where(Hotel.discounted_price <= max_price)

        if min_rating is not None:
            query = query.where(Hotel.rating >= min_rating)

        if has_discount is True:
            query = query.where(Hotel.discount_percent > 0)

        if unavailable_hotel_ids:
            query = query.where(~Hotel.id.in_(unavailable_hotel_ids))

        # Amenities filtri (ALL amenities tələb olunur)
        if amenities:
            clean_amenities = [a.strip().lower() for a in amenities if a.strip()]
            for amen in clean_amenities:
                query = query.where(
                    Hotel.amenities.any(
                        func.lower(Amenity.key) == amen
                    )
                )

        # Sıralama
        if sort == "price_asc":
            query = query.order_by(Hotel.discounted_price.asc())
        elif sort == "price_desc":
            query = query.order_by(Hotel.discounted_price.desc())
        elif sort == "rating_desc":
            query = query.order_by(Hotel.rating.desc(), Hotel.review_count.desc())
        elif sort == "discount_desc":
            query = query.order_by(Hotel.discount_percent.desc())
        else:
            # Defolt 'recommended' sıralaması: reytinq və endirim
            query = query.order_by(Hotel.rating.desc(), Hotel.discount_percent.desc())

        result = await self.session.execute(query)
        return list(result.scalars().unique().all())

    async def get_by_ids(self, ids: Sequence[str | uuid.UUID]) -> list[Hotel]:
        """Verilmiş ID-lər üzrə otelləri çəkir və parametr kimi verilmiş ardıcıllığı qoruyur."""
        capped_ids = ids[:50]

        id_order_map: dict[str, int] = {}
        uuids: list[uuid.UUID] = []

        for idx, item in enumerate(capped_ids):
            clean_str = str(item).strip()
            if not clean_str:
                continue
            try:
                u = uuid.UUID(clean_str)
            except ValueError:
                u = uuid.uuid5(HOTEL_NAMESPACE, clean_str)

            uuids.append(u)
            id_order_map[str(u)] = idx

        if not uuids:
            return []

        query = (
            select(Hotel)
            .options(
                selectinload(Hotel.images),
                selectinload(Hotel.amenities),
                selectinload(Hotel.rooms),
            )
            .where(Hotel.id.in_(uuids), Hotel.is_active.is_(True))
        )
        result = await self.session.execute(query)
        fetched_hotels = list(result.scalars().unique().all())

        # Daxil edilən ardıcıllığı dəqiq qoru
        fetched_hotels.sort(key=lambda h: id_order_map.get(str(h.id), 999999))
        return fetched_hotels

    async def get_total_count(self) -> int:
        query = select(func.count(Hotel.id)).where(Hotel.is_active.is_(True))
        result = await self.session.execute(query)
        return result.scalar() or 0
