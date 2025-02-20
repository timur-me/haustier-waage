import os
import uuid
from datetime import datetime, timedelta, UTC
import random
from pathlib import Path
from typing import List

from dotenv import load_dotenv
import psycopg2
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import bcrypt

from app.models import Base, User, Animal, Weight, Media
from app.database import engine

load_dotenv()

# Configuration
MEDIA_DIR = Path("media_uploads")
MEDIA_DIR.mkdir(exist_ok=True)

# Sample data
USERS = [
    {
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "Password123!"
    },
    {
        "username": "jane_smith",
        "email": "jane@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "password": "Password123!"
    },
    {
        "username": "pet_lover",
        "email": "pet.lover@example.com",
        "first_name": "Alex",
        "last_name": "Johnson",
        "password": "Password123!"
    },
    {
        "username": "animal_care",
        "email": "care@example.com",
        "first_name": "Sarah",
        "last_name": "Wilson",
        "password": "Password123!"
    },
    {
        "username": "vet_clinic",
        "email": "vet@example.com",
        "first_name": "Michael",
        "last_name": "Brown",
        "password": "Password123!"
    }
]

ANIMALS = [
    ("Max", "German Shepherd", "dog"),
    ("Luna", "Siamese", "cat"),
    ("Rocky", "Golden Retriever", "dog"),
    ("Bella", "Persian", "cat"),
    ("Charlie", "Labrador", "dog"),
    ("Milo", "Maine Coon", "cat"),
    ("Lucy", "Beagle", "dog"),
    ("Oliver", "British Shorthair", "cat"),
    ("Daisy", "Poodle", "dog"),
    ("Leo", "Ragdoll", "cat"),
    ("Cooper", "Husky", "dog"),
    ("Lily", "Scottish Fold", "cat"),
    ("Tucker", "Bulldog", "dog"),
    ("Kitty", "Sphynx", "cat"),
    ("Bailey", "Rottweiler", "dog")
]


def create_sample_media(filename: str, content_type: str = "image/jpeg", size: int = 1024) -> Media:
    """Create a sample media record."""
    return Media(
        id=uuid.uuid4(),
        filename=filename,
        content_type=content_type,
        size=size,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )


def create_sample_user(user_data: dict, profile_picture: Media) -> User:
    """Create a sample user with hashed password."""
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(user_data["password"].encode('utf-8'), salt)

    return User(
        id=uuid.uuid4(),
        username=user_data["username"],
        email=user_data["email"],
        email_verified=True,
        password_hash=password_hash.decode('utf-8'),
        salt=salt.decode('utf-8'),
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        profile_picture_id=profile_picture.id,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )


def create_sample_animal(name: str, breed: str, species: str, owner: User, profile_picture: Media) -> Animal:
    """Create a sample animal."""
    return Animal(
        id=uuid.uuid4(),
        owner_id=owner.id,
        name=name,
        description=f"A lovely {breed} {species}",
        species=species,
        breed=breed,
        birth_date=datetime.now(UTC).date() -
        timedelta(days=random.randint(180, 1800)),
        profile_picture_id=profile_picture.id,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )


def create_weight_entries(animal: Animal, num_entries: int) -> List[Weight]:
    """Create sample weight entries for an animal."""
    base_weight = random.uniform(
        3.0, 30.0)  # Random starting weight between 3 and 30 kg
    weights = []

    for i in range(num_entries):
        # Add some random variation to weight (-0.5 to +0.5 kg)
        weight_variation = random.uniform(-0.5, 0.5)
        entry_date = datetime.now(UTC) - timedelta(days=num_entries-i)

        weights.append(Weight(
            id=uuid.uuid4(),
            animal_id=animal.id,
            weight=round(base_weight + weight_variation, 2),
            date=entry_date,
            created_at=entry_date,
            updated_at=entry_date
        ))

        # Slightly increase base weight over time
        base_weight += random.uniform(0.0, 0.2)

    return weights


def setup_database():
    """Set up the database and populate it with sample data."""
    try:
        # Drop all tables if they exist
        Base.metadata.drop_all(engine)
        print("Dropped existing tables")

        # Create all tables
        Base.metadata.create_all(engine)
        print("Created new tables")

        # Create a session
        Session = sessionmaker(bind=engine)
        db = Session()

        try:
            # Create sample data
            for user_data in USERS:
                # Create profile picture for user
                user_media = create_sample_media(
                    f"user_{user_data['username']}_profile.jpg")
                db.add(user_media)

                # Create user
                user = create_sample_user(user_data, user_media)
                db.add(user)

                # Create 3-5 animals for each user
                num_animals = random.randint(3, 5)
                for i in range(num_animals):
                    # Select a random animal from the list
                    animal_name, breed, species = random.choice(ANIMALS)

                    # Create profile picture for animal
                    animal_media = create_sample_media(
                        f"animal_{animal_name.lower()}_profile.jpg")
                    db.add(animal_media)

                    # Create animal
                    animal = create_sample_animal(
                        animal_name, breed, species, user, animal_media)
                    db.add(animal)

                    # Create 20-30 weight entries for the animal
                    num_weights = random.randint(20, 30)
                    weights = create_weight_entries(animal, num_weights)
                    for weight in weights:
                        db.add(weight)

            # Commit all changes
            db.commit()
            print("Successfully populated database with sample data!")

        except Exception as e:
            db.rollback()
            print(f"Error populating database: {e}")
            raise
        finally:
            db.close()

    except Exception as e:
        print(f"Error setting up database: {e}")
        raise


if __name__ == "__main__":
    setup_database()
