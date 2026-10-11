
from typing import Annotated, Optional
from pydantic import BaseModel, Field


class RestaurantCreate(BaseModel):
    name: Annotated[str, Field(..., min_length=1)]
    location: Annotated[str, Field(..., min_length=1)]


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
