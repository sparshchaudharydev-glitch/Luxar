from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.restaurant import Restaurant
from ..models.restaurant_contacts import RestaurantContact
from ..schemas.restaurant_contacts import (
    RestaurantContactCreate,
    RestaurantContactUpdate,
)


router = APIRouter()


@router.post(
    "/restaurants/{restaurant_id}/contact",
    status_code=201,
    summary="Add Contact Details"
)
def create_contact(
    restaurant_id: int,
    data: RestaurantContactCreate,
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    existing = db.query(RestaurantContact).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if existing:
        raise HTTPException(409, "Contact details already exist")

    contact = RestaurantContact(
        restaurant_id=restaurant_id,
        **data.model_dump()
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


@router.get(
    "/restaurants/{restaurant_id}/contact",
    summary="Get Contact Details"
)
def get_contact(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    contact = db.query(RestaurantContact).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if contact is None:
        raise HTTPException(404, "Contact details not found")

    return contact


@router.put(
    "/restaurants/{restaurant_id}/contact",
    summary="Update Contact Details"
)
def update_contact(
    restaurant_id: int,
    data: RestaurantContactUpdate,
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    contact = db.query(RestaurantContact).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if contact is None:
        raise HTTPException(404, "Contact details not found")

    updates = data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(400, "Provide at least one field to update")

    for field, value in updates.items():
        setattr(contact, field, value)

    if not contact.phone_number or not contact.phone_number.strip():
        raise HTTPException(422, "Phone number is required")

    db.commit()
    db.refresh(contact)

    return contact


@router.delete(
    "/restaurants/{restaurant_id}/contact",
    summary="Delete Contact Details"
)
def delete_contact(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(404, "Restaurant not found")

    contact = db.query(RestaurantContact).filter_by(
        restaurant_id=restaurant_id
    ).first()

    if contact is None:
        raise HTTPException(404, "Contact details not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact details deleted successfully"}

