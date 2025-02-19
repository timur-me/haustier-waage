from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db
import uuid

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)


@router.post("/login", response_model=schemas.Token)
async def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, request.username)
    if not user:
        # Create new user if doesn't exist
        new_user = models.User(
            id=uuid.uuid4(),
            username=request.username
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user

    access_token = auth.create_access_token(
        data={"sub": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh-token", response_model=schemas.Token)
async def refresh_token(current_user: models.User = Depends(auth.get_current_user)):
    access_token = auth.create_access_token(
        data={"sub": current_user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}
