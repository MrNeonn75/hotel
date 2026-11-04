import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import BaseMixin

if TYPE_CHECKING:
    from app.models.hotel import Hotel
    from app.models.user import User


class Review(Base, BaseMixin):
    __tablename__ = "reviews"

    hotel_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    user_avatar: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_country: Mapped[str] = mapped_column(String(100), default="Azərbaycan", nullable=False)
    rating: Mapped[Decimal] = mapped_column(Numeric(2, 1), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    room_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="reviews")
    user: Mapped["User | None"] = relationship("User", back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating >= 1.0 AND rating <= 5.0", name="ck_reviews_rating_range"),
    )

