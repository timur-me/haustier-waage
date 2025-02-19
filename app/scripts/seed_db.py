from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
from ..models import User, Animal, Weight
from ..database import SessionLocal
import os

load_dotenv()


def seed_database():
    db = SessionLocal()
    try:
        # Create sample users
        users = [
            User(
                id=uuid.uuid4(),
                username="john_doe",
                created_at=datetime.utcnow()
            ),
            User(
                id=uuid.uuid4(),
                username="jane_smith",
                created_at=datetime.utcnow()
            ),
            User(
                id=uuid.uuid4(),
                username="pet_lover",
                created_at=datetime.utcnow()
            )
        ]

        for user in users:
            db.add(user)
        db.commit()

        # Create animals for each user
        animals = []
        pet_names = [
            ("Max", "German Shepherd"),
            ("Luna", "Siamese Cat"),
            ("Rocky", "Golden Retriever"),
            ("Bella", "Persian Cat"),
            ("Charlie", "Labrador"),
            ("Milo", "Maine Coon"),
            ("Lucy", "Beagle"),
            ("Oliver", "British Shorthair"),
            ("Daisy", "Poodle")
        ]

        for i, user in enumerate(users):
            # Each user gets 3 pets
            for j in range(3):
                pet_index = i * 3 + j
                animal = Animal(
                    id=uuid.uuid4(),
                    owner_id=user.id,
                    name=f"{pet_names[pet_index][0]} ({pet_names[pet_index][1]})",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(animal)
                animals.append(animal)
        db.commit()

        # Create weight entries for each animal
        for animal in animals:
            # Generate 6 months of weekly weight entries
            # Random starting weight between 5 and 20 kg
            base_weight = 5.0 + (uuid.uuid4().int % 15)
            for week in range(26):  # 26 weeks = 6 months
                # Add some random variation to weight
                # Random variation between -0.5 and 0.5
                weight_variation = (uuid.uuid4().int % 10) / 10 - 0.5
                weight = Weight(
                    id=uuid.uuid4(),
                    animal_id=animal.id,
                    weight=round(base_weight + weight_variation, 2),
                    created_at=datetime.utcnow() - timedelta(weeks=26-week),
                    updated_at=datetime.utcnow() - timedelta(weeks=26-week)
                )
                db.add(weight)
                # Slightly increase base weight over time
                base_weight += 0.1
        db.commit()

        print("Database seeded successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {len(animals)} animals")
        print(f"Created {len(animals) * 26} weight entries")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Add the parent directory to the Python path
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent.parent))

    seed_database()
