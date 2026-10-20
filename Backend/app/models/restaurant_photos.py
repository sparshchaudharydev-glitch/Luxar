from typing import Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class RestaurantPhoto(Base):
    __tablename__ = "restaurant_photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Full Cloudinary URL of the image
    photo_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    # Cloudinary ID, used to delete the image
    public_id: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    # Allowed values: main, interior, exterior, food
    category: Mapped[str] = mapped_column(String(50), nullable=False)