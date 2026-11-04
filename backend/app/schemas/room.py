from app.schemas.base import CamelModel


class RoomResponse(CamelModel):
    id: str
    hotel_id: str
    name: str
    capacity: int = 2
    bed_type: str = "1 İki nəfərlik çarpayı"
    breakfast_policy: str = "Səhər yeməyi daxildir"
    price: float
    original_price: float | None = None
    image: str = ""
    features: list[str] = []

