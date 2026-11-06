"""Add HotelTonight fields to hotels table and expand rating scale to 0-10

Revision ID: 0003_hotel_tonight_fields
Revises: 0002_add_user_id_to_guests
Create Date: 2026-11-01 12:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003_hotel_tonight_fields"
down_revision: str | None = "0002_add_user_id_to_guests"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    # 1. Add new columns
    if dialect_name == "sqlite":
        with op.batch_alter_table("hotels") as batch_op:
            batch_op.add_column(sa.Column("star_rating", sa.SmallInteger(), nullable=False, server_default="3"))
            batch_op.add_column(sa.Column("neighborhood", sa.Text(), nullable=False, server_default=""))
            batch_op.add_column(sa.Column("tagline", sa.Text(), nullable=False, server_default=""))
            batch_op.add_column(sa.Column("free_cancellation", sa.Boolean(), nullable=False, server_default=sa.true()))
            batch_op.add_column(sa.Column("deal_label", sa.Text(), nullable=True))
            batch_op.alter_column("rating", type_=sa.Numeric(precision=3, scale=1), server_default="8.5")
    else:
        op.add_column("hotels", sa.Column("star_rating", sa.SmallInteger(), nullable=False, server_default="3"))
        op.add_column("hotels", sa.Column("neighborhood", sa.Text(), nullable=False, server_default=""))
        op.add_column("hotels", sa.Column("tagline", sa.Text(), nullable=False, server_default=""))
        op.add_column("hotels", sa.Column("free_cancellation", sa.Boolean(), nullable=False, server_default=sa.true()))
        op.add_column("hotels", sa.Column("deal_label", sa.Text(), nullable=True))

        # Check constraint for star_rating (1-5)
        op.create_check_constraint(
            "ck_hotels_star_rating_range",
            "hotels",
            "star_rating >= 1 AND star_rating <= 5",
        )

        # Drop old rating check constraint (0-5)
        op.drop_constraint("ck_hotels_rating_range", "hotels", type_="check")

        # Alter rating column type to Numeric(3, 1)
        op.alter_column(
            "hotels",
            "rating",
            type_=sa.Numeric(precision=3, scale=1),
            server_default="8.5",
        )

    # 2. Rescale existing ratings <= 5.0 to 10-point scale (* 2)
    # Idempotent: only updates rows where rating <= 5.0
    op.execute("UPDATE hotels SET rating = rating * 2 WHERE rating <= 5.0")

    # 3. Add new check constraint (0-10) for postgres
    if dialect_name != "sqlite":
        op.create_check_constraint(
            "ck_hotels_rating_range",
            "hotels",
            "rating >= 0 AND rating <= 10",
        )


def downgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name != "sqlite":
        # Drop new rating check constraint (0-10)
        op.drop_constraint("ck_hotels_rating_range", "hotels", type_="check")

    # Rescale ratings back to 5-point scale (/ 2) for ratings > 5.0
    op.execute("UPDATE hotels SET rating = rating / 2 WHERE rating > 5.0")

    if dialect_name == "sqlite":
        with op.batch_alter_table("hotels") as batch_op:
            batch_op.drop_column("deal_label")
            batch_op.drop_column("free_cancellation")
            batch_op.drop_column("tagline")
            batch_op.drop_column("neighborhood")
            batch_op.drop_column("star_rating")
            batch_op.alter_column("rating", type_=sa.Numeric(precision=2, scale=1), server_default="5.0")
    else:
        # Revert rating column type
        op.alter_column(
            "hotels",
            "rating",
            type_=sa.Numeric(precision=2, scale=1),
            server_default="5.0",
        )

        # Restore original check constraints
        op.create_check_constraint(
            "ck_hotels_rating_range",
            "hotels",
            "rating >= 0 AND rating <= 5",
        )
        op.drop_constraint("ck_hotels_star_rating_range", "hotels", type_="check")

        # Drop new columns
        op.drop_column("hotels", "deal_label")
        op.drop_column("hotels", "free_cancellation")
        op.drop_column("hotels", "tagline")
        op.drop_column("hotels", "neighborhood")
        op.drop_column("hotels", "star_rating")
