from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
import uuid
from typing import List
from datetime import UTC, datetime

router = APIRouter(
    prefix="/weights",
    tags=["weights"]
)


@router.post("/", response_model=schemas.Weight)
async def create_weight(
    weight: schemas.WeightCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify the animal belongs to the current user
    animal = db.query(models.Animal).filter(
        models.Animal.id == weight.animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    db_weight = models.Weight(
        id=uuid.uuid4(),
        animal_id=weight.animal_id,
        weight=weight.weight,
        date=weight.date
    )
    db.add(db_weight)
    db.commit()
    db.refresh(db_weight)
    return db_weight


@router.get("/animal/{animal_id}", response_model=List[schemas.Weight])
async def get_animal_weights(
    animal_id: uuid.UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify the animal belongs to the current user
    animal = db.query(models.Animal).filter(
        models.Animal.id == animal_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    return db.query(models.Weight).filter(models.Weight.animal_id == animal_id).all()


@router.put("/{weight_id}", response_model=schemas.Weight)
async def update_weight(
    weight_id: uuid.UUID,
    weight: schemas.WeightUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_weight = db.query(models.Weight).join(models.Animal).filter(
        models.Weight.id == weight_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not db_weight:
        raise HTTPException(status_code=404, detail="Weight entry not found")

    for key, value in weight.model_dump().items():
        setattr(db_weight, key, value)

    db.commit()
    db.refresh(db_weight)
    return db_weight


@router.delete("/{weight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_weight(
    weight_id: uuid.UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    db_weight = db.query(models.Weight).join(models.Animal).filter(
        models.Weight.id == weight_id,
        models.Animal.owner_id == current_user.id
    ).first()

    if not db_weight:
        raise HTTPException(status_code=404, detail="Weight entry not found")

    db.delete(db_weight)
    db.commit()
    return None
