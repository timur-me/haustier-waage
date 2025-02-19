from dotenv import load_dotenv
import os
import psycopg2
from .create_test_db import create_test_database
from .seed_db import seed_database

load_dotenv()


def setup_main_database():
    # Connection parameters for the default PostgreSQL database
    params = {
        "host": os.getenv("POSTGRES_HOST"),
        "port": os.getenv("POSTGRES_PORT"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
        "database": "postgres"  # Connect to default database first
    }

    db_name = os.getenv("POSTGRES_DB")

    try:
        # Connect to default database
        conn = psycopg2.connect(**params)
        conn.autocommit = True
        cursor = conn.cursor()

        # Check if main database exists
        cursor.execute(
            f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()

        if not exists:
            # Create main database
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"Main database '{db_name}' created successfully")
        else:
            print(f"Main database '{db_name}' already exists")

    except Exception as e:
        print(f"Error creating main database: {e}")
    finally:
        cursor.close()
        conn.close()


def setup_all():
    print("Setting up main database...")
    setup_main_database()

    print("\nSetting up test database...")
    create_test_database()

    print("\nSeeding main database with sample data...")
    seed_database()

    print("\nDatabase setup completed!")


if __name__ == "__main__":
    # Add the parent directory to the Python path
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent.parent))

    setup_all()
