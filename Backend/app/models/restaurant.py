from typing import Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(300))
    owner_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("admins.id", ondelete="CASCADE"), nullable=True, index=True
    )
    # Contact, timing, menu counts, facilities, reviews, map pin, and LUXAR partner status.
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)