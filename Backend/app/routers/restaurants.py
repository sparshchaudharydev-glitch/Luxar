import copy

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import FRONTEND_BASE_URL
from ..database import get_db
from ..models.admin import Admin
from ..models.restaurant import Restaurant
from ..models.restaurant_photos import RestaurantPhoto
from ..routers.auth import get_current_admin
from ..schemas.restaurant import RestaurantCreate, RestaurantUpdate
from ..services.cloudinary_service import destroy_image
from ..services.qr_service import generate_restaurant_qr
from ..services.restaurant_service import (
    DEFAULT_DETAILS,
    apply_update,
    get_or_404,
    owned_or_404,
    restaurant_view,
)

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


# Public list, used by the customer QR screen.
@router.get("/")
def list_restaurants(db: Session = Depends(get_db)):
    rows = db.scalars(select(Restaurant).order_by(Restaurant.id)).all()
    return {str(r.id): restaurant_view(r) for r in rows}


# Owner dashboard: only this admin's restaurants.
# Defined before /{restaurant_id} so "mine" isn't read as an ID.
@router.get("/mine")
def list_my_restaurants(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    rows = db.scalars(
        select(Restaurant).where(Restaurant.owner_id == admin.id).order_by(Restaurant.id)
    ).all()
    return {str(r.id): restaurant_view(r) for r in rows}


# Public, so the QR page can show a restaurant without signing in.
@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    return restaurant_view(get_or_404(db, restaurant_id))


@router.post("/", status_code=201)
def add_restaurant(
    body: RestaurantCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    restaurant = Restaurant(
        name=body.name,
        location=body.location,
        owner_id=admin.id,
        details=copy.deepcopy(DEFAULT_DETAILS),
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return {"message": "Restaurant created successfully", "restaurant_id": restaurant.id}


@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    body: RestaurantUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    restaurant = owned_or_404(db, restaurant_id, admin)
    apply_update(restaurant, body.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(restaurant)

    return {"message": "Restaurant updated successfully", "restaurant_id": restaurant.id}


@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    restaurant = owned_or_404(db, restaurant_id, admin)
    public_ids = db.scalars(
        select(RestaurantPhoto.public_id).where(RestaurantPhoto.restaurant_id == restaurant.id)
    ).all()

    db.delete(restaurant)  # Photo records are removed by the database cascade.
    db.commit()

    for public_id in public_ids:
        destroy_image(public_id)

    return {"message": "Restaurant deleted successfully", "restaurant_id": restaurant_id}


# Example: /restaurants/1/qr. Public, so anyone who scans can open the page.
@router.get("/{restaurant_id}/qr")
def get_restaurant_qr(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = get_or_404(db, restaurant_id)
    restaurant_url = f"{FRONTEND_BASE_URL}/#/r/{restaurant.id}"

    return StreamingResponse(
        generate_restaurant_qr(restaurant_url),
        media_type="image/png",
        headers={
            "Content-Disposition": f'inline; filename="luxar-restaurant-{restaurant.id}-qr.png"'
        },
    )