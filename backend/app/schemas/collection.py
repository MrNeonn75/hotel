from app.schemas.base import CamelModel


class CollectionResponse(CamelModel):
    id: str
    slug: str | None = None
    title: str
    subtitle: str
    image: str
    hotel_ids: list[str]
    hotel_count: int

