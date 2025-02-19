"""add_date_to_weights

Revision ID: b1c953bf7e03
Revises: 
Create Date: 2024-03-19 15:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c953bf7e03'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add date column
    op.add_column('weights', sa.Column(
        'date', sa.DateTime(timezone=True), nullable=True))

    # Copy created_at values to date
    op.execute('UPDATE weights SET date = created_at')

    # Make date column not nullable
    op.alter_column('weights', 'date', nullable=False)


def downgrade() -> None:
    op.drop_column('weights', 'date')
