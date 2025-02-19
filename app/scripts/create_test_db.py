import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()


def create_test_database():
    # Connection parameters for the default PostgreSQL database
    params = {
        "host": os.getenv("POSTGRES_HOST"),
        "port": os.getenv("POSTGRES_PORT"),
        "user": os.getenv("POSTGRES_USER"),
        "password": os.getenv("POSTGRES_PASSWORD"),
        "database": "postgres"  # Connect to default database first
    }

    test_db_name = os.getenv("POSTGRES_DB") + "_test"

    try:
        # Connect to default database
        conn = psycopg2.connect(**params)
        conn.autocommit = True
        cursor = conn.cursor()

        # Check if test database exists
        cursor.execute(
            f"SELECT 1 FROM pg_database WHERE datname = '{test_db_name}'")
        exists = cursor.fetchone()

        if not exists:
            # Create test database
            cursor.execute(f'CREATE DATABASE "{test_db_name}"')
            print(f"Test database '{test_db_name}' created successfully")
        else:
            print(f"Test database '{test_db_name}' already exists")

    except Exception as e:
        print(f"Error creating test database: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    # Add the parent directory to the Python path
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent.parent))

    create_test_database()
