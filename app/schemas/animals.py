from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime, date
from .media import MediaResponse


class AnimalBase(BaseModel):
    name: str
    description: Optional[str] = None
    birth_date: Optional[date] = None
    species: Optional[str] = None
    breed: Optional[str] = None


class AnimalCreate(AnimalBase):
    profile_picture_id: Optional[UUID4] = None


class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    birth_date: Optional[date] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    profile_picture_id: Optional[UUID4] = None


class AnimalResponse(AnimalBase):
    id: UUID4
    owner_id: UUID4
    profile_picture: Optional[MediaResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
