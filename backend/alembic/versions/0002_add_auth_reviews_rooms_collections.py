"""Add users, rooms, reviews, collections tables

Revision ID: 0002_add_auth_reviews_rooms_collections
Revises: 0001_initial_tables
Create Date: 2026-11-04 19:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_add_auth_reviews_rooms_collections"
down_revision: str | None = "0001_initial_tables"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("last_name", sa.String(length=100), nullable=False, server_default=""),
        sa.Column("phone", sa.String(length=50), nullable=False, server_default=""),
        sa.Column("avatar", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # 2. Rooms table
    op.create_table(
        "rooms",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("hotel_id", sa.Uuid(as_uuid=True), sa.ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False, server_default="2"),
        sa.Column("bed_type", sa.String(length=100), nullable=False, server_default="1 İki nəfərlik çarpayı"),
        sa.Column("breakfast_policy", sa.String(length=100), nullable=False, server_default="Səhər yeməyi daxildir"),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("original_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("image", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "features",
            postgresql.ARRAY(sa.Text()).with_variant(sa.JSON(), "sqlite"),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_rooms_hotel_id", "rooms", ["hotel_id"])

    # 3. Reviews table
    op.create_table(
        "reviews",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("hotel_id", sa.Uuid(as_uuid=True), sa.ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_name", sa.String(length=100), nullable=False),
        sa.Column("user_avatar", sa.Text(), nullable=True),
        sa.Column("user_country", sa.String(length=100), nullable=False, server_default="Azərbaycan"),
        sa.Column("rating", sa.Numeric(precision=2, scale=1), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("room_type", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("rating >= 1.0 AND rating <= 5.0", name="ck_reviews_rating_range"),
    )
    op.create_index("ix_reviews_hotel_id", "reviews", ["hotel_id"])
    op.create_index("ix_reviews_user_id", "reviews", ["user_id"])

    # 4. Collections table
    op.create_table(
        "collections",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("subtitle", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("image", sa.Text(), nullable=False),
        sa.Column(
            "hotel_ids",
            postgresql.ARRAY(sa.Text()).with_variant(sa.JSON(), "sqlite"),
            nullable=False,
            server_default="{}",
        ),
        sa.Column("hotel_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_collections_slug", "collections", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_table("collections")
    op.drop_table("reviews")
    op.drop_table("rooms")
    op.drop_table("users")

