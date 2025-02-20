from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
from ..websocket import manager
import uuid
from typing import List, Optional
from datetime import date

router = APIRouter(
    prefix="/api/animals",
    tags=["animals"]
)


@router.post("", response_model=schemas.AnimalResponse)
async def create_animal(
    animal: schemas.AnimalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new animal."""

    # Verify profile picture if provided
    if animal.profile_picture_id:
        media = db.query(models.Media).filter(
            models.Media.id == animal.profile_picture_id).first()
        if not media:
            raise HTTPException(
                status_code=404, detail="Profile picture media not found")

    # Create animal
    db_animal = models.Animal(
        owner_id=current_user.id,
        name=animal.name,
        description=animal.description,
        birth_date=animal.birth_date,
        species=animal.species,
        breed=animal.breed,
        profile_picture_id=animal.profile_picture_id
    )
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)

    # Broadcast the change
    await manager.broadcast_to_user(
        str(current_user.id),
        {
            "type": "ANIMAL_CREATED",
            "data": {
                "id": str(db_animal.id),
                "name": db_animal.name,
                "owner_id": str(db_animal.owner_id),
                "created_at": db_animal.created_at.isoformat(),
                "updated_at": db_animal.updated_at.isoformat()
            }
        }
    )
    return db_animal


@router.get("", response_model=List[schemas.AnimalResponse])
async def get_animals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all animals for the current user."""
    return db.query(models.Animal).filter(models.Animal.owner_id == current_user.id).all()


@router.get("/{animal_id}", response_model=schemas.AnimalResponse)
async def get_animal(
    animal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get an animal by ID."""
    animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    return animal


@router.patch("/{animal_id}", response_model=schemas.AnimalResponse)
async def update_animal(
    animal_id: uuid.UUID,
    animal_update: schemas.AnimalUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update an animal."""
    animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    # Update profile picture if provided
    if animal_update.profile_picture_id is not None:
        # If not None (setting new picture)
        if animal_update.profile_picture_id:
            media = db.query(models.Media).filter(
                models.Media.id == animal_update.profile_picture_id).first()
            if not media:
                raise HTTPException(
                    status_code=404, detail="Profile picture media not found")
            animal.profile_picture_id = media.id
        else:  # If None (removing picture)
            animal.profile_picture_id = None

    # Update other fields if provided
    if animal_update.name is not None:
        animal.name = animal_update.name
    if animal_update.description is not None:
        animal.description = animal_update.description
    if animal_update.birth_date is not None:
        animal.birth_date = animal_update.birth_date
    if animal_update.species is not None:
        animal.species = animal_update.species
    if animal_update.breed is not None:
        animal.breed = animal_update.breed

    db.commit()
    db.refresh(animal)

    # Broadcast the change
    await manager.broadcast_to_user(
        str(current_user.id),
        {
            "type": "ANIMAL_UPDATED",
            "data": {
                "id": str(animal.id),
                "name": animal.name,
                "owner_id": str(animal.owner_id),
                "created_at": animal.created_at.isoformat(),
                "updated_at": animal.updated_at.isoformat()
            }
        }
    )
    return animal


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_animal(
    animal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete an animal."""
    animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    # First delete all associated weight entries
    db.query(models.Weight).filter(
        models.Weight.animal_id == animal_id).delete()

    # Then delete the animal
    db.delete(animal)
    db.commit()

    # Broadcast the change
    await manager.broadcast_to_user(
        str(current_user.id),
        {
            "type": "ANIMAL_DELETED",
            "data": {
                "id": str(animal_id)
            }
        }
    )
    return None
