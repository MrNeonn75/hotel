import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.room import Room
from app.repositories.base import BaseRepository


class RoomRepository(BaseRepository[Room]):
    def __init__(self, session: AsyncSession):
        super().__init__(Room, session)

    async def get_by_hotel_id(self, hotel_id: uuid.UUID) -> list[Room]:
        stmt = (
            select(Room)
            .where(Room.hotel_id == hotel_id, Room.is_active == True)  # noqa: E712
            .order_by(Room.price)
        )
        res = await self.session.execute(stmt)
        return list(res.scalars().all())

