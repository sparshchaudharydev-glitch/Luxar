
from sqlalchemy import (
    Integer, String, Text, Numeric, Boolean, ForeignKey
)
from sqlalchemy import Integer, Time, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class MenuItem(Base):
    __tablename__ = "menu_item"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(20), nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    price: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

