from typing import Optional

from pydantic import BaseModel, Field


class FacilityIn(BaseModel):
    label: str = Field(..., min_length=1)
    available: bool = True


class RestaurantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=300)


# Every field is optional. The frontend sends only the fields for the section being saved.
class RestaurantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=300)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    opening: Optional[str] = None
    closing: Optional[str] = None
    weekly_off: Optional[str] = None
    veg_dishes: Optional[int] = Field(None, ge=0)
    non_veg_dishes: Optional[int] = Field(None, ge=0)
    shakes: Optional[int] = Field(None, ge=0)
    facilities: Optional[list[FacilityIn]] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    review_count: Optional[int] = Field(None, ge=0)
    luxar_partner: Optional[bool] = None