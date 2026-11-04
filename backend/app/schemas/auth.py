from pydantic import EmailStr, Field

from app.schemas.base import CamelModel


class UserSignupRequest(CamelModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)


class UserLoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class UserResponse(CamelModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    avatar: str | None = None


class AuthTokenResponse(CamelModel):
    user: UserResponse
    token: str
    token_type: str = "Bearer"


class UserUpdateRequest(CamelModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar: str | None = None

