from fastapi import APIRouter, Depends, status

from app.deps import get_auth_service, get_current_user
from app.models.user import User
from app.schemas.auth import (
    AuthTokenResponse,
    ForgotPasswordRequest,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
    UserUpdateRequest,
)
from app.schemas.base import SuccessResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autentifikasiya"])


@router.post(
    "/signup",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yeni istifadəçi qeydiyyatı",
    description="Ad, soyad, e-poçt, telefon və şifrə ilə yeni istifadəçi yaradır və 30 günlük JWT token qaytarır.",
)
async def signup(
    req: UserSignupRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.signup(req)


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    summary="İstifadəçi girişi",
    description="E-poçt və şifrə ilə daxil olur və JWT bearer token təqdim edir.",
)
async def login(
    req: UserLoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.login(req)


@router.post(
    "/forgot-password",
    response_model=SuccessResponse,
    summary="Şifrənin bərpası sorğusu",
    description="İstifadəçinin e-poçt ünvanına şifrə sıfırlama linki göndərir.",
)
async def forgot_password(
    req: ForgotPasswordRequest,
):
    return SuccessResponse(
        success=True,
        message=f"{req.email} ünvanına şifrə sıfırlama təlimatı göndərildi.",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Cari istifadəçi məlumatları",
    description="JWT Bearer token ilə cari daxil olmuş istifadəçinin profil məlumatlarını qaytarır.",
)
async def get_me(
    user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.get_user_by_id(user.id)


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Cari istifadəçi profilini yeniləmə",
    description="İstifadəçinin adı, soyadı, telefonu və ya avatarını yeniləyir.",
)
async def update_me(
    req: UserUpdateRequest,
    user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.update_profile(user.id, req)

