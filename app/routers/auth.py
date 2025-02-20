from datetime import datetime, timedelta, UTC
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from ..database import get_db
from .. import models, schemas
from ..utils.password import hash_password, verify_password, generate_reset_token
from ..utils.email import send_password_reset_email
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(
            UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(
            username=username, exp=datetime.fromtimestamp(payload.get("exp"), UTC))
    except JWTError:
        raise credentials_exception

    # Check token expiration
    if token_data.exp and token_data.exp < datetime.now(UTC):
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60}


@router.post("/register", response_model=schemas.Token)
async def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if username already exists
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )

    # Check if email already exists
    if user.email and db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create new user
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password_hash,
        salt=user.salt,
        created_at=datetime.now(UTC)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/password-reset-request")
async def request_password_reset(
    reset_request: schemas.PasswordReset,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == reset_request.email).first()
    if not user:
        # Return success even if email doesn't exist to prevent email enumeration
        return {"message": "If the email exists, a password reset link has been sent"}

    # Generate and save reset token
    reset_token = generate_reset_token()
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(UTC) + timedelta(hours=1)
    db.commit()

    # Send reset email
    await send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token,
        username=user.username
    )

    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/password-reset-confirm")
async def confirm_password_reset(
    reset_confirm: schemas.PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.reset_token == reset_confirm.token,
        models.User.reset_token_expires > datetime.now(UTC)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Update password
    hashed_password, salt = hash_password(reset_confirm.new_password)
    user.password_hash = hashed_password
    user.salt = salt
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Password has been reset successfully"}


@router.post("/refresh-token", response_model=schemas.Token)
async def refresh_token(current_user: models.User = Depends(get_current_user)):
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60}
