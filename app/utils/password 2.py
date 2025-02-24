import hashlib
import os
import base64
from typing import Tuple


def generate_salt() -> str:
    """Generate a random salt for password hashing."""
    return base64.b64encode(os.urandom(32)).decode('utf-8')


def hash_password(password: str, salt: str) -> str:
    """Hash a password with the given salt using PBKDF2."""
    # Convert the password and salt to bytes
    password_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')

    # Use PBKDF2 with SHA256
    key = hashlib.pbkdf2_hmac(
        'sha256',  # Hash algorithm
        password_bytes,  # Password
        salt_bytes,  # Salt
        100000,  # Number of iterations
        dklen=32  # Length of the derived key
    )

    # Return base64 encoded hash
    return base64.b64encode(key).decode('utf-8')


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    """Verify a password against a hash."""
    return hash_password(password, salt) == password_hash
