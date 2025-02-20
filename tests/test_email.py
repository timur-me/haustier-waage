from app.utils.email import send_email, SMTP_HOST, SMTP_PORT, SMTP_USER, FROM_EMAIL
import os
import sys
import logging
import asyncio
from dotenv import load_dotenv

# Add the project root directory to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_smtp_connection():
    """Test SMTP connection and send a test email."""
    try:
        # Print SMTP configuration (excluding password)
        logger.info("Testing SMTP Configuration:")
        logger.info(f"SMTP Host: {SMTP_HOST}")
        logger.info(f"SMTP Port: {SMTP_PORT}")
        logger.info(f"SMTP User: {SMTP_USER}")
        logger.info(f"From Email: {FROM_EMAIL}")

        # Send test email
        await send_email(
            to_email=SMTP_USER,  # Send to self
            subject="Test Email",
            template_name="reset_password.html",  # Using reset password template for test
            template_data={
                "reset_url": "https://example.com/reset",
                "username": "Test User"
            }
        )
        logger.info("✅ Test email sent successfully!")

    except Exception as e:
        logger.error(f"❌ Error during test: {str(e)}")
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
    load_dotenv()
    asyncio.run(test_smtp_connection())
