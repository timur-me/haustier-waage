from pydantic import BaseModel, UUID4
from datetime import datetime


class MediaResponse(BaseModel):
    id: UUID4
    filename: str
    content_type: str
    size: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
