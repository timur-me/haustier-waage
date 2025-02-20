from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, func, Boolean, Integer, Text, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .database import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    email_verified = Column(Boolean, nullable=False, server_default='false')
    password_hash = Column(String, nullable=True)
    salt = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    profile_picture_id = Column(UUID(as_uuid=True), ForeignKey(
        'media.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

    # Relationships
    profile_picture = relationship("Media", uselist=False)
    animals = relationship("Animal", back_populates="owner")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)


class Animal(Base):
    __tablename__ = "animals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    birth_date = Column(Date, nullable=True)
    species = Column(String(50), nullable=True)
    breed = Column(String(50), nullable=True)
    profile_picture_id = Column(UUID(as_uuid=True), ForeignKey(
        'media.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="animals")
    profile_picture = relationship("Media", uselist=False)
    weights = relationship(
        "Weight", back_populates="animal", cascade="all, delete-orphan")


class Weight(Base):
    __tablename__ = "weights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    animal_id = Column(UUID(as_uuid=True), ForeignKey(
        "animals.id"), nullable=False)
    weight = Column(Numeric(10, 2), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

    # Relationships
    animal = relationship("Animal", back_populates="weights")
