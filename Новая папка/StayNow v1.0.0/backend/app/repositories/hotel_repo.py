import uuid
from collections.abc import Sequence

from sqlalchemy import case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.hotel import Amenity, Hotel
from app.repositories.base import BaseRepository


class HotelRepository(BaseRepository[Hotel]):
    def __init__(self, session: AsyncSession):
        super().__init__(Hotel, session)

    async def get_by_id(self, hotel_id: str | uuid.UUID) -> Hotel | None:
        try:
            h_uuid = uuid.UUID(str(hotel_id))
        except ValueError:
            return None

        query = (
            select(Hotel)
            .options(selectinload(Hotel.images), selectinload(Hotel.amenities))
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
        min_stars: int | None = None,
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
            search_pattern = f"%{q}%"
            query = query.where(
                or_(
                    Hotel.name.ilike(search_pattern),
                    Hotel.address.ilike(search_pattern),
                    Hotel.description.ilike(search_pattern),
                )
            )

        if min_price is not None:
            query = query.where(Hotel.discounted_price >= min_price)

        if max_price is not None:
            query = query.where(Hotel.discounted_price <= max_price)

        if min_rating is not None:
            query = query.where(Hotel.rating >= min_rating)

        if min_stars is not None:
            query = query.where(Hotel.star_rating >= min_stars)

        if has_discount:
            query = query.where(
                or_(
                    Hotel.discount_percent > 0,
                    Hotel.discounted_price < Hotel.standard_price,
                )
            )

        # "amenities" - bütün tələb olunan açarlar olmalıdır (ALL must match)
        if amenities:
            for key in amenities:
                k = key.strip().lower()
                if k:
                    query = query.where(Hotel.amenities.any(Amenity.key == k))

        # Tarixlərdə boş otağı olmayan otelləri çıxar
        if unavailable_hotel_ids:
            query = query.where(~Hotel.id.in_(unavailable_hotel_ids))

        # Sıralama
        if sort == "price_asc":
            query = query.order_by(Hotel.discounted_price.asc())
        elif sort == "price_desc":
            query = query.order_by(Hotel.discounted_price.desc())
        elif sort == "rating_desc":
            query = query.order_by(Hotel.rating.desc())
        elif sort == "discount_desc":
            query = query.order_by(Hotel.discount_percent.desc())
        else:  # recommended və ya default: deal_label olanlar və yüksək reytinq yuxarı
            has_deal = case((Hotel.deal_label.isnot(None), 1), else_=0)
            query = query.order_by(has_deal.desc(), Hotel.rating.desc(), Hotel.discount_percent.desc())

        result = await self.session.execute(query)
        return list(result.scalars().unique().all())

    async def get_active_cities(self) -> list[tuple[str, int]]:
        """Yalnız aktiv otelləri olan şəhərləri hotelCount azalan sıra ilə qaytarır."""
        query = (
            select(Hotel.city, func.count(Hotel.id).label("hotel_count"))
            .where(Hotel.is_active.is_(True))
            .group_by(Hotel.city)
            .order_by(func.count(Hotel.id).desc(), Hotel.city.asc())
        )
        result = await self.session.execute(query)
        return [(row[0], row[1]) for row in result.all()]

    async def get_by_ids(self, ids: Sequence[str]) -> list[Hotel]:
        """Verilmiş ID-lər üzrə otelləri tapır və verilmiş ardıcıllığı qoruyur (maksimum 50)."""
        if not ids:
            return []

        # Maksimum 50 ID
        capped_ids = ids[:50]

        id_order_map: dict[str, int] = {}
        uuids: list[uuid.UUID] = []

        for idx, item in enumerate(capped_ids):
            clean_str = str(item).strip()
            if not clean_str:
                continue
            try:
                u = uuid.UUID(clean_str)
                uuids.append(u)
                id_order_map[str(u)] = idx
            except ValueError:
                # UUID deyilsə, ötür
                continue

        if not uuids:
            return []

        query = (
            select(Hotel)
            .options(selectinload(Hotel.images), selectinload(Hotel.amenities))
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
