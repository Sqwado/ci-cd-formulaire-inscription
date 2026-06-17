import os
from datetime import date, datetime

import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()
origins = ["*"]

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
    email: str = Field(min_length=3)
    dateOfBirth: str = Field(min_length=1)
    ville: str = Field(min_length=1)
    codePostal: str = Field(min_length=1)


class UserRead(UserCreate):
    id: int


def get_db_connection():
    try:
        return mysql.connector.connect(
            database=os.getenv("MYSQL_DATABASE"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_ROOT_PASSWORD"),
            port=3306,
            host=os.getenv("MYSQL_HOST"),
        )
    except mysql.connector.Error as error:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {error}") from error


def format_date(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value)


def map_row_to_user(row):
    return {
        "id": row["id"],
        "prenom": row["name"],
        "nom": row["surname"],
        "email": row["email"],
        "dateOfBirth": format_date(row["date_of_birth"]),
        "ville": row["city"],
        "codePostal": row["postal_code"],
    }


@app.get("/users")
async def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, name, surname, email, date_of_birth, city, postal_code
            FROM users
            ORDER BY id
            """
        )
        records = cursor.fetchall()
        return {"users": [map_row_to_user(record) for record in records]}
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
        return map_row_to_user(created_user)
    finally:
        cursor.close()
        conn.close()
