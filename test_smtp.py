import asyncio
import os
from dotenv import load_dotenv
from app.utils.email import send_email
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()


async def test_smtp_connection():
    """Test SMTP connection and email sending."""
    print("\nTesting SMTP Configuration...")
    print("============================")

    # Print configuration (without password)
    print("\nConfiguration:")
    print(f"SMTP Host: {os.getenv('SMTP_HOST')}")
    print(f"SMTP Port: {os.getenv('SMTP_PORT')}")
    print(f"SMTP User: {os.getenv('SMTP_USER')}")
    print(f"From Email: {os.getenv('FROM_EMAIL')}")

    try:
        # Send test email
        print("\nSending test email...")
        await send_email(
            to_email=os.getenv('SMTP_USER'),  # Send to self
            subject="SMTP Test Email",
            template_name="test_email.html",
            template_data={
                "test_message": "This is a test email to verify SMTP configuration.",
                "username": "Test User"
            }
        )
        print("\n✅ Email sent successfully!")
        print(
            f"Check your inbox ({os.getenv('SMTP_USER')}) for the test email.")

    except Exception as e:
        print("\n❌ Error sending email:")
        print(f"Error details: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Verify your Gmail App Password is correct")
        print("2. Ensure 2FA is enabled on your Gmail account")
        print("3. Check if less secure app access is disabled")
        print("4. Verify your network allows SMTP connections")
        print("\nFor Gmail specific setup:")
        print("1. Go to Google Account settings")
        print("2. Enable 2-Step Verification if not already enabled")
        print("3. Go to Security > App passwords")
        print("4. Generate a new app password for 'Mail'")
        print("5. Use that password in your .env file")

if __name__ == "__main__":
    asyncio.run(test_smtp_connection())
