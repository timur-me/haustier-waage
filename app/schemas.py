from pydantic import BaseModel, UUID4, ConfigDict, EmailStr
from datetime import datetime
from decimal import Decimal
from typing import Optional

# User schemas


class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    password: str
    email: EmailStr  # Make email required for registration


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class User(UserBase):
    id: UUID4
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None
    exp: Optional[datetime] = None

# Animal schemas


class AnimalBase(BaseModel):
    name: str


class AnimalCreate(AnimalBase):
    pass


class AnimalUpdate(AnimalBase):
    pass


class Animal(AnimalBase):
    id: UUID4
    owner_id: UUID4
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Weight schemas


class WeightBase(BaseModel):
    weight: Decimal


class WeightCreate(WeightBase):
    animal_id: UUID4
    date: datetime


class WeightUpdate(WeightBase):
    date: datetime


class Weight(WeightBase):
    id: UUID4
    animal_id: UUID4
    date: datetime
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
