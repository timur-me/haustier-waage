import uuid
from datetime import UTC, datetime
from typing import List

import pytest
from fastapi.testclient import TestClient

from app import models


def test_create_animal(authorized_client: TestClient) -> None:
    """Test creating a new animal."""
    response = authorized_client.post(
        "/animals",
        json={"name": "New Pet"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Pet"
    assert "id" in data
    assert "owner_id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_animal_unauthorized(client: TestClient) -> None:
    """Test creating an animal without authorization."""
    response = client.post(
        "/animals",
        json={"name": "New Pet"}
    )
    assert response.status_code == 403


def test_get_animals(authorized_client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test getting all animals for a user."""
    response = authorized_client.get("/animals")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == len(test_animals)
    assert all(animal["name"].startswith("Test Pet") for animal in data)


def test_get_animals_unauthorized(client: TestClient) -> None:
    """Test getting animals without authorization."""
    response = client.get("/animals")
    assert response.status_code == 403


def test_update_animal(authorized_client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test updating an animal's information."""
    animal_id = str(test_animals[0].id)
    response = authorized_client.put(
        f"/animals/{animal_id}",
        json={"name": "Updated Pet Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Pet Name"
    assert str(data["id"]) == animal_id


def test_update_animal_unauthorized(client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test updating an animal without authorization."""
    animal_id = str(test_animals[0].id)
    response = client.put(
        f"/animals/{animal_id}",
        json={"name": "Updated Pet Name"}
    )
    assert response.status_code == 403


def test_update_nonexistent_animal(authorized_client: TestClient) -> None:
    """Test updating a non-existent animal."""
    fake_id = str(uuid.uuid4())
    response = authorized_client.put(
        f"/animals/{fake_id}",
        json={"name": "Updated Pet Name"}
    )
    assert response.status_code == 404


def test_delete_animal(authorized_client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test deleting an animal."""
    animal_id = str(test_animals[0].id)
    response = authorized_client.delete(f"/animals/{animal_id}")
    assert response.status_code == 204

    # Verify animal is deleted
    response = authorized_client.get("/animals")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == len(test_animals) - 1
    assert all(str(animal["id"]) != animal_id for animal in data)


def test_delete_animal_unauthorized(client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test deleting an animal without authorization."""
    animal_id = str(test_animals[0].id)
    response = client.delete(f"/animals/{animal_id}")
    assert response.status_code == 403


def test_delete_nonexistent_animal(authorized_client: TestClient) -> None:
    """Test deleting a non-existent animal."""
    fake_id = str(uuid.uuid4())
    response = authorized_client.delete(f"/animals/{fake_id}")
    assert response.status_code == 404
