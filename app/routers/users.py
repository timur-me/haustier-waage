from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from fastapi import status

from ..database import get_db
from ..models import User, Media
from ..dependencies import get_current_user
from ..schemas.users import UserProfile, UserProfileUpdate, PasswordUpdate
from ..utils.password import verify_password, hash_password

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "profile_picture": {
            "id": current_user.profile_picture.id,
            "filename": current_user.profile_picture.filename,
            "content_type": current_user.profile_picture.content_type,
            "size": current_user.profile_picture.size,
            "created_at": current_user.profile_picture.created_at,
            "updated_at": current_user.profile_picture.updated_at
        } if current_user.profile_picture else None,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }


@router.patch("/me", response_model=UserProfile)
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile."""

    # Check for duplicate username if username is being updated
    if profile_update.username is not None:
        existing_user = db.query(User).filter(
            User.username == profile_update.username,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )
        current_user.username = profile_update.username

    # Update profile picture if provided
    if profile_update.profile_picture_id is not None:
        # If not None (setting new picture)
        if profile_update.profile_picture_id:
            media = db.query(Media).filter(
                Media.id == profile_update.profile_picture_id).first()
            if not media:
                raise HTTPException(
                    status_code=404, detail="Profile picture media not found")
            current_user.profile_picture_id = media.id
        else:  # If None (removing picture)
            current_user.profile_picture_id = None

    # Update other fields if provided
    if profile_update.first_name is not None:
        current_user.first_name = profile_update.first_name
    if profile_update.last_name is not None:
        current_user.last_name = profile_update.last_name

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "profile_picture": {
            "id": current_user.profile_picture.id,
            "filename": current_user.profile_picture.filename,
            "content_type": current_user.profile_picture.content_type,
            "size": current_user.profile_picture.size,
            "created_at": current_user.profile_picture.created_at,
            "updated_at": current_user.profile_picture.updated_at
        } if current_user.profile_picture else None,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
async def update_password(
    password_update: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's password."""
    # Verify current password
    if not verify_password(password_update.current_password, current_user.password_hash, current_user.salt):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Hash new password
    hashed_password, salt = hash_password(password_update.new_password)
    current_user.password_hash = hashed_password
    current_user.salt = salt

    db.commit()
    return None
