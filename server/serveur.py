import os
from datetime import date, datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
import mysql.connector
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from mysql.connector import pooling
from pydantic import BaseModel, Field

app = FastAPI()
origins = ["*"]
security = HTTPBearer(auto_error=False)

_db_pool = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserCreate(BaseModel):
    prenom: str = Field(min_length=1)
    nom: str = Field(min_length=1)
    email: str = Field(min_length=1)
    dateOfBirth: str = Field(min_length=1)
    ville: str = Field(min_length=1)
    codePostal: str = Field(min_length=1)


class UserPublic(BaseModel):
    id: int
    prenom: str
    nom: str


class UserPrivate(UserCreate):
    id: int


class AdminLogin(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)


def get_db_pool():
    global _db_pool
    if _db_pool is None:
        _db_pool = pooling.MySQLConnectionPool(
            pool_name="ynov_pool",
            pool_size=2,
            pool_reset_session=True,
            host=os.getenv("MYSQL_HOST"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            database=os.getenv("MYSQL_DATABASE"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQL_ROOT_PASSWORD"),
        )
    return _db_pool


def get_db_connection():
    try:
        return get_db_pool().get_connection()
    except mysql.connector.Error as error:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {error}") from error


def format_date(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def map_row_to_public(row):
    return {
        "id": row["id"],
        "prenom": row["name"],
        "nom": row["surname"],
    }


def map_row_to_private(row):
    return {
        "id": row["id"],
        "prenom": row["name"],
        "nom": row["surname"],
        "email": row["email"],
        "dateOfBirth": format_date(row["date_of_birth"]),
        "ville": row["city"],
        "codePostal": row["postal_code"],
    }


def get_jwt_secret():
    return os.getenv("JWT_SECRET", "dev-secret-change-in-prod")


def create_access_token(admin_id: int, email: str):
    payload = {
        "sub": str(admin_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm="HS256")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def seed_admin():
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        return

    try:
        conn = get_db_connection()
    except HTTPException:
        return

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id FROM admins WHERE email = %s", (email,))
        if cursor.fetchone():
            return

        cursor.execute(
            "INSERT INTO admins (email, password_hash) VALUES (%s, %s)",
            (email, hash_password(password)),
        )
        conn.commit()
    except mysql.connector.Error:
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


@app.on_event("startup")
async def on_startup():
    seed_admin()


def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = jwt.decode(credentials.credentials, get_jwt_secret(), algorithms=["HS256"])
        return {
            "id": int(payload["sub"]),
            "email": payload["email"],
        }
    except (jwt.PyJWTError, ValueError, KeyError) as error:
        raise HTTPException(status_code=401, detail="Invalid token") from error


@app.post("/auth/login")
async def login_admin(credentials: AdminLogin):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, email, password_hash FROM admins WHERE email = %s",
            (credentials.email,),
        )
        admin = cursor.fetchone()
        if not admin or not verify_password(credentials.password, admin["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_access_token(admin["id"], admin["email"])
        return {"token": token, "email": admin["email"]}
    finally:
        cursor.close()
        conn.close()


@app.get("/users")
async def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, name, surname
            FROM users
            ORDER BY id
            """
        )
        records = cursor.fetchall()
        return {"users": [map_row_to_public(record) for record in records]}
    finally:
        cursor.close()
        conn.close()


@app.get("/users/{user_id}")
async def get_user(user_id: int, _admin=Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, name, surname, email, date_of_birth, city, postal_code
            FROM users
            WHERE id = %s
            """,
            (user_id,),
        )
        record = cursor.fetchone()
        if not record:
            raise HTTPException(status_code=404, detail="User not found")
        return map_row_to_private(record)
    finally:
        cursor.close()
        conn.close()


@app.post("/users", status_code=201)
async def create_user(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            INSERT INTO users (name, surname, email, date_of_birth, city, postal_code)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user.prenom,
                user.nom,
                user.email,
                user.dateOfBirth,
                user.ville,
                user.codePostal,
            ),
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.execute(
            """
            SELECT id, name, surname, email, date_of_birth, city, postal_code
            FROM users
            WHERE id = %s
            """,
            (user_id,),
        )
        created_user = cursor.fetchone()
        return map_row_to_private(created_user)
    finally:
        cursor.close()
        conn.close()


@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, _admin=Depends(get_current_admin)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
    finally:
        cursor.close()
        conn.close()
