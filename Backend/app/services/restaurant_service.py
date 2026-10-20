import copy

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.admin import Admin
from ..models.restaurant import Restaurant

DEFAULT_DETAILS = {
    "status": "Active",
    "coords": None,
    "contact": {"phone": "", "whatsapp": "", "instagram": ""},
    "timing": {"opening": "", "closing": "", "weeklyOff": ""},
    "menu": {"veg": 0, "nonVeg": 0, "shakes": 0},
    "facilities": [],
    "reviews": {"rating": None, "count": 0},
    "luxarPartner": False,
}


def merged_details(restaurant: Restaurant) -> dict:
    """Default details with whatever is stored on top. Returns a copy, so it's safe to edit."""
    result = copy.deepcopy(DEFAULT_DETAILS)
    for key, value in (restaurant.details or {}).items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key].update(value)
        else:
            result[key] = value
    return result


def restaurant_view(restaurant: Restaurant) -> dict:
    d = merged_details(restaurant)
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "location": restaurant.location,
        "rating": d["reviews"]["rating"],
        "status": d["status"],
        "coords": d["coords"],
        "contact": d["contact"],
        "timing": d["timing"],
        "menu": d["menu"],
        "facilities": d["facilities"],
        "reviews": d["reviews"],
        "luxarPartner": d["luxarPartner"],
    }


def apply_update(restaurant: Restaurant, data: dict) -> None:
    if data.get("name") is not None:
        restaurant.name = data["name"]
    if data.get("location") is not None:
        restaurant.location = data["location"]

    d = merged_details(restaurant)

    if "lat" in data or "lng" in data:
        lat, lng = data.get("lat"), data.get("lng")
        d["coords"] = {"lat": lat, "lng": lng} if lat is not None and lng is not None else None

    for key in ("phone", "whatsapp", "instagram"):
        if key in data:
            d["contact"][key] = data[key] or ""

    for key, field in (("opening", "opening"), ("closing", "closing"), ("weekly_off", "weeklyOff")):
        if key in data:
            d["timing"][field] = data[key] or ""

    for key, field in (("veg_dishes", "veg"), ("non_veg_dishes", "nonVeg"), ("shakes", "shakes")):
        if key in data:
            d["menu"][field] = data[key] or 0

    if "facilities" in data:
        d["facilities"] = data["facilities"] or []

    if "rating" in data:
        d["reviews"]["rating"] = data["rating"]
    if "review_count" in data:
        d["reviews"]["count"] = data["review_count"] or 0

    if "luxar_partner" in data:
        d["luxarPartner"] = bool(data["luxar_partner"])

    # Assign a new dict so SQLAlchemy sees the change.
    restaurant.details = d


def get_or_404(db: Session, restaurant_id: int) -> Restaurant:
    restaurant = db.get(Restaurant, restaurant_id)
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


def owned_or_404(db: Session, restaurant_id: int, admin: Admin) -> Restaurant:
    """Only the owner can see or change a restaurant. Others get the same 404 as a missing one."""
    restaurant = get_or_404(db, restaurant_id)
    if restaurant.owner_id != admin.id:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant