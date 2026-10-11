
from sqlalchemy import Integer, Time, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base

class OpeningHours(Base):
    __tablename__ = "opening_hours"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        unique=True,
        nullable=False
    )

    open_time: Mapped[object] = mapped_column(
        Time,
        nullable=False
    )

    close_time: Mapped[object] = mapped_column(
        Time,
        nullable=False
    )

    weekly_off: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list
    )
