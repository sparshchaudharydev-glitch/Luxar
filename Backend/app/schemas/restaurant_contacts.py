from pydantic import BaseModel, Field


class RestaurantContactCreate(BaseModel):
    phone_number: str = Field(..., min_length=5, max_length=20)
    whatsapp_number: str | None = Field(default=None, max_length=20)
    instagram_id: str | None = Field(default=None, max_length=100)


class RestaurantContactUpdate(BaseModel):
    phone_number: str | None = Field(default=None, max_length=20)
    whatsapp_number: str | None = Field(default=None, max_length=20)
    instagram_id: str | None = Field(default=None, max_length=100)