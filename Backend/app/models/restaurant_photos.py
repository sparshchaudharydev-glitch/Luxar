from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from ..database import Base


class RestaurantPhoto(Base):
    __tablename__ = "restaurant_photos"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        nullable=False,
        index=True
    )

    photo_url: Mapped[str] = mapped_column(
        String(1000), nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(50), nullable=False
    )