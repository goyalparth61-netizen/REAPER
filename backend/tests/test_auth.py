import pytest
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.core.security import decode_token, verify_password


def test_user_registration_flow(db_session):
    service = AuthService(db_session)
    req = UserRegisterRequest(
        full_name="Archi Sharma",
        email="archi@reaper.ai",
        password="Password123!",
        confirm_password="Password123!"
    )
    res = service.register(req)
    assert res.success is True
    assert res.requires_verification is True
    assert res.demo_verification_code is not None
    assert len(res.demo_verification_code) == 6


def test_email_verification_flow(db_session):
    service = AuthService(db_session)
    reg_req = UserRegisterRequest(
        full_name="Parth Goyal",
        email="parth@reaper.ai",
        password="Password123!",
        confirm_password="Password123!"
    )
    reg_res = service.register(reg_req)
    code = reg_res.demo_verification_code

    # Verify email with code
    ver_res = service.verify_email(email="parth@reaper.ai", code=code)
    assert ver_res.success is True
    assert ver_res.user.is_verified is True
    assert ver_res.token is not None

    # Verify JWT token payload
    payload = decode_token(ver_res.token)
    assert payload["sub"] == "parth@reaper.ai"
    assert payload["type"] == "access"


def test_login_verified_user(db_session):
    service = AuthService(db_session)
    login_req = UserLoginRequest(
        email="test@reaper.ai",
        password="Password123!"
    )
    res = service.login(login_req)
    assert res.success is True
    assert res.token is not None
    assert res.user.email == "test@reaper.ai"


def test_login_invalid_password(db_session):
    service = AuthService(db_session)
    login_req = UserLoginRequest(
        email="test@reaper.ai",
        password="WrongPassword123!"
    )
    with pytest.raises(Exception):
        service.login(login_req)


def test_forgot_and_reset_password(db_session):
    service = AuthService(db_session)
    # 1. Forgot password
    forgot_res = service.forgot_password(email="test@reaper.ai")
    assert forgot_res.success is True
    token = forgot_res.demo_reset_token
    assert token is not None

    # 2. Reset password
    reset_res = service.reset_password(
        email="test@reaper.ai",
        token=token,
        new_password="NewSecurePassword123!"
    )
    assert reset_res.success is True

    # 3. Verify user can now log in with new password
    login_res = service.login(UserLoginRequest(
        email="test@reaper.ai",
        password="NewSecurePassword123!"
    ))
    assert login_res.success is True
