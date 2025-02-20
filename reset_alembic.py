from app.database import engine
from sqlalchemy import text


def reset_alembic():
    with engine.connect() as connection:
        # Drop the alembic_version table if it exists
        connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
        connection.commit()


if __name__ == "__main__":
    reset_alembic()
    print("Alembic version table has been reset.")
