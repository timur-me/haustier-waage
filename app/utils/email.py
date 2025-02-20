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

# Initialize Jinja2 environment for email templates
template_env = Environment(
    loader=FileSystemLoader("app/templates/email")
)


def _send_email_sync(
    to_email: str,
    subject: str,
    template_name: str,
    template_data: dict
) -> None:
    """
    Synchronous implementation of email sending.
    """
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL]):
        missing_vars = [
            var for var, val in {
                "SMTP_HOST": SMTP_HOST,
                "SMTP_PORT": SMTP_PORT,
                "SMTP_USER": SMTP_USER,
                "SMTP_PASSWORD": SMTP_PASSWORD,
                "FROM_EMAIL": FROM_EMAIL
            }.items() if not val
        ]
        error_msg = f"Email configuration is incomplete. Missing: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=500,
            detail=error_msg
        )

    try:
        logger.info(f"Preparing to send email to {to_email}")
        logger.info(f"Using template: {template_name}")

        # Add current time to template data
        template_data = {
            **template_data,
            "current_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        # Load and render template
        logger.info("Loading and rendering email template...")
        template = template_env.get_template(template_name)
        html_content = template.render(**template_data)
        logger.info("Template rendered successfully")

        # Create message
        logger.info("Creating email message...")
        message = MIMEMultipart("alternative")
        message["From"] = FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = subject

        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        logger.info("Email message created successfully")

        # Create SSL context
        logger.info("Setting up SSL context...")
        context = ssl.create_default_context()

        # Create SMTP connection
        logger.info(f"Connecting to SMTP server {SMTP_HOST}:{SMTP_PORT}...")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            logger.info("Initial EHLO...")
            server.ehlo()
            logger.info("Starting TLS...")
            server.starttls(context=context)
            logger.info("Second EHLO...")
            server.ehlo()
            logger.info("Logging in...")
            server.login(SMTP_USER, SMTP_PASSWORD)
            logger.info("Sending message...")
            server.send_message(message)
            logger.info(f"Email sent successfully to {to_email}")

    except smtplib.SMTPException as e:
        error_msg = f"SMTP error while sending email to {to_email}: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=500,
            detail="Failed to send email. Please try again later."
        )
    except Exception as e:
        error_msg = f"Failed to send email to {to_email}: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(
            status_code=500,
            detail="Failed to send email. Please try again later."
        )


async def send_email(
    to_email: str,
    subject: str,
    template_name: str,
    template_data: dict
) -> None:
    """
    Asynchronous wrapper for sending an email using a template.

    Args:
        to_email: Recipient email address
        subject: Email subject
        template_name: Name of the template file (e.g., "reset_password.html")
        template_data: Dictionary of data to be used in the template
    """
    # Run the synchronous email sending function in a thread pool
    await asyncio.get_event_loop().run_in_executor(
        None,
        partial(_send_email_sync, to_email, subject,
                template_name, template_data)
    )


async def send_password_reset_email(
    to_email: str,
    reset_token: str,
    username: str
) -> None:
    """
    Send a password reset email to a user.

    Args:
        to_email: User's email address
        reset_token: Password reset token
        username: User's username
    """
    reset_url = f"http://localhost:4200/reset-password?token={reset_token}"
    template_data = {
        "username": username,
        "reset_url": reset_url
    }

    await send_email(
        to_email=to_email,
        subject="Password Reset Request",
        template_name="reset_password.html",
        template_data=template_data
    )


async def send_verification_email(
    to_email: str,
    verification_token: str,
    username: str
) -> None:
    """
    Send an email verification link to a user.

    Args:
        to_email: User's email address
        verification_token: Email verification token
        username: User's username
    """
    verify_url = f"http://localhost:4200/verify-email?token={verification_token}"
    template_data = {
        "username": username,
        "verify_url": verify_url
    }

    await send_email(
        to_email=to_email,
        subject="Verify Your Email",
        template_name="verify_email.html",
        template_data=template_data
    )
