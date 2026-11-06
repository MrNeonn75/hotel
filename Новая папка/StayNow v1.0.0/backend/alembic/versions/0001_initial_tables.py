"""Initial tables: hotels, hotel_images, amenities, hotel_amenities, guests, guest_profiles, favorites, bookings

Revision ID: 0001_initial_tables
Revises:
Create Date: 2026-10-12 12:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001_initial_tables"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Hotels table
    op.create_table(
        "hotels",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False, server_default="Bakı"),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("standard_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("discounted_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("discount_percent", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="AZN"),
        sa.Column("rating", sa.Numeric(precision=2, scale=1), nullable=False, server_default="5.0"),
        sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("check_in_time", sa.String(length=20), nullable=False, server_default="14:00"),
        sa.Column("check_out_time", sa.String(length=20), nullable=False, server_default="12:00"),
        sa.Column("rooms_total", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "advantages",
            postgresql.ARRAY(sa.Text()).with_variant(sa.JSON(), "sqlite"),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "rules",
            postgresql.ARRAY(sa.Text()).with_variant(sa.JSON(), "sqlite"),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "important_info",
            postgresql.ARRAY(sa.Text()).with_variant(sa.JSON(), "sqlite"),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("rating >= 0 AND rating <= 5", name="ck_hotels_rating_range"),
        sa.CheckConstraint("discounted_price <= standard_price", name="ck_hotels_discount_price_valid"),
    )
    op.create_index("ix_hotels_city_is_active", "hotels", ["city", "is_active"])
    op.create_index("ix_hotels_discounted_price", "hotels", ["discounted_price"])

    # 2. Hotel images
    op.create_table(
        "hotel_images",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("hotel_id", sa.Uuid(as_uuid=True), sa.ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_hotel_images_hotel_id", "hotel_images", ["hotel_id"])

    # 3. Amenities
    op.create_table(
        "amenities",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("label_az", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_amenities_key", "amenities", ["key"], unique=True)

    # 4. hotel_amenities junction
    op.create_table(
        "hotel_amenities",
        sa.Column("hotel_id", sa.Uuid(as_uuid=True), sa.ForeignKey("hotels.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("amenity_id", sa.Uuid(as_uuid=True), sa.ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
    )

    # 5. Guests table
    op.create_table(
        "guests",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("device_id", sa.String(length=64), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_guests_device_id", "guests", ["device_id"], unique=True)

    # 6. Guest profiles table
    op.create_table(
        "guest_profiles",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("guest_id", sa.Uuid(as_uuid=True), sa.ForeignKey("guests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("last_name", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("phone", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("email", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("birth_date", sa.String(length=30), nullable=True),
        sa.Column("nationality", sa.String(length=100), nullable=False, server_default="Azərbaycan"),
        sa.Column("document_number_encrypted", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False, server_default="Bakı"),
        sa.Column("address", sa.Text(), nullable=False, server_default=""),
        sa.Column("preferred_language", sa.String(length=10), nullable=False, server_default="AZ"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_guest_profiles_guest_id", "guest_profiles", ["guest_id"], unique=True)

    # 7. Favorites table
    op.create_table(
        "favorites",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("guest_id", sa.Uuid(as_uuid=True), sa.ForeignKey("guests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hotel_id", sa.Uuid(as_uuid=True), sa.ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("guest_id", "hotel_id", name="uq_favorites_guest_hotel"),
    )
    op.create_index("ix_favorites_guest_id", "favorites", ["guest_id"])
    op.create_index("ix_favorites_hotel_id", "favorites", ["hotel_id"])

    # 8. Bookings table
    op.create_table(
        "bookings",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("reference", sa.String(length=32), nullable=False),
        sa.Column("guest_id", sa.Uuid(as_uuid=True), sa.ForeignKey("guests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hotel_id", sa.Uuid(as_uuid=True), sa.ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False),
        sa.Column("check_in", sa.Date(), nullable=False),
        sa.Column("check_out", sa.Date(), nullable=False),
        sa.Column("adults", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("children", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("special_requests", sa.Text(), nullable=True),
        sa.Column("nights", sa.Integer(), nullable=False),
        sa.Column("price_per_night", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(precision=10, scale=2), nullable=False, server_default="0.00"),
        sa.Column("total_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="AZN"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="confirmed"),
        sa.Column("payment_status", sa.String(length=30), nullable=False, server_default="unpaid"),
        sa.Column("hotel_snapshot", postgresql.JSONB().with_variant(sa.JSON(), "sqlite"), nullable=True),
        sa.Column("idempotency_key", sa.String(length=128), nullable=True),
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("check_out > check_in", name="ck_bookings_check_out_after_check_in"),
        sa.CheckConstraint("adults >= 1", name="ck_bookings_adults_min"),
    )
    op.create_index("ix_bookings_reference", "bookings", ["reference"], unique=True)
    op.create_index("ix_bookings_idempotency_key", "bookings", ["idempotency_key"], unique=True)
    op.create_index("ix_bookings_guest_created_at", "bookings", ["guest_id", sa.text("created_at DESC")])
    op.create_index("ix_bookings_hotel_dates", "bookings", ["hotel_id", "check_in", "check_out"])


def downgrade() -> None:
    op.drop_table("bookings")
    op.drop_table("favorites")
    op.drop_table("guest_profiles")
    op.drop_table("guests")
    op.drop_table("hotel_amenities")
    op.drop_table("amenities")
    op.drop_table("hotel_images")
    op.drop_table("hotels")
