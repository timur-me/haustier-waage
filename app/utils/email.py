from typing import List
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from fastapi import HTTPException
import os
from dotenv import load_dotenv
import ssl

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


async def send_email(
    to_email: str,
    subject: str,
    template_name: str,
    template_data: dict
) -> None:
    """
    Send an email using a template.

    Args:
        to_email: Recipient email address
        subject: Email subject
        template_name: Name of the template file (e.g., "reset_password.html")
        template_data: Dictionary of data to be used in the template
    """
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL]):
        raise HTTPException(
            status_code=500,
            detail="Email configuration is incomplete"
        )

    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = subject

        # Render template
        template = template_env.get_template(template_name)
        html_content = template.render(**template_data)

        # Attach HTML content
        message.attach(MIMEText(html_content, "html"))

        # Configure SSL context
        ssl_context = ssl.create_default_context()

        # Send email using STARTTLS
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True,
            tls_context=ssl_context
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
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
