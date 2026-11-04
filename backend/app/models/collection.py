from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base
from app.models.base import BaseMixin

ArrayTextType = PG_ARRAY(Text).with_variant(JSON(), "sqlite")


class Collection(Base, BaseMixin):
    __tablename__ = "collections"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=False)
    hotel_ids: Mapped[list[str]] = mapped_column(ArrayTextType, default=list, nullable=False)
    hotel_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

