import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import BaseMixin

if TYPE_CHECKING:
    from app.models.guest import Guest
    from app.models.hotel import Hotel


class Favorite(Base, BaseMixin):
    __tablename__ = "favorites"

    guest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        nullable=False,
    )
    hotel_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    guest: Mapped["Guest"] = relationship("Guest", back_populates="favorites")
    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="favorites")

    __table_args__ = (
        Index("ix_favorites_guest_id", "guest_id"),
        UniqueConstraint("guest_id", "hotel_id", name="uq_favorites_guest_hotel"),
    )
