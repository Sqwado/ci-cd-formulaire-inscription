import os
from datetime import date, datetime
from unittest.mock import MagicMock, patch

import bcrypt
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-pytest")

with patch("serveur.get_db_pool"), patch("serveur.seed_admin"):
    from serveur import (
        app,
        create_access_token,
        format_date,
        map_row_to_private,
        map_row_to_public,
    )

client = TestClient(app)


@pytest.fixture
def db_mocks():
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value = cursor

    with patch("serveur.get_db_connection", return_value=connection):
        yield connection, cursor


def test_format_date_supports_date_and_datetime():
    assert format_date(date(1990, 1, 1)) == "1990-01-01"
    assert format_date(datetime(1990, 1, 1, 12, 30)) == "1990-01-01T12:30:00"
    assert format_date("1990-01-01") == "1990-01-01"


def test_map_row_helpers():
    row = {
        "id": 1,
        "name": "Jean",
        "surname": "Dupont",
        "email": "jean@example.com",
        "date_of_birth": date(1990, 1, 1),
        "city": "Paris",
        "postal_code": "75001",
    }

    assert map_row_to_public(row) == {"id": 1, "prenom": "Jean", "nom": "Dupont"}
    assert map_row_to_private(row) == {
        "id": 1,
        "prenom": "Jean",
        "nom": "Dupont",
        "email": "jean@example.com",
        "dateOfBirth": "1990-01-01",
        "ville": "Paris",
        "codePostal": "75001",
    }


def test_get_users_returns_public_list(db_mocks):
    _, cursor = db_mocks
    cursor.fetchall.return_value = [
        {"id": 1, "name": "Jean", "surname": "Dupont"},
        {"id": 2, "name": "Alice", "surname": "Martin"},
    ]

    response = client.get("/users")

    assert response.status_code == 200
    assert response.json() == {
        "users": [
            {"id": 1, "prenom": "Jean", "nom": "Dupont"},
            {"id": 2, "prenom": "Alice", "nom": "Martin"},
        ]
    }


def test_create_user_returns_private_payload(db_mocks):
    _, cursor = db_mocks
    cursor.lastrowid = 3
    cursor.fetchone.return_value = {
        "id": 3,
        "name": "Jean",
        "surname": "Dupont",
        "email": "jean@example.com",
        "date_of_birth": date(1990, 1, 1),
        "city": "Paris",
        "postal_code": "75001",
    }

    payload = {
        "prenom": "Jean",
        "nom": "Dupont",
        "email": "jean@example.com",
        "dateOfBirth": "1990-01-01",
        "ville": "Paris",
        "codePostal": "75001",
    }

    response = client.post("/users", json=payload)

    assert response.status_code == 201
    assert response.json()["email"] == "jean@example.com"
    connection_commit = db_mocks[0].commit
    connection_commit.assert_called_once()


def test_login_admin_success(db_mocks):
    _, cursor = db_mocks
    password_hash = bcrypt.hashpw(b"secret-password", bcrypt.gensalt()).decode()
    cursor.fetchone.return_value = {
        "id": 7,
        "email": "admin@example.com",
        "password_hash": password_hash,
    }

    response = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "secret-password"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "admin@example.com"
    assert isinstance(body["token"], str)


def test_login_admin_invalid_credentials(db_mocks):
    _, cursor = db_mocks
    cursor.fetchone.return_value = None

    response = client.post(
        "/auth/login",
        json={"email": "wrong@example.com", "password": "bad"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_get_user_detail_requires_authentication(db_mocks):
    response = client.get("/users/1")

    assert response.status_code == 401


def test_get_user_detail_success(db_mocks):
    _, cursor = db_mocks
    cursor.fetchone.return_value = {
        "id": 1,
        "name": "Jean",
        "surname": "Dupont",
        "email": "jean@example.com",
        "date_of_birth": date(1990, 1, 1),
        "city": "Paris",
        "postal_code": "75001",
    }
    token = create_access_token(1, "admin@example.com")

    response = client.get("/users/1", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "jean@example.com"


def test_get_user_detail_not_found(db_mocks):
    _, cursor = db_mocks
    cursor.fetchone.return_value = None
    token = create_access_token(1, "admin@example.com")

    response = client.get("/users/99", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 404


def test_get_user_detail_rejects_invalid_token(db_mocks):
    response = client.get("/users/1", headers={"Authorization": "Bearer invalid-token"})

    assert response.status_code == 401


def test_delete_user_success(db_mocks):
    _, cursor = db_mocks
    cursor.rowcount = 1
    token = create_access_token(1, "admin@example.com")

    response = client.delete("/users/1", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 204


def test_delete_user_not_found(db_mocks):
    _, cursor = db_mocks
    cursor.rowcount = 0
    token = create_access_token(1, "admin@example.com")

    response = client.delete("/users/99", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 404


def test_delete_user_requires_authentication(db_mocks):
    response = client.delete("/users/1")

    assert response.status_code == 401


def test_get_db_connection_returns_503_when_pool_fails():
    import mysql.connector

    with patch("serveur.get_db_pool") as pool_mock:
        pool_mock.return_value.get_connection.side_effect = mysql.connector.Error("db down")

        response = client.get("/users")

    assert response.status_code == 503
