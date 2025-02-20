from sqlalchemy import inspect, MetaData, Table
from app.database import engine


def check_schema():
    inspector = inspect(engine)

    print("\nDatabase Schema:")
    print("===============")

    for table_name in inspector.get_table_names():
        print(f"\nTable: {table_name}")
        print("Columns:")
        for column in inspector.get_columns(table_name):
            print(f"  - {column['name']}: {column['type']}")

        print("Indexes:")
        for index in inspector.get_indexes(table_name):
            print(f"  - {index['name']}: {', '.join(index['column_names'])}")


if __name__ == "__main__":
    check_schema()
