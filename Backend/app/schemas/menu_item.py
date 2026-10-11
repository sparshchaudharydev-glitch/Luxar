from typing import Annotated, Literal, Optional
from pydantic import BaseModel, Field


class MenuItemCreate(BaseModel):
    name: Annotated[str, Field(..., min_length=1)]
    category: Literal["veg", "non_veg", "shake"]
    description: Optional[str] = None
    price: Annotated[float, Field(..., gt=0)]
    image_url: Optional[str] = None


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    category: Optional[Literal["veg", "non_veg", "shake"]] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None