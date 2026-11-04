from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import BaseMixin

if TYPE_CHECKING:
    from app.models.review import Review


class User(Base, BaseMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    phone: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    avatar: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    reviews: Mapped[list["Review"]] = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
    )

