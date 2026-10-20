from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.admin import Admin
from ..schemas.auth import AdminLogin, AdminRegister, AdminResponse
from ..services.auth_service import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_current_admin(request: Request, db: Session = Depends(get_db)) -> Admin:
    admin_id = request.session.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=401, detail="Please sign in first")

    admin = db.get(Admin, admin_id)
    if not admin:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Admin account not found")

    return admin


@router.post("/register", response_model=AdminResponse, status_code=201)
def register_admin(data: AdminRegister, db: Session = Depends(get_db)):
    email = str(data.email).lower()

    if db.scalar(select(Admin).where(Admin.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    admin = Admin(
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(data.password),
    )
    db.add(admin)
    try:
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    return admin


@router.post("/login", response_model=AdminResponse)
def login_admin(data: AdminLogin, request: Request, db: Session = Depends(get_db)):
    email = str(data.email).lower()
    admin = db.scalar(select(Admin).where(Admin.email == email))

    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    request.session.clear()
    request.session["admin_id"] = admin.id
    return admin


@router.get("/me", response_model=AdminResponse)
def get_me(admin: Admin = Depends(get_current_admin)):
    return admin


@router.post("/logout")
def logout_admin(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}