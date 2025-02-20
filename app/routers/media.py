from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
import shutil
from pathlib import Path

from ..database import get_db
from ..models import Media, User
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/api/media",
    tags=["media"]
)

# Create media uploads directory if it doesn't exist
UPLOAD_DIR = Path("app/assets/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
]

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("")
async def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a media file."""

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Content type {file.content_type} not allowed. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )

    # Read file content to validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE/1024/1024}MB"
        )

    # Reset file position after reading
    await file.seek(0)

    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / filename

    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create media record
    media = Media(
        filename=filename,
        content_type=file.content_type,
        size=len(content)
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    return {
        "id": media.id,
        "filename": media.filename,
        "content_type": media.content_type,
        "size": media.size,
        "created_at": media.created_at,
        "updated_at": media.updated_at
    }


@router.get("/{filename}")
async def get_media_file(
    filename: str,
    db: Session = Depends(get_db)
):
    """Get media file by filename."""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        # If file not found, check if it's a placeholder
        if filename in ['placeholder-pet.svg', 'placeholder-profile.svg']:
            file_path = UPLOAD_DIR / filename
            if not file_path.exists():
                raise HTTPException(
                    status_code=404, detail="Media file not found")
        else:
            raise HTTPException(status_code=404, detail="Media file not found")

    # Get media record for content type
    media = db.query(Media).filter(Media.filename == filename).first()
    content_type = media.content_type if media else 'image/svg+xml'

    return Response(content=file_path.read_bytes(), media_type=content_type)


@router.delete("/{media_id}")
async def delete_media(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete media file by ID."""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Delete file if it exists
    file_path = UPLOAD_DIR / media.filename
    if file_path.exists():
        file_path.unlink()

    # Delete database record
    db.delete(media)
    db.commit()

    return {"message": "Media deleted successfully"}
