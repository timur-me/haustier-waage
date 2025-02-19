"""add_database_triggers

Revision ID: c1d953bf7e04
Revises: b1c953bf7e03
Create Date: 2024-03-19 16:45:00.000000

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c1d953bf7e04'
down_revision: Union[str, None] = 'b1c953bf7e03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create notify functions
    op.execute("""
        CREATE OR REPLACE FUNCTION notify_animal_change()
        RETURNS trigger AS $$
        DECLARE
            owner_id text;
        BEGIN
            IF TG_OP = 'DELETE' THEN
                owner_id = OLD.owner_id;
            ELSE
                owner_id = NEW.owner_id;
            END IF;
            
            PERFORM pg_notify(
                'db_changes',
                json_build_object(
                    'table', 'animals',
                    'operation', TG_OP,
                    'owner_id', owner_id,
                    'data', CASE
                        WHEN TG_OP = 'DELETE' THEN json_build_object('id', OLD.id)
                        ELSE json_build_object(
                            'id', NEW.id,
                            'name', NEW.name,
                            'owner_id', NEW.owner_id,
                            'created_at', NEW.created_at,
                            'updated_at', NEW.updated_at
                        )
                    END
                )::text
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE OR REPLACE FUNCTION notify_weight_change()
        RETURNS trigger AS $$
        DECLARE
            owner_id text;
        BEGIN
            IF TG_OP = 'DELETE' THEN
                SELECT a.owner_id INTO owner_id
                FROM animals a
                WHERE a.id = OLD.animal_id;
            ELSE
                SELECT a.owner_id INTO owner_id
                FROM animals a
                WHERE a.id = NEW.animal_id;
            END IF;
            
            PERFORM pg_notify(
                'db_changes',
                json_build_object(
                    'table', 'weights',
                    'operation', TG_OP,
                    'owner_id', owner_id,
                    'data', CASE
                        WHEN TG_OP = 'DELETE' THEN json_build_object(
                            'id', OLD.id,
                            'animal_id', OLD.animal_id
                        )
                        ELSE json_build_object(
                            'id', NEW.id,
                            'animal_id', NEW.animal_id,
                            'weight', NEW.weight,
                            'date', NEW.date,
                            'created_at', NEW.created_at,
                            'updated_at', NEW.updated_at
                        )
                    END
                )::text
            );
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Create triggers
    op.execute("""
        CREATE TRIGGER animal_changes
        AFTER INSERT OR UPDATE OR DELETE ON animals
        FOR EACH ROW EXECUTE FUNCTION notify_animal_change();
    """)

    op.execute("""
        CREATE TRIGGER weight_changes
        AFTER INSERT OR UPDATE OR DELETE ON weights
        FOR EACH ROW EXECUTE FUNCTION notify_weight_change();
    """)


def downgrade() -> None:
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS animal_changes ON animals;")
    op.execute("DROP TRIGGER IF EXISTS weight_changes ON weights;")

    # Drop functions
    op.execute("DROP FUNCTION IF EXISTS notify_animal_change;")
    op.execute("DROP FUNCTION IF EXISTS notify_weight_change;")
