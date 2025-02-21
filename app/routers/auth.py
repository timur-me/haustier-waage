from datetime import datetime, timedelta, UTC
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from ..database import get_db
from .. import models, schemas
from ..utils.password import hash_password, verify_password, generate_reset_token
from ..utils.email import send_password_reset_email, send_verification_email
import os
from dotenv import load_dotenv
import uuid
import bcrypt
import logging
import traceback

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

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


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
    credentials: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.username == credentials.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password using bcrypt
    if not verify_password(credentials.password, user.password_hash):
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
    # Check if username exists
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )

    # Check if email exists
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash the password
    password_hash = hash_password(user.password)

    # Generate verification token
    verification_token = generate_reset_token()
    verification_token_expires = datetime.now(UTC) + timedelta(hours=24)

    # Create user
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=password_hash,
        email_verified=False,
        reset_token=verification_token,
        reset_token_expires=verification_token_expires
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send verification email
    try:
        await send_verification_email(
            to_email=user.email,
            verification_token=verification_token,
            username=user.username
        )
    except Exception as e:
        print(f"Failed to send verification email: {e}")

    # Create access token
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user's email address."""
    user = db.query(models.User).filter(
        models.User.reset_token == token,
        models.User.reset_token_expires > datetime.now(UTC)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )

    user.email_verified = True
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Email verified successfully"}


@router.post("/password-reset")
async def request_password_reset(email: schemas.PasswordReset, db: Session = Depends(get_db)):
    """Request a password reset."""
    logger.info(f"Password reset requested for email: {email.email}")

    # Always return success to prevent email enumeration
    response = {
        "message": "If the email exists, a password reset link will be sent"
    }

    user = db.query(models.User).filter(
        models.User.email == email.email).first()
    if not user:
        logger.debug(f"No user found with email: {email.email}")
        return response

    logger.debug(f"User found: {user.username}")

    try:
        # Generate reset token
        reset_token = generate_reset_token()
        reset_token_expires = datetime.now(UTC) + timedelta(hours=1)

        # Update user with reset token
        user.reset_token = reset_token
        user.reset_token_expires = reset_token_expires
        db.commit()
        logger.debug(
            f"Reset token generated and saved for user: {user.username}")

        # Send reset email
        logger.debug(f"Attempting to send reset email to: {email.email}")
        await send_password_reset_email(
            to_email=email.email,
            reset_token=reset_token,
            username=user.username
        )
        logger.info(f"Reset email sent successfully to: {email.email}")

    except Exception as e:
        logger.error(f"Failed to send reset email: {str(e)}")
        logger.debug(f"Full error traceback: {traceback.format_exc()}")
        # Rollback the token update since email failed
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()
        logger.debug("Reset token cleared due to email failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email. Please try again later."
        )

    return response


@router.post("/reset-password")
def reset_password(request: schemas.PasswordReset, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate reset token
    reset_token = create_access_token(
        data={"sub": user.username, "type": "reset"},
        expires_delta=timedelta(minutes=15)
    )

    # Store reset token in database
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(UTC) + timedelta(minutes=15)
    db.commit()

    # Send reset email
    send_password_reset_email(user.email, reset_token)
    return {"message": "Password reset email sent"}


@router.post("/reset-password/{token}/confirm")
def reset_password_confirm(
    token: str = Path(..., description="Reset token from email"),
    request: schemas.PasswordResetConfirm = None,
    db: Session = Depends(get_db)
):
    # Find user by reset token
    user = db.query(models.User).filter(
        models.User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    # Check if token is expired
    if user.reset_token_expires and user.reset_token_expires < datetime.now(UTC):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Hash and update password
    user.password_hash = hash_password(request.password)
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
