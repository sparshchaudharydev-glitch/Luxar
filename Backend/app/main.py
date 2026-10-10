# main.py - Restaurant API (complete)

import json
from typing import Annotated, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI()

DATA_FILE = "dataRestaurant.json"


# ---------- Models ----------

class RestaurantCreate(BaseModel):
    name: Annotated[str, Field(..., description="e.g. The Spice House")]
    location: Annotated[str, Field(..., description="e.g. Connaught Place, Delhi")]


class RestaurantUpdate(BaseModel):
    name: Annotated[Optional[str], Field(default=None)]
    location: Annotated[Optional[str], Field(default=None)]


# ---------- Helpers ----------

def load_data() -> dict:
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}  # first run: no file yet


def save_data(data: dict) -> None:
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ---------- Routes ----------

@app.get("/")
def root():
    return {"message": "Restaurant API is running"}


# List all restaurants
@app.get("/restaurants")
def list_restaurants():
    return load_data()


# Get one restaurant
@app.get("/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: str):
    data = load_data()

    if restaurant_id not in data:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return data[restaurant_id]


# Add a restaurant
@app.post("/restaurants", status_code=201)
def add_restaurant(restaurant: RestaurantCreate):
    data = load_data()

    # Generate a new ID (server-side)
    restaurant_id = str(max(map(int, data.keys())) + 1) if data else "1"

    data[restaurant_id] = restaurant.model_dump()
    save_data(data)

    return JSONResponse(
        status_code=201,
        content={
            "message": "Restaurant created successfully",
            "restaurant_id": restaurant_id,
        },
    )


# Update a restaurant
@app.put("/restaurants/{restaurant_id}")
def update_restaurant(restaurant_id: str, update: RestaurantUpdate):
    data = load_data()

    if restaurant_id not in data:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Only apply fields the client actually sent
    changes = update.model_dump(exclude_unset=True)
    data[restaurant_id].update(changes)
    save_data(data)

    return {"message": "Restaurant updated successfully", "restaurant_id": restaurant_id}


# Delete a restaurant
@app.delete("/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: str):
    data = load_data()

    if restaurant_id not in data:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    del data[restaurant_id]
    save_data(data)

    return {"message": "Restaurant deleted successfully", "restaurant_id": restaurant_id}