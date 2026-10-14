
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

from .models.restaurant_photos import RestaurantPhoto
from .routers import restaurant_photos


import os
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware

from .models.admin import Admin
from .routers import auth


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luxar API")

load_dotenv()

# Enables signed session cookies for your FastAPI app.
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ["SESSION_SECRET"],
    same_site="lax",
    https_only=os.getenv("COOKIE_SECURE", "false").lower() == "true",
)

app.include_router(auth.router)


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



# Add this with your other include_router calls
app.include_router(
    restaurant_photos.router,
    tags=["Restaurant Photos"],
)