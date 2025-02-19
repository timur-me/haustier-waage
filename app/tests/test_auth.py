import pytest
from app import models
from datetime import datetime
import uuid


def test_login_new_user(client):
    response = client.post("/auth/login", json={"username": "newuser"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_existing_user(client, test_user):
    response = client.post(
        "/auth/login", json={"username": test_user.username})
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_refresh_token(authorized_client):
    response = authorized_client.post("/auth/refresh-token")
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_refresh_token_unauthorized(client):
    response = client.post("/auth/refresh-token")
    assert response.status_code == 403


def test_invalid_token(client):
    client.headers["Authorization"] = "Bearer invalid_token"
    response = client.get("/animals")
    assert response.status_code == 401
