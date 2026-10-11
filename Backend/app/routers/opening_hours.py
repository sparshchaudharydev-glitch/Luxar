
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.restaurant import Restaurant
from ..models.opening_hours import OpeningHours
from ..schemas.opening_hours import (
    OpeningHoursCreate,
    OpeningHoursUpdate
)

router = APIRouter()


def get_restaurant_or_404(db: Session, restaurant_id: int):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return restaurant


def hours_dict(hours: OpeningHours):
    return {
        "id": hours.id,
        "restaurant_id": hours.restaurant_id,
        "open_time": str(hours.open_time),
        "close_time": str(hours.close_time),
        "weekly_off": hours.weekly_off
    }


@router.post("/restaurants/{restaurant_id}/opening-hours", status_code=201)
def add_opening_hours(
    restaurant_id: int,
    body: OpeningHoursCreate,
    db: Session = Depends(get_db)
):
    get_restaurant_or_404(db, restaurant_id)

    existing = db.query(OpeningHours).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Opening hours already exist"
        )

    hours = OpeningHours(
        restaurant_id=restaurant_id,
        **body.model_dump()
    )

    db.add(hours)
    db.commit()
    db.refresh(hours)

    return hours_dict(hours)


@router.get("/restaurants/{restaurant_id}/opening-hours")
def get_opening_hours(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    get_restaurant_or_404(db, restaurant_id)

    hours = db.query(OpeningHours).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if hours is None:
        raise HTTPException(status_code=404, detail="Opening hours not found")

    return hours_dict(hours)


@router.put("/restaurants/{restaurant_id}/opening-hours")
def update_opening_hours(
    restaurant_id: int,
    body: OpeningHoursUpdate,
    db: Session = Depends(get_db)
):
    get_restaurant_or_404(db, restaurant_id)

    hours = db.query(OpeningHours).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if hours is None:
        raise HTTPException(status_code=404, detail="Opening hours not found")

    update_data = body.model_dump(exclude_unset=True)

    new_open = update_data.get("open_time", hours.open_time)
    new_close = update_data.get("close_time", hours.close_time)

    if new_open is None or new_close is None:
        raise HTTPException(
            status_code=422,
            detail="Opening and closing times cannot be null"
        )

    if new_open == new_close:
        raise HTTPException(
            status_code=422,
            detail="Opening and closing times cannot be the same"
        )

    for field, value in update_data.items():
        setattr(hours, field, value)

    db.commit()
    db.refresh(hours)

    return hours_dict(hours)


@router.delete("/restaurants/{restaurant_id}/opening-hours")
def delete_opening_hours(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    get_restaurant_or_404(db, restaurant_id)

    hours = db.query(OpeningHours).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if hours is None:
        raise HTTPException(status_code=404, detail="Opening hours not found")

    db.delete(hours)
    db.commit()

    return {"message": "Opening hours deleted successfully"}
