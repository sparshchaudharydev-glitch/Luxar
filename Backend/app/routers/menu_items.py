
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.restaurant import Restaurant
from ..models.menu_item import MenuItem
from ..schemas.menu_item import MenuItemCreate, MenuItemUpdate

router = APIRouter()


def get_restaurant_or_404(db: Session, restaurant_id: int):
    restaurant = db.get(Restaurant, restaurant_id)

    if restaurant is None:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found"
        )

    return restaurant


@router.post("/restaurants/{restaurant_id}/menu", status_code=201)
def add_menu_item(
    restaurant_id: int,
    body: MenuItemCreate,
    db: Session = Depends(get_db)
):
    restaurant = get_restaurant_or_404(db, restaurant_id)

    item = MenuItem(
        restaurant_id=restaurant.id,
        name=body.name,
        category=body.category,
        description=body.description,
        price=body.price,
        image_url=body.image_url
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Menu item added successfully",
        "item_id": item.id,
        "restaurant_id": item.restaurant_id,
        "name": item.name,
        "category": item.category,
        "description": item.description,
        "price": float(item.price),
        "image_url": item.image_url,
        "is_available": item.is_available
    }


@router.get("/restaurants/{restaurant_id}/menu")
def get_menu_items(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    get_restaurant_or_404(db, restaurant_id)

    items = (
        db.query(MenuItem)
        .filter(MenuItem.restaurant_id == restaurant_id)
        .order_by(MenuItem.id)
        .all()
    )

    return [
        {
            "item_id": item.id,
            "restaurant_id": item.restaurant_id,
            "name": item.name,
            "category": item.category,
            "description": item.description,
            "price": float(item.price),
            "image_url": item.image_url,
            "is_available": item.is_available
        }
        for item in items
    ]


@router.put("/menu-items/{item_id}")
def update_menu_item(
    item_id: int,
    body: MenuItemUpdate,
    db: Session = Depends(get_db)
):
    item = db.get(MenuItem, item_id)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    update_data = body.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return {
        "message": "Menu item updated successfully",
        "item_id": item.id,
        "restaurant_id": item.restaurant_id,
        "name": item.name,
        "category": item.category,
        "description": item.description,
        "price": float(item.price),
        "image_url": item.image_url,
        "is_available": item.is_available
    }


@router.delete("/menu-items/{item_id}")
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    item = db.get(MenuItem, item_id)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Menu item deleted successfully",
        "item_id": item_id
    }
