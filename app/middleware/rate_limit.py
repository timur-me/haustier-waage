from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import time
from collections import defaultdict
import os
from dotenv import load_dotenv

load_dotenv()

# Rate limiting configuration
RATE_LIMIT_WINDOW = int(
    os.getenv('RATE_LIMIT_WINDOW', 3600))  # 1 hour in seconds
MAX_ATTEMPTS = int(os.getenv('MAX_ATTEMPTS', 5))

# Store login attempts in memory (consider using Redis in production)
login_attempts = defaultdict(list)


async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/auth/login":
        client_ip = request.client.host
        current_time = time.time()

        # Clean up old attempts
        login_attempts[client_ip] = [
            attempt_time for attempt_time in login_attempts[client_ip]
            if current_time - attempt_time < RATE_LIMIT_WINDOW
        ]

        # Check if too many attempts
        if len(login_attempts[client_ip]) >= MAX_ATTEMPTS:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many login attempts. Please try again later."
                }
            )

        # Record this attempt
        login_attempts[client_ip].append(current_time)

    response = await call_next(request)
    return response
