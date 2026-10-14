from pydantic import BaseModel, Field


class RestaurantPhotoCreate(BaseModel):
    photo_url: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(..., min_length=1, max_length=50)