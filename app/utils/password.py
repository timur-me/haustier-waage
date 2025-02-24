import bcrypt
import secrets
import string
import logging
from typing import Dict

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: The plain password to hash

    Returns:
        str: The hashed password
    """
    # Hash the password with bcrypt (it handles salt internally)
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a stored hash.

    Args:
        plain_password: The plain password to verify
        hashed_password: The stored hashed password to compare against

    Returns:
        bool: True if the password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False


def generate_reset_token(length: int = 32) -> str:
    """
    Generate a secure random token for password reset.

    Args:
        length: Length of the token to generate

    Returns:
        A secure random string
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


class PasswordError(Exception):
    pass


def validate_password(password: str) -> Dict[str, bool]:
    """
    Validate password strength.

    Returns a dictionary with validation results for different criteria.
    """
    return {
        'length': len(password) >= 8,
        'uppercase': any(c.isupper() for c in password),
        'lowercase': any(c.islower() for c in password),
        'digit': any(c.isdigit() for c in password),
        'special': any(not c.isalnum() for c in password)
    }
