import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
    desc,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.base import BaseMixin
from app.models.enums import BookingStatus, PaymentStatus

if TYPE_CHECKING:
    from app.models.guest import Guest
    from app.models.hotel import Hotel

JSONBType = JSONB().with_variant(JSON(), "sqlite")


class Booking(Base, BaseMixin):
    __tablename__ = "bookings"

    reference: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        index=True,
        nullable=False,
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        nullable=False,
    )
    hotel_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
    )

    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    children: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)

    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_night: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="AZN", nullable=False)

    status: Mapped[BookingStatus] = mapped_column(
        SAEnum(BookingStatus, name="booking_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=BookingStatus.CONFIRMED,
        nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus, name="payment_status", native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=PaymentStatus.UNPAID,
        nullable=False,
    )

    hotel_snapshot: Mapped[dict[str, Any] | None] = mapped_column(JSONBType, nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    guest: Mapped["Guest"] = relationship("Guest", back_populates="bookings")
    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="bookings")

    __table_args__ = (
        Index("ix_bookings_guest_created_at", "guest_id", desc("created_at")),
        Index("ix_bookings_hotel_dates", "hotel_id", "check_in", "check_out"),
        CheckConstraint("check_out > check_in", name="ck_bookings_check_out_after_check_in"),
        CheckConstraint("adults >= 1", name="ck_bookings_adults_min"),
    )
