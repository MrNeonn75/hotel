import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.base import BaseMixin

if TYPE_CHECKING:
    from app.models.hotel import Hotel

ArrayTextType = PG_ARRAY(Text).with_variant(JSON(), "sqlite")


class Room(Base, BaseMixin):
    __tablename__ = "rooms"

    hotel_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    bed_type: Mapped[str] = mapped_column(String(100), default="1 İki nəfərlik çarpayı", nullable=False)
    breakfast_policy: Mapped[str] = mapped_column(String(100), default="Səhər yeməyi daxildir", nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    image: Mapped[str] = mapped_column(Text, default="", nullable=False)
    features: Mapped[list[str]] = mapped_column(ArrayTextType, default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="rooms")

