import uuid
from decimal import Decimal

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    def __init__(self, session: AsyncSession):
        super().__init__(Review, session)

    async def get_by_hotel_id(
        self, hotel_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> list[Review]:
        stmt = (
            select(Review)
            .where(Review.hotel_id == hotel_id)
            .order_by(desc(Review.created_at))
            .limit(limit)
            .offset(offset)
        )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def get_rating_stats(self, hotel_id: uuid.UUID) -> tuple[Decimal, int]:
        stmt = (
            select(
                func.coalesce(func.avg(Review.rating), 5.0),
                func.count(Review.id),
            )
            .where(Review.hotel_id == hotel_id)
        )
        res = await self.session.execute(stmt)
        avg_rating, count = res.one()
        return Decimal(str(round(float(avg_rating), 1))), int(count)

