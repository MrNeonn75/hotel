from app.core.errors import NotFoundError
from app.repositories.collection_repo import CollectionRepository
from app.repositories.hotel_repo import HotelRepository
from app.schemas.collection import CollectionResponse
from app.schemas.hotel import HotelListItem
from app.services.hotel_service import serialize_hotel_list_item


class CollectionService:
    def __init__(self, collection_repo: CollectionRepository, hotel_repo: HotelRepository):
        self.collection_repo = collection_repo
        self.hotel_repo = hotel_repo

    async def get_collections(self) -> list[CollectionResponse]:
        cols = await self.collection_repo.list_active()
        return [
            CollectionResponse(
                id=str(c.id),
                slug=c.slug,
                title=c.title,
                subtitle=c.subtitle,
                image=c.image,
                hotel_ids=c.hotel_ids or [],
                hotel_count=c.hotel_count or len(c.hotel_ids or []),
            )
            for c in cols
        ]

    async def get_collection_by_id(self, identifier: str) -> CollectionResponse:
        col = await self.collection_repo.get_by_id_or_slug(identifier)
        if not col:
            raise NotFoundError("Kolleksiya tapılmadı")
        return CollectionResponse(
            id=str(col.id),
            slug=col.slug,
            title=col.title,
            subtitle=col.subtitle,
            image=col.image,
            hotel_ids=col.hotel_ids or [],
            hotel_count=col.hotel_count or len(col.hotel_ids or []),
        )

    async def get_hotels_by_collection(self, identifier: str) -> list[HotelListItem]:
        col = await self.collection_repo.get_by_id_or_slug(identifier)
        if not col or not col.hotel_ids:
            return []

        hotels = await self.hotel_repo.get_by_ids(col.hotel_ids)
        return [serialize_hotel_list_item(h) for h in hotels]

