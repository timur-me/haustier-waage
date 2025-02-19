from pydantic import BaseModel, UUID4, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional

# User schemas


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: UUID4
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

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

# Auth schemas


class LoginRequest(BaseModel):
    username: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
