
import cloudinary
import cloudinary.uploader

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.restaurant import Restaurant
from ..models.restaurant_photos import RestaurantPhoto

from os import getenv
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

cloudinary.config(
    cloud_name=getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=getenv("CLOUDINARY_API_KEY"),
    api_secret=getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


@router.post("/restaurants/{restaurant_id}/photos", status_code=201)
async def upload_restaurant_photo(
    restaurant_id: int,
    category: str = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Check that the restaurant exists
    restaurant = db.get(Restaurant, restaurant_id)

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Accept image files only
    if not photo.content_type or not photo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image")

    # Upload image to Cloudinary
    try:
        result = cloudinary.uploader.upload(
            photo.file,
            folder=f"luxar/restaurants/{restaurant_id}",
            resource_type="image",
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Image upload failed. Check Cloudinary configuration.",
        )

    # Save the returned image URL in PostgreSQL
    new_photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        photo_url=result["secure_url"],
        category=category,
    )

    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    return new_photo


@router.get("/restaurants/{restaurant_id}/photos")
def get_restaurant_photos(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, restaurant_id)

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return (
        db.query(RestaurantPhoto)
        .filter(RestaurantPhoto.restaurant_id == restaurant_id)
        .all()
    )


@router.delete("/photos/{photo_id}")
def delete_restaurant_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    photo = db.get(RestaurantPhoto, photo_id)

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Delete the database record.
    # Cloudinary file deletion can be added using its public_id.
    db.delete(photo)
    db.commit()

    return {"message": "Photo deleted successfully"}
