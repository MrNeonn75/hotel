from fastapi import APIRouter, Depends

from app.deps import get_current_guest, get_profile_service
from app.models.guest import Guest
from app.schemas.base import SuccessResponse
from app.schemas.profile import GuestProfileResponse, GuestProfileUpdate
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/profile", tags=["Profil və Ayarlar"])


@router.get(
    "",
    response_model=GuestProfileResponse,
    summary="İstifadəçi profil məlumatları",
    description="Şəxsi məlumatları, əlaqə nömrəsini, dili və tətbiq ayarlarını qaytarır. Profil mövcud olmadıqda boş sahələrlə default cavab qaytarır (404 yox). Sənəd nömrəsi yalnız maskalanmış şəkildə verilir.",
)
async def get_profile(
    guest: Guest = Depends(get_current_guest),
    profile_service: ProfileService = Depends(get_profile_service),
):
    return await profile_service.get_profile_by_guest_id(guest.id)


@router.put(
    "",
    response_model=GuestProfileResponse,
    summary="Profil məlumatlarını yenilə",
    description="İstifadəçinin şəxsi məlumatlarını, əlaqə nömrəsini və ya tətbiq ayarlarını yeniləyir (upsert). Sənəd nömrəsi daxil edilərsə bazada Fernet ilə şifrələnərək saxlanılır və API cavabında yalnız maskalanmış şəkildə qayıdır.",
)
async def update_profile(
    data: GuestProfileUpdate,
    guest: Guest = Depends(get_current_guest),
    profile_service: ProfileService = Depends(get_profile_service),
):
    return await profile_service.update_profile_by_guest_id(guest.id, data)


@router.delete(
    "",
    response_model=SuccessResponse,
    summary="Bütün şəxsi məlumatlarımı sil (GDPR)",
    description="GDPR üzrə bütün şəxsi məlumatları silir. Favoritlər və rezervasiyalar qalır, amma rezervasiyalardakı şəxsi məlumatlar anonimləşdirilir.",
)
async def clear_profile(
    guest: Guest = Depends(get_current_guest),
    profile_service: ProfileService = Depends(get_profile_service),
):
    await profile_service.clear_profile(guest.id)
    return SuccessResponse(message="Bütün profil məlumatları uğurla silindi və rezervasiyalar anonimləşdirildi")
