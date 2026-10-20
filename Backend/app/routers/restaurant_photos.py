import os

import cloudinary.uploader
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, PHOTO_CATEGORIES
from ..database import get_db
from ..models.admin import Admin
from ..models.restaurant import Restaurant
from ..models.restaurant_photos import RestaurantPhoto
from ..routers.auth import get_current_admin
from ..schemas.restaurant_photos import RestaurantPhotoResponse
from ..services.cloudinary_service import destroy_image
from ..services.restaurant_service import get_or_404, owned_or_404

router = APIRouter(tags=["Restaurant Photos"])


@router.get("/restaurants/{restaurant_id}/photos", response_model=list[RestaurantPhotoResponse])
def list_photos(restaurant_id: int, db: Session = Depends(get_db)):
    get_or_404(db, restaurant_id)
    return db.scalars(
        select(RestaurantPhoto)
        .where(RestaurantPhoto.restaurant_id == restaurant_id)
        .order_by(RestaurantPhoto.id)
    ).all()


# A plain "def" route, so the blocking Cloudinary upload runs in a worker thread.
@router.post(
    "/restaurants/{restaurant_id}/photos",
    status_code=201,
    response_model=RestaurantPhotoResponse,
)
def upload_photo(
    restaurant_id: int,
    category: str = Form(...),
    photo: UploadFile = File(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    category = category.strip().lower()
    if category not in PHOTO_CATEGORIES:
        raise HTTPException(status_code=400, detail="Category must be main, interior, exterior, or food")

    restaurant = owned_or_404(db, restaurant_id, admin)

    if photo.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are allowed")

    photo.file.seek(0, os.SEEK_END)
    size = photo.file.tell()
    photo.file.seek(0)
    if size == 0:
        raise HTTPException(status_code=400, detail="Image is empty")
    if size > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")

    # A new cover photo replaces the old one.
    old_records = []
    if category == "main":
        old_records = db.scalars(
            select(RestaurantPhoto).where(
                RestaurantPhoto.restaurant_id == restaurant.id,
                RestaurantPhoto.category == "main",
            )
        ).all()
    old_public_ids = [r.public_id for r in old_records]

    try:
        result = cloudinary.uploader.upload(
            photo.file,
            folder=f"luxar/restaurants/{restaurant.id}",
            resource_type="image",
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Image upload failed. Check Cloudinary configuration.",
        )

    try:
        for record in old_records:
            db.delete(record)
        new_photo = RestaurantPhoto(
            restaurant_id=restaurant.id,
            photo_url=result["secure_url"],
            public_id=result["public_id"],
            category=category,
        )
        db.add(new_photo)
        db.commit()
        db.refresh(new_photo)
    except Exception:
        db.rollback()
        destroy_image(result["public_id"])
        raise HTTPException(status_code=500, detail="Could not save the photo")

    for public_id in old_public_ids:
        destroy_image(public_id)

    return new_photo


@router.delete("/photos/{photo_id}")
def delete_photo(
    photo_id: int,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    photo = db.get(RestaurantPhoto, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    owner = db.get(Restaurant, photo.restaurant_id)
    if owner is None or owner.owner_id != admin.id:
        raise HTTPException(status_code=404, detail="Photo not found")

    public_id = photo.public_id
    try:
        db.delete(photo)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not delete the photo record")

    destroy_image(public_id)
    return {"message": "Photo deleted successfully"}