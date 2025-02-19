import os
import uuid
from datetime import UTC, datetime, timedelta
from typing import Generator, List

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app import models
from app.database import Base, get_db
from app.main import app

# Test database configuration
SQLALCHEMY_DATABASE_URL = "postgresql://{}:{}@{}:{}/{}".format(
    os.getenv("POSTGRES_USER"),
    os.getenv("POSTGRES_PASSWORD"),
    os.getenv("POSTGRES_HOST"),
    os.getenv("POSTGRES_PORT"),
    os.getenv("POSTGRES_DB") + "_test"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    del app.dependency_overrides[get_db]


@pytest.fixture(scope="function")
def test_user(db: Session) -> models.User:
    """Create a test user."""
    user = models.User(
        id=uuid.uuid4(),
        username="testuser",
        created_at=datetime.now(UTC)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_token(test_user: models.User, client: TestClient) -> str:
    """Create a test token for authentication."""
    response = client.post(
        "/auth/login", json={"username": test_user.username})
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def authorized_client(client: TestClient, test_token: str) -> TestClient:
    """Create an authorized test client."""
    client.headers["Authorization"] = f"Bearer {test_token}"
    return client


@pytest.fixture(scope="function")
def test_animals(db: Session, test_user: models.User) -> List[models.Animal]:
    """Create test animals."""
    animals = []
    for i in range(3):
        animal = models.Animal(
            id=uuid.uuid4(),
            owner_id=test_user.id,
            name=f"Test Pet {i+1}",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )
        db.add(animal)
        animals.append(animal)

    db.commit()
    for animal in animals:
        db.refresh(animal)
    return animals


@pytest.fixture(scope="function")
def test_weights(db: Session, test_animals: List[models.Animal]) -> List[models.Weight]:
    """Create test weights for animals."""
    weights = []
    for animal in test_animals:
        for i in range(3):
            weight = models.Weight(
                id=uuid.uuid4(),
                animal_id=animal.id,
                weight=10.5 + i,
                created_at=datetime.now(UTC) - timedelta(days=i),
                updated_at=datetime.now(UTC) - timedelta(days=i)
            )
            db.add(weight)
            weights.append(weight)

    db.commit()
    for weight in weights:
        db.refresh(weight)
    return weights
