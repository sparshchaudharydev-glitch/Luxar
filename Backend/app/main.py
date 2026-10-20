from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .config import COOKIE_SECURE, SESSION_SECRET
from .database import Base, engine
from .models import admin, restaurant, restaurant_photos  # noqa: F401  (registers the tables)
from .routers import auth, restaurant_photos as restaurant_photos_router, restaurants

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Luxar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="lax",
    https_only=COOKIE_SECURE,
)


@app.get("/")
def root():
    return {"message": "Luxar API is running"}


app.include_router(auth.router)
app.include_router(restaurants.router)
app.include_router(restaurant_photos_router.router)