
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.restaurant import Restaurant
from ..schemas.restaurant import RestaurantCreate, RestaurantUpdate
from ..routers.auth import get_current_admin
from ..models.admin import Admin


import os  # Reads environment variables, such as the frontend URL

from fastapi import HTTPException  # Creates HTTP error responses (if needed)
from fastapi.responses import StreamingResponse  # Sends the QR image as a response

from ..services.qr_service import generate_restaurant_qr  # Generates the restaurant QR code


router = APIRouter()


def get_or_404(db: Session, restaurant_id: int):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    return restaurant


def to_dict(restaurant: Restaurant):
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "location": restaurant.location
    }


@router.get("/")
def list_restaurants(db: Session = Depends(get_db)):
    rows = db.query(Restaurant).order_by(Restaurant.id).all()
    return {str(r.id): to_dict(r) for r in rows}


@router.get("/{restaurant_id}")
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    return to_dict(get_or_404(db, restaurant_id))



@router.post("/", status_code=201)
def add_restaurant(
    body: RestaurantCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    restaurant = Restaurant(
        name=body.name,
        location=body.location
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    return {
        "message": "Restaurant created successfully",
        "restaurant_id": restaurant.id
    }


@router.put("/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    body: RestaurantUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    restaurant = get_or_404(db, restaurant_id)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    return {
        "message": "Restaurant updated successfully",
        "restaurant_id": restaurant.id
    }


@router.delete("/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    restaurant = get_or_404(db, restaurant_id)

    db.delete(restaurant)
    db.commit()

    return {
        "message": "Restaurant deleted successfully",
        "restaurant_id": restaurant_id
    }



@router.get("/{restaurant_id}/qr")
# Creates a GET API endpoint to generate a QR code for a specific restaurant.
# Example: /restaurants/1/qr

def get_restaurant_qr(
    restaurant_id: int,  # Receives the restaurant ID from the URL.
    db: Session = Depends(get_db),  # Gets a database session using dependency injection.
):
    # Checks whether the restaurant exists in the database.
    # If it doesn't exist, get_or_404() raises a 404 error.
    restaurant = get_or_404(db, restaurant_id)

    # Reads the frontend's base URL from the environment variables.
    # Uses localhost port 5500 as the default during local development.
    frontend_url = os.getenv(
        "FRONTEND_BASE_URL",
        "http://127.0.0.1:5173",
    ).rstrip("/") # Removes trailing slashes to avoid duplicate slashes in the URL.
    restaurant_url = f"{frontend_url}/#/r/{restaurant.id}"

    # Generates a QR code containing the restaurant's public page URL.
    # The function returns the QR image as an in-memory PNG file.
    qr_image = generate_restaurant_qr(restaurant_url)

    # Sends the QR image back to the browser as a PNG response.
    return StreamingResponse(
        qr_image,
        media_type="image/png",  # Tells the browser that the response is a PNG image.
        headers={
            # Suggests a filename if the user saves the QR image.
            # "inline" allows the browser to display it directly.
            "Content-Disposition": (
                f'inline; filename="luxar-restaurant-{restaurant.id}-qr.png"'
            )
        },
    )

