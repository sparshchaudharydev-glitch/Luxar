
from fastapi import FastAPI

from .database import Base, engine

# Import models so SQLAlchemy registers their tables
from .models.restaurant import Restaurant
from .models.menu_item import MenuItem
from .models.opening_hours import OpeningHours

# Import routers
from .routers import restaurants, menu_items, opening_hours

from .routers import restaurant_contacts
from .models.restaurant_contacts import RestaurantContact
from .routers import restaurant_contacts


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luxar API")


@app.get("/")
def root():
    return {"message": "Luxar API is running"}


app.include_router(
    restaurants.router,
    prefix="/restaurants",
    tags=["Restaurants"]
)

app.include_router(
    menu_items.router,
    tags=["Menu Items"]
)

app.include_router(
    opening_hours.router,
    tags=["Opening Hours"]
)


app.include_router(
    restaurant_contacts.router,
    tags=["Restaurant Contacts"]
)