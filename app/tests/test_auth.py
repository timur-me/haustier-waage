import pytest
from app import models
from datetime import datetime, timedelta
import uuid


def test_login_new_user(client):
    response = client.post(
        "/auth/login",
        data={"username": "newuser", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_existing_user(client, test_user):
    response = client.post(
        "/auth/login",
        data={"username": test_user.username, "password": "testpassword"}
    )
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
    assert response.status_code == 401


def test_invalid_token(client):
    client.headers["Authorization"] = "Bearer invalid_token"
    response = client.get("/api/animals")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_password_reset_request(client, test_user):
    # Request password reset
    response = client.post(
        "/auth/password-reset",
        json={"email": test_user.email}
    )
    assert response.status_code == 200
    assert response.json()[
        "message"] == "If the email exists, a password reset link will be sent"

    # Try with non-existent email
    response = client.post(
        "/auth/password-reset",
        json={"email": "nonexistent@example.com"}
    )
    assert response.status_code == 200
    assert response.json()[
        "message"] == "If the email exists, a password reset link will be sent"


@pytest.mark.asyncio
async def test_password_reset_confirm(client, test_user, db):
    # First, set a reset token
    reset_token = "test_reset_token"
    test_user.reset_token = reset_token
    test_user.reset_token_expires = datetime.now() + timedelta(hours=1)
    db.commit()

    # Try resetting with valid token
    response = client.post(
        f"/auth/reset-password/{reset_token}",
        json={"token": reset_token, "new_password": "NewPassword123!"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password reset successfully"

    # Try resetting with invalid token
    response = client.post(
        "/auth/reset-password/invalid_token",
        json={"token": "invalid_token", "new_password": "NewPassword123!"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired reset token"
