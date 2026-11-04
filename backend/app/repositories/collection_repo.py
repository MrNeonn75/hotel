import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.collection import Collection
from app.repositories.base import BaseRepository


class CollectionRepository(BaseRepository[Collection]):
    def __init__(self, session: AsyncSession):
        super().__init__(Collection, session)

    async def list_active(self) -> list[Collection]:
        stmt = (
            select(Collection)
            .where(Collection.is_active == True)  # noqa: E712
            .order_by(Collection.position)
        )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def get_by_id_or_slug(self, identifier: str) -> Collection | None:
        try:
            val = uuid.UUID(identifier)
            stmt = select(Collection).where(Collection.id == val)
        except Exception:
            stmt = select(Collection).where(Collection.slug == identifier)
        res = await self.session.execute(stmt)
        return res.scalars().first()

