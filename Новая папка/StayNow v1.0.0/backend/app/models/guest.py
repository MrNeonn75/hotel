import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import BaseMixin, utc_now

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.favorite import Favorite


class Guest(Base, BaseMixin):
    __tablename__ = "guests"

    device_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
        index=True,
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    profile: Mapped["GuestProfile | None"] = relationship(
        "GuestProfile",
        back_populates="guest",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    favorites: Mapped[list["Favorite"]] = relationship(
        "Favorite",
        back_populates="guest",
        cascade="all, delete-orphan",
    )
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        back_populates="guest",
    )


class GuestProfile(Base, BaseMixin):
    __tablename__ = "guest_profiles"

    guest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    email: Mapped[str] = mapped_column(String(255), default="", nullable=False)

    birth_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    nationality: Mapped[str] = mapped_column(String(100), default="Azərbaycan", nullable=False)
    document_number_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)

    city: Mapped[str] = mapped_column(String(100), default="Bakı", nullable=False)
    address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(10), default="az", nullable=False)

    guest: Mapped["Guest"] = relationship("Guest", back_populates="profile")
