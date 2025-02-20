import bcrypt
import secrets
import string
import re
from typing import Tuple, Dict


def hash_password(password: str) -> Tuple[str, str]:
    """
    Hash a password using bcrypt with a random salt.

    Args:
        password: The plain text password to hash

    Returns:
        A tuple of (hashed_password, salt) as strings
    """
    # Generate a random salt
    salt = bcrypt.gensalt()

    # Hash the password with the salt
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

    # Return both as strings for storage
    return hashed.decode('utf-8'), salt.decode('utf-8')


def verify_password(password: str, hashed_password: str, salt: str) -> bool:
    """
    Verify a password against its hash and salt.

    Args:
        password: The plain text password to verify
        hashed_password: The stored hashed password
        salt: The stored salt used in hashing

    Returns:
        True if the password matches, False otherwise
    """
    # Encode strings back to bytes
    password_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')

    # Hash the provided password with the stored salt
    computed_hash = bcrypt.hashpw(password_bytes, salt_bytes)

    # Compare the computed hash with the stored hash
    return computed_hash == hashed_bytes


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
    Returns a dictionary of validation results or raises PasswordError.
    """
    validations = {
        'length': len(password) >= 8,
        'uppercase': bool(re.search(r'[A-Z]', password)),
        'lowercase': bool(re.search(r'[a-z]', password)),
        'numbers': bool(re.search(r'[0-9]', password)),
        'special': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    }

    if not all(validations.values()):
        errors = []
        if not validations['length']:
            errors.append("Password must be at least 8 characters long")
        if not validations['uppercase']:
            errors.append(
                "Password must contain at least one uppercase letter")
        if not validations['lowercase']:
            errors.append(
                "Password must contain at least one lowercase letter")
        if not validations['numbers']:
            errors.append("Password must contain at least one number")
        if not validations['special']:
            errors.append(
                "Password must contain at least one special character")
        raise PasswordError(". ".join(errors))

    return validations
