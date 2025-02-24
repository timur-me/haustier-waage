from typing import List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from fastapi import HTTPException
import os
from dotenv import load_dotenv
import ssl
import logging
from datetime import datetime
import asyncio
from functools import partial
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")

# Initialize Jinja2 environment for email templates
template_dir = Path(__file__).parent.parent / "templates" / "email"
template_env = Environment(loader=FileSystemLoader(str(template_dir)))


def _send_email_sync(
    to_email: str,
    subject: str,
    template_name: str,
    template_data: dict
) -> None:
    """Send an email synchronously."""
    try:
        # Load and render template
        template = template_env.get_template(template_name)
        template_data['current_time'] = datetime.now().strftime(
            '%Y-%m-%d %H:%M:%S')
        html_content = template.render(**template_data)

        # Create message
        message = MIMEMultipart()
        message["From"] = f"Pet Weight Monitor <{FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(html_content, "html"))

        logger.debug(f"Attempting to send email to {to_email}")
        logger.debug(f"Using template: {template_name}")
        logger.debug(f"Template data: {template_data}")

        # Create SSL context
        context = ssl.create_default_context()

        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(message)

        logger.info(f"Email sent successfully to {to_email}")

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}")
        logger.debug(f"Error details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send email"
        )


async def send_email(
    to_email: str,
    subject: str,
    template_name: str,
    template_data: dict
) -> None:
    """Send an email asynchronously."""
    logger.debug(f"Preparing to send email to {to_email}")
    try:
        # Run email sending in a thread pool
        await asyncio.get_event_loop().run_in_executor(
            None,
            partial(_send_email_sync, to_email, subject,
                    template_name, template_data)
        )
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}")
        logger.debug(f"Error details: {str(e)}")
        raise


async def send_password_reset_email(
    to_email: str,
    reset_token: str,
    username: str
) -> None:
    """Send a password reset email."""
    logger.debug(f"Preparing password reset email for {username}")
    try:
        await send_email(
            to_email=to_email,
            subject="Password Reset Request",
            template_name="reset_password.html",
            template_data={
                "reset_url": f"{FRONTEND_URL}/reset-password/{reset_token}",
                "username": username
            }
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}")
        logger.debug(f"Error details: {str(e)}")
        raise


async def send_verification_email(
    to_email: str,
    verification_token: str,
    username: str
) -> None:
    """Send an email verification link."""
    logger.debug(f"Preparing verification email for {username}")
    try:
        await send_email(
            to_email=to_email,
            subject="Verify Your Email",
            template_name="verify_email.html",
            template_data={
                "verify_url": f"{FRONTEND_URL}/verify-email/{verification_token}",
                "username": username
            }
        )
    except Exception as e:
        logger.error(f"Failed to send verification email to {to_email}")
        logger.debug(f"Error details: {str(e)}")
        raise
