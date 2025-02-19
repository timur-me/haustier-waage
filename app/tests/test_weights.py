import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import List

import pytest
from fastapi.testclient import TestClient

from app import models


def test_create_weight(authorized_client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test creating a new weight record."""
    animal_id = str(test_animals[0].id)
    response = authorized_client.post(
        "/weights",
        json={
            "animal_id": animal_id,
            "weight": 15.5
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert str(data["animal_id"]) == animal_id
    assert Decimal(str(data["weight"])) == Decimal("15.5")
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_weight_unauthorized(client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test creating a weight record without authorization."""
    animal_id = str(test_animals[0].id)
    response = client.post(
        "/weights",
        json={
            "animal_id": animal_id,
            "weight": 15.5
        }
    )
    assert response.status_code == 403


def test_create_weight_nonexistent_animal(authorized_client: TestClient) -> None:
    """Test creating a weight record for a non-existent animal."""
    fake_id = str(uuid.uuid4())
    response = authorized_client.post(
        "/weights",
        json={
            "animal_id": fake_id,
            "weight": 15.5
        }
    )
    assert response.status_code == 404


def test_get_animal_weights(
    authorized_client: TestClient,
    test_animals: List[models.Animal],
    test_weights: List[models.Weight]
) -> None:
    """Test getting all weight records for an animal."""
    animal_id = str(test_animals[0].id)
    response = authorized_client.get(f"/weights/animal/{animal_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3  # We created 3 weights per animal in fixtures
    assert all(str(weight["animal_id"]) == animal_id for weight in data)


def test_get_animal_weights_unauthorized(client: TestClient, test_animals: List[models.Animal]) -> None:
    """Test getting animal weights without authorization."""
    animal_id = str(test_animals[0].id)
    response = client.get(f"/weights/animal/{animal_id}")
    assert response.status_code == 403


def test_get_nonexistent_animal_weights(authorized_client: TestClient) -> None:
    """Test getting weights for a non-existent animal."""
    fake_id = str(uuid.uuid4())
    response = authorized_client.get(f"/weights/animal/{fake_id}")
    assert response.status_code == 404


def test_update_weight(authorized_client: TestClient, test_weights: List[models.Weight]) -> None:
    """Test updating a weight record."""
    weight_id = str(test_weights[0].id)
    response = authorized_client.put(
        f"/weights/{weight_id}",
        json={"weight": 20.5}
    )
    assert response.status_code == 200
    data = response.json()
    assert Decimal(str(data["weight"])) == Decimal("20.5")
    assert str(data["id"]) == weight_id


def test_update_weight_unauthorized(client: TestClient, test_weights: List[models.Weight]) -> None:
    """Test updating a weight record without authorization."""
    weight_id = str(test_weights[0].id)
    response = client.put(
        f"/weights/{weight_id}",
        json={"weight": 20.5}
    )
    assert response.status_code == 403


def test_update_nonexistent_weight(authorized_client: TestClient) -> None:
    """Test updating a non-existent weight record."""
    fake_id = str(uuid.uuid4())
    response = authorized_client.put(
        f"/weights/{fake_id}",
        json={"weight": 20.5}
    )
    assert response.status_code == 404


def test_delete_weight(authorized_client: TestClient, test_weights: List[models.Weight]) -> None:
    """Test deleting a weight record."""
    weight_id = str(test_weights[0].id)
    response = authorized_client.delete(f"/weights/{weight_id}")
    assert response.status_code == 204


def test_delete_weight_unauthorized(client: TestClient, test_weights: List[models.Weight]) -> None:
    """Test deleting a weight record without authorization."""
    weight_id = str(test_weights[0].id)
    response = client.delete(f"/weights/{weight_id}")
    assert response.status_code == 403


def test_delete_nonexistent_weight(authorized_client: TestClient) -> None:
    """Test deleting a non-existent weight record."""
    fake_id = str(uuid.uuid4())
    response = authorized_client.delete(f"/weights/{fake_id}")
    assert response.status_code == 404
