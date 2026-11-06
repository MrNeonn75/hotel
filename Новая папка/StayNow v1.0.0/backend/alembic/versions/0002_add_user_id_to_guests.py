"""Add user_id to guests table

Revision ID: 0002_add_user_id_to_guests
Revises: 0001_initial_tables
Create Date: 2026-10-14 14:50:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_add_user_id_to_guests"
down_revision: str | None = "0001_initial_tables"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("guests", sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=True))
    op.create_index("ix_guests_user_id", "guests", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_guests_user_id", table_name="guests")
    op.drop_column("guests", "user_id")

