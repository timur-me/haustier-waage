from app.utils.email import send_email, SMTP_HOST, SMTP_PORT, SMTP_USER, FROM_EMAIL
import os
import sys
import pytest
import traceback
import logging

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@pytest.mark.asyncio
async def test_smtp_connection():
    """Test SMTP connection and email sending."""
    try:
        # Log SMTP configuration
        logger.info("SMTP Configuration:")
        logger.info(f"SMTP_HOST: {SMTP_HOST}")
        logger.info(f"SMTP_PORT: {SMTP_PORT}")
        logger.info(f"SMTP_USER: {SMTP_USER}")
        logger.info(f"FROM_EMAIL: {FROM_EMAIL}")

        if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, FROM_EMAIL]):
            logger.error("Missing required SMTP configuration!")
            logger.error(f"SMTP_HOST present: {bool(SMTP_HOST)}")
            logger.error(f"SMTP_PORT present: {bool(SMTP_PORT)}")
            logger.error(f"SMTP_USER present: {bool(SMTP_USER)}")
            logger.error(f"FROM_EMAIL present: {bool(FROM_EMAIL)}")
            raise ValueError("Missing required SMTP configuration")

        # Send test email to the configured SMTP user
        logger.info(f"Attempting to send test email to: {SMTP_USER}")

        template_data = {
            "username": "Test User",
            "message": "This is a test email to verify SMTP functionality."
        }
        logger.info(f"Using template data: {template_data}")

        await send_email(
            to_email=SMTP_USER,  # Send to the configured email
            subject="Test Email",
            template_name="test_email.html",
            template_data=template_data
        )
        logger.info("Test email sent successfully")

    except Exception as e:
        logger.error(f"Error sending test email: {str(e)}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
        logger.info("\nTroubleshooting Tips:")
        logger.info("1. Verify your Gmail App Password is correct")
        logger.info("2. Ensure 2FA is enabled on your Gmail account")
        logger.info("3. Check if less secure app access is disabled")
        logger.info("4. Verify your network settings allow SMTP connections")
        logger.info("\nFor Gmail setup:")
        logger.info("1. Go to Google Account settings")
        logger.info("2. Enable 2-Step Verification if not already enabled")
        logger.info("3. Generate a new App Password:")
        logger.info("   - Go to Security > 2-Step Verification")
        logger.info("   - Scroll to bottom and click on 'App passwords'")
        logger.info("   - Select 'Mail' and your device")
        logger.info("   - Use the generated password in your .env file")
        raise


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_smtp_connection())
