from pydantic import BaseModel, UUID4
from datetime import datetime
from decimal import Decimal


class WeightBase(BaseModel):
    weight: Decimal


class WeightCreate(WeightBase):
    animal_id: UUID4
    date: datetime


class WeightUpdate(WeightBase):
    date: datetime


class WeightResponse(WeightBase):
    id: UUID4
    animal_id: UUID4
    date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
