
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.restaurant import Restaurant
from ..schemas.restaurant import RestaurantCreate, RestaurantUpdate

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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
):
    restaurant = get_or_404(db, restaurant_id)

    # If related records exist, configure appropriate database
    # cascade behavior before deleting the restaurant.
    db.delete(restaurant)
    db.commit()

    return {
        "message": "Restaurant deleted successfully",
        "restaurant_id": restaurant_id
    }
