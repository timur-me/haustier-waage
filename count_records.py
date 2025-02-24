from sqlalchemy import func
from app.database import SessionLocal
from app.models import User, Animal, Weight, Media


def count_records():
    db = SessionLocal()
    try:
        user_count = db.query(func.count(User.id)).scalar()
        animal_count = db.query(func.count(Animal.id)).scalar()
        weight_count = db.query(func.count(Weight.id)).scalar()
        media_count = db.query(func.count(Media.id)).scalar()

        print("\nRecord Counts:")
        print("=============")
        print(f"Users: {user_count}")
        print(f"Animals: {animal_count}")
        print(f"Weights: {weight_count}")
        print(f"Media: {media_count}")

        # Print some sample data
        print("\nSample Users:")
        print("============")
        users = db.query(User).limit(3).all()
        for user in users:
            print(f"- {user.username} ({user.email})")
            animals = db.query(Animal).filter(Animal.owner_id == user.id).all()
            print(f"  Animals: {len(animals)}")
            for animal in animals:
                weights = db.query(Weight).filter(
                    Weight.animal_id == animal.id).count()
                print(
                    f"  - {animal.name} ({animal.species}, {animal.breed}): {weights} weight entries")

    finally:
        db.close()


if __name__ == "__main__":
    count_records()
