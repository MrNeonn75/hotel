import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Table,
    Text,
    Uuid,
)
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.base import BaseMixin

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.favorite import Favorite

# Postgres üçün ARRAY(Text), SQLite / digər mühitlər üçün JSON fallback
ArrayTextType = PG_ARRAY(Text).with_variant(JSON(), "sqlite")

# Many-to-many: hotel_amenities
hotel_amenities = Table(
    "hotel_amenities",
    Base.metadata,
    Column(
        "hotel_id",
        Uuid(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "amenity_id",
        Uuid(as_uuid=True),
        ForeignKey("amenities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Amenity(Base, BaseMixin):
    __tablename__ = "amenities"

    key: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    label_az: Mapped[str] = mapped_column(String(100), nullable=False)

    hotels: Mapped[list["Hotel"]] = relationship(
        "Hotel",
        secondary=hotel_amenities,
        back_populates="amenities",
    )


class Hotel(Base, BaseMixin):
    __tablename__ = "hotels"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="Bakı")
    address: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    standard_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discounted_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="AZN", nullable=False)

    rating: Mapped[Decimal] = mapped_column(Numeric(2, 1), default=Decimal("5.0"), nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    check_in_time: Mapped[str] = mapped_column(String(20), default="14:00", nullable=False)
    check_out_time: Mapped[str] = mapped_column(String(20), default="12:00", nullable=False)
    rooms_total: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    advantages: Mapped[list[str]] = mapped_column(ArrayTextType, default=list, nullable=False)
    rules: Mapped[list[str]] = mapped_column(ArrayTextType, default=list, nullable=False)
    important_info: Mapped[list[str]] = mapped_column(ArrayTextType, default=list, nullable=False)

    images: Mapped[list["HotelImage"]] = relationship(
        "HotelImage",
        back_populates="hotel",
        cascade="all, delete-orphan",
        order_by="HotelImage.position",
        lazy="selectin",
    )
    amenities: Mapped[list["Amenity"]] = relationship(
        "Amenity",
        secondary=hotel_amenities,
        back_populates="hotels",
        lazy="selectin",
    )
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="hotel", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="hotel", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_hotels_city_is_active", "city", "is_active"),
        Index("ix_hotels_discounted_price", "discounted_price"),
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_hotels_rating_range"),
        CheckConstraint("discounted_price <= standard_price", name="ck_hotels_discount_price_valid"),
    )


class HotelImage(Base, BaseMixin):
    __tablename__ = "hotel_images"

    hotel_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    url: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="images")
