import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from dotenv import load_dotenv
import ssl

load_dotenv()


def test_email_configuration():
    print("\nTesting Email Configuration...")
    print("==============================")

    # Verify required environment variables
    required_vars = ['SMTP_HOST', 'SMTP_PORT',
                     'SMTP_USER', 'SMTP_PASSWORD', 'FROM_EMAIL']
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print("\n❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"- {var}")
        return

    # Print configuration (without password)
    print("\nConfiguration:")
    print(f"SMTP Host: {os.getenv('SMTP_HOST')}")
    print(f"SMTP Port: {os.getenv('SMTP_PORT')}")
    print(f"SMTP User: {os.getenv('SMTP_USER')}")
    print(f"From Email: {os.getenv('FROM_EMAIL')}")

    try:
        print("\nSending test email...")

        # Create message
        message = MIMEMultipart()
        message["From"] = os.getenv('FROM_EMAIL')
        message["To"] = os.getenv('SMTP_USER')
        message["Subject"] = "Test Email Configuration"

        # Create the HTML content
        html = f"""
        <html>
          <body>
            <h1>Email Configuration Test</h1>
            <p>If you receive this email, your email configuration is working correctly!</p>
            <p>Time sent: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
          </body>
        </html>
        """

        message.attach(MIMEText(html, "html"))

        # Create SSL context
        context = ssl.create_default_context()

        # Connect to server
        with smtplib.SMTP(os.getenv('SMTP_HOST'), int(os.getenv('SMTP_PORT'))) as server:
            server.starttls(context=context)
            server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASSWORD'))
            server.send_message(message)

        print("\n✅ Email sent successfully!")
        print(
            f"Check your inbox ({os.getenv('SMTP_USER')}) for the test email.")

    except Exception as e:
        print("\n❌ Error sending email:")
        print(f"Error details: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Verify your App Password is correct")
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
    test_email_configuration()
