from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
import uuid
from typing import List

router = APIRouter(
    prefix="/animals",
    tags=["animals"]
)


@router.post("/", response_model=schemas.Animal)
async def create_animal(
    animal: schemas.AnimalCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_animal = models.Animal(
        id=uuid.uuid4(),
        owner_id=current_user.id,
        name=animal.name
    )
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)
    return db_animal


@router.get("/{animal_id}", response_model=schemas.Animal)
async def get_animal(
    animal_id: uuid.UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific animal by ID."""
    db_animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    return db_animal


@router.get("/", response_model=List[schemas.Animal])
async def get_animals(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Animal).filter(models.Animal.owner_id == current_user.id).all()


@router.put("/{animal_id}", response_model=schemas.Animal)
async def update_animal(
    animal_id: uuid.UUID,
    animal: schemas.AnimalUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    for key, value in animal.model_dump().items():
        setattr(db_animal, key, value)

    db.commit()
    db.refresh(db_animal)
    return db_animal


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_animal(
    animal_id: uuid.UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    # First delete all associated weight entries
    db.query(models.Weight).filter(
        models.Weight.animal_id == animal_id).delete()

    # Then delete the animal
    db.delete(db_animal)
    db.commit()
    return None
