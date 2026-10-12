from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class RestaurantContact(Base):
    __tablename__ = "restaurant_contacts"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        unique=True,
        nullable=False
    )

    phone_number: Mapped[str] = mapped_column(
        String(20), nullable=False
    )

    whatsapp_number: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    instagram_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    