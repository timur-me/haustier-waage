import os
import uuid
from datetime import datetime, timedelta, UTC
import random
from pathlib import Path
from typing import List
import shutil

from sqlalchemy.orm import Session
import bcrypt

from app.models import Base, User, Animal, Weight, Media
from app.database import engine, SessionLocal
from app.utils.password import hash_password

# Configuration
IMAGES_DIR = Path("app/assets/images")

# Sample user data
USERS = [
    {
        "username": "sarah_pet_lover",
        "email": "sarah@example.com",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "password": "SecurePass123!",
        "profile_picture": "22549724-eeae-4aa0-a57a-32dc1014fda9.jpg"  # Use existing image
    },
    {
        "username": "mike_animal_care",
        "email": "mike@example.com",
        "first_name": "Mike",
        "last_name": "Wilson",
        "password": "SecurePass123!",
        "profile_picture": "0b69c879-7ae1-45ad-8bfd-54b9c3b47eb7.jpg"  # Use existing image
    }
]

# Sample animal data - 3 for each user
ANIMALS = [
    # Sarah's pets
    ("Luna", "Siamese", "cat", "2d572ba6-b01a-49ac-b910-e772041f65cc.jpg"),
    ("Max", "German Shepherd", "dog", "486eb264-9d80-4317-a1ed-6f1e80adf9fd.jpg"),
    ("Oliver", "British Shorthair", "cat",
     "e4d67d8f-56d3-4051-8320-09edf2236d13.jpg"),
    # Mike's pets
    ("Rocky", "Golden Retriever", "dog", "1eb35cfd-ff67-4ceb-aa5c-5ee733174307.jpg"),
    ("Bella", "Persian", "cat", "cb60183e-3c37-4b5e-bc39-e291e1c9e06d.jpg"),
    ("Charlie", "Labrador", "dog", "fc277a22-1965-484f-9b8e-5a3b98ee2ced.jpg")
]


def create_media(db: Session, filename: str, content_type: str = None) -> Media:
    """Create a media record for an existing image."""
    if content_type is None:
        # Determine content type from extension
        ext = filename.split('.')[-1].lower()
        content_type = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'svg': 'image/svg+xml'
        }.get(ext, 'application/octet-stream')

    # Get file size
    file_path = IMAGES_DIR / filename
    size = file_path.stat().st_size if file_path.exists() else 0

    media = Media(
        id=uuid.uuid4(),
        filename=filename,
        content_type=content_type,
        size=size,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


def create_user(db: Session, user_data: dict) -> User:
    """Create a user with profile picture."""
    # Create media for profile picture
    profile_picture = create_media(db, user_data['profile_picture'])

    user = User(
        id=uuid.uuid4(),
        username=user_data['username'],
        email=user_data['email'],
        email_verified=True,
        password_hash=hash_password(user_data['password']),
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        profile_picture_id=profile_picture.id,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_animal(db: Session, name: str, breed: str, species: str, owner: User, profile_picture_filename: str) -> Animal:
    """Create an animal with profile picture."""
    # Create media for profile picture
    profile_picture = create_media(db, profile_picture_filename)

    animal = Animal(
        id=uuid.uuid4(),
        owner_id=owner.id,
        name=name,
        description=f"A lovely {breed} {species}",
        species=species,
        breed=breed,
        profile_picture_id=profile_picture.id,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    db.add(animal)
    db.commit()
    db.refresh(animal)
    return animal


def create_weight_entries(db: Session, animal: Animal, num_entries: int) -> List[Weight]:
    """Create weight entries for an animal with realistic data."""
    weights = []
    base_weight = {
        'cat': random.uniform(3.5, 4.5),  # Starting weight for cats
        'dog': random.uniform(20.0, 30.0)  # Starting weight for dogs
    }[animal.species]

    # Generate entries over the past year
    end_date = datetime.now(UTC)
    start_date = end_date - timedelta(days=365)

    dates = sorted([start_date + timedelta(days=random.randint(0, 365))
                   for _ in range(num_entries)])

    # Add some realistic weight fluctuation
    current_weight = base_weight
    for date in dates:
        # Add small random fluctuation (-2% to +2%)
        fluctuation = random.uniform(-0.02, 0.02)
        current_weight *= (1 + fluctuation)

        weight = Weight(
            id=uuid.uuid4(),
            animal_id=animal.id,
            weight=round(current_weight, 2),
            date=date,
            created_at=date,
            updated_at=date
        )
        weights.append(weight)
        db.add(weight)

    db.commit()
    return weights


def seed_production_data():
    """Main function to seed production data."""
    db = SessionLocal()
    try:
        print("Creating users...")
        users = [create_user(db, user_data) for user_data in USERS]

        print("Creating animals...")
        for i, (name, breed, species, profile_pic) in enumerate(ANIMALS):
            # First 3 animals for first user, next 3 for second user
            owner = users[i // 3]
            animal = create_animal(
                db, name, breed, species, owner, profile_pic)

            print(f"Creating weight entries for {animal.name}...")
            num_entries = random.randint(20, 30)
            create_weight_entries(db, animal, num_entries)

        print("Data seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_production_data()
