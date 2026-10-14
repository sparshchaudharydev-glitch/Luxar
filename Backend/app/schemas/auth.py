
import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class AdminRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    registration_key: str = Field(min_length=1, max_length=200)

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if not re.search(r"[A-Z]", password):
            raise ValueError("Password must contain an uppercase letter")

        if not re.search(r"[a-z]", password):
            raise ValueError("Password must contain a lowercase letter")

        if not re.search(r"[0-9]", password):
            raise ValueError("Password must contain a number")

        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("Password must contain a special character")

        return password


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class AdminResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
