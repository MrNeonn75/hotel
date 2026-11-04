import uuid

from app.core.errors import NotFoundError
from app.repositories.hotel_repo import HotelRepository
from app.repositories.room_repo import RoomRepository
from app.schemas.room import RoomResponse


class RoomService:
    def __init__(self, room_repo: RoomRepository, hotel_repo: HotelRepository):
        self.room_repo = room_repo
        self.hotel_repo = hotel_repo

    async def get_rooms_by_hotel_id(self, hotel_id: str) -> list[RoomResponse]:
        try:
            val = uuid.UUID(hotel_id)
        except Exception:
            raise NotFoundError("Otel tapılmadı") from None

        hotel = await self.hotel_repo.get_by_id(val)
        if not hotel:
            raise NotFoundError("Otel tapılmadı")

        rooms = await self.room_repo.get_by_hotel_id(val)
        return [
            RoomResponse(
                id=str(r.id),
                hotel_id=str(r.hotel_id),
                name=r.name,
                capacity=r.capacity,
                bed_type=r.bed_type,
                breakfast_policy=r.breakfast_policy,
                price=float(r.price),
                original_price=float(r.original_price) if r.original_price is not None else None,
                image=r.image,
                features=r.features or [],
            )
            for r in rooms
        ]

