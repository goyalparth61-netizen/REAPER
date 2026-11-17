import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings
from app.core.logging import logger


class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.use_tls = settings.SMTP_TLS

    def is_configured(self) -> bool:
        return bool(self.host and self.username and self.password)

    def send_verification_email(self, to_email: str, code: str) -> bool:
        subject = "Verify your REAPER Engineer Account"
        html_content = f"""
        <div style="background-color: #101713; color: #E8E6DD; padding: 32px; font-family: sans-serif; border-radius: 8px;">
            <h2 style="color: #42D6A4; margin-bottom: 8px;">REAPER // Autonomous Software Repair Engine</h2>
            <p style="color: #89998E; font-size: 14px;">Welcome to REAPER. Use the code below to verify your email address:</p>
            <div style="background-color: #1D3026; border: 1px solid #42D6A4; padding: 16px 24px; border-radius: 6px; display: inline-block; margin: 16px 0;">
                <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #42D6A4;">{code}</span>
            </div>
            <p style="color: #89998E; font-size: 12px;">This code will expire in {settings.VERIFICATION_CODE_EXPIRE_MINUTES} minutes.</p>
            <hr style="border: 0; border-top: 1px solid #18251E; margin: 24px 0;" />
            <p style="color: #C9A96E; font-size: 11px;">Built by CiPher • Engineering autonomous software repair.</p>
        </div>
        """
        
        # Always log to structured log for immediate testing convenience
        logger.info(f"[EMAIL SERVICE] Verification code for {to_email}: {code}")

        if not self.is_configured():
            return True

        return self._send_smtp(to_email, subject, html_content)

    def send_password_reset_email(self, to_email: str, token: str) -> bool:
        subject = "Reset your REAPER Account Password"
        reset_url = f"{settings.FRONTEND_ORIGIN}/?reset_token={token}&email={to_email}"
        html_content = f"""
        <div style="background-color: #101713; color: #E8E6DD; padding: 32px; font-family: sans-serif; border-radius: 8px;">
            <h2 style="color: #C9A96E; margin-bottom: 8px;">REAPER // Password Recovery</h2>
            <p style="color: #89998E; font-size: 14px;">A password reset request was initiated for your account.</p>
            <p style="color: #E8E6DD; font-size: 14px;">Your secure password recovery token is:</p>
            <div style="background-color: #1D3026; border: 1px solid #C9A96E; padding: 12px 18px; border-radius: 6px; font-family: monospace; color: #C9A96E; font-size: 16px; margin: 12px 0;">
                {token}
            </div>
            <p style="color: #89998E; font-size: 12px;">This token expires in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
            <hr style="border: 0; border-top: 1px solid #18251E; margin: 24px 0;" />
            <p style="color: #C9A96E; font-size: 11px;">Built by CiPher • Engineering autonomous software repair.</p>
        </div>
        """
        logger.info(f"[EMAIL SERVICE] Password reset token for {to_email}: {token}")

        if not self.is_configured():
            return True

        return self._send_smtp(to_email, subject, html_content)

    def _send_smtp(self, to_email: str, subject: str, html_content: str) -> bool:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            logger.info(f"Dispatched email to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch email to {to_email}: {e}")
            return False


email_service = EmailService()
