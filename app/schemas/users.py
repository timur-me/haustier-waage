from pydantic import BaseModel, UUID4, EmailStr
from typing import Optional
from datetime import datetime

from .media import MediaResponse


class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    password: str
    email: EmailStr  # Make email required for registration


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserProfile(BaseModel):
    id: UUID4
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture: Optional[MediaResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture_id: Optional[UUID4] = None


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None
    exp: Optional[datetime] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
