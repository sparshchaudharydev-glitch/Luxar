from pydantic import BaseModel, ConfigDict


class RestaurantPhotoResponse(BaseModel):
    id: int
    restaurant_id: int
    photo_url: str
    category: str

    model_config = ConfigDict(from_attributes=True)