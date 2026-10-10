from typing import Annotated, Optional

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models.restaurant import Restaurant

# Creates the restaurants table in Neon if it doesn't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI()


class RestaurantCreate(BaseModel):
    name: Annotated[str, Field(..., min_length=1)]
    location: Annotated[str, Field(..., min_length=1)]


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None


def to_dict(r: Restaurant) -> dict:
    return {"name": r.name, "location": r.location}


def get_or_404(db: Session, restaurant_id: int) -> Restaurant:
    r = db.get(Restaurant, restaurant_id)
    if r is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return r


@app.get("/")
def root():
    return {"message": "Restaurant API is running"}


# Same shape as before: { "1": {...}, "2": {...} }
@app.get("/restaurants")
def list_restaurants(db: Session = Depends(get_db)):
    rows = db.query(Restaurant).order_by(Restaurant.id).all()
    return {str(r.id): to_dict(r) for r in rows}


@app.get("/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    return to_dict(get_or_404(db, restaurant_id))


@app.post("/restaurants", status_code=201)
def add_restaurant(body: RestaurantCreate, db: Session = Depends(get_db)):
    r = Restaurant(name=body.name, location=body.location)
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"message": "Restaurant created successfully", "restaurant_id": str(r.id)}


@app.put("/restaurants/{restaurant_id}")
def update_restaurant(restaurant_id: int, body: RestaurantUpdate, db: Session = Depends(get_db)):
    r = get_or_404(db, restaurant_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(r, field, value)
    db.commit()
    return {"message": "Restaurant updated successfully", "restaurant_id": str(r.id)}


@app.delete("/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    r = get_or_404(db, restaurant_id)
    db.delete(r)
    db.commit()
    return {"message": "Restaurant deleted successfully", "restaurant_id": str(restaurant_id)}