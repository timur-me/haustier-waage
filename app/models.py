from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())


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
