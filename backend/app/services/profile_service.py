import uuid

from app.core.security import encryptor
from app.models.guest import GuestProfile
from app.repositories.booking_repo import BookingRepository
from app.repositories.profile_repo import ProfileRepository
from app.schemas.profile import (
    GuestProfileResponse,
    GuestProfileUpdate,
    mask_document_number,
)


class ProfileService:
    def __init__(self, profile_repo: ProfileRepository, booking_repo: BookingRepository):
        self.profile_repo = profile_repo
        self.booking_repo = booking_repo

    def to_response(self, profile: GuestProfile) -> GuestProfileResponse:
        plain_doc = encryptor.decrypt(profile.document_number_encrypted)
        masked = mask_document_number(plain_doc)

        return GuestProfileResponse(
            id=str(profile.id),
            guest_id=str(profile.guest_id),
            first_name=profile.first_name,
            last_name=profile.last_name,
            phone=profile.phone,
            email=profile.email,
            birth_date=profile.birth_date,
            nationality=profile.nationality,
            document_number=masked,  # Həmişə yalnız maskalanmış şəkildə qayıdır
            masked_document_number=masked,
            city=profile.city,
            address=profile.address,
            preferred_language=profile.preferred_language,
        )

    async def get_profile_by_guest_id(self, guest_id: uuid.UUID) -> GuestProfileResponse:
        """Cari qonağın profilini qaytarır. Tapılmadıqda boş sahələrlə default cavab qaytarır (404 yox)."""
        profile = await self.profile_repo.get_or_create_profile(guest_id)
        return self.to_response(profile)

    async def update_profile_by_guest_id(
        self, guest_id: uuid.UUID, data: GuestProfileUpdate
    ) -> GuestProfileResponse:
        """Bütün profil sahələrini yeniləyir (upsert). Sənəd nömrəsi şifrələnir və yalnız maskalanmış qayıdır."""
        profile = await self.profile_repo.update_profile_by_guest_id(guest_id, data)
        return self.to_response(profile)

    async def clear_profile(self, guest_id: uuid.UUID) -> None:
        """
        GDPR üzrə bütün şəxsi məlumatları silir:
        1. Profil sahələrini sıfırlayır.
        2. Mövcud rezervasiyalardakı şəxsi məlumatları anonimləşdirir.
        Favoritlər və rezervasiya sətirləri qalır.
        """
        await self.profile_repo.clear_profile(guest_id)
        await self.booking_repo.anonymize_guest_bookings(guest_id)

    # Köhnə metodlarla geriyə uyğunluq
    async def get_profile(self, identifier: str) -> GuestProfileResponse:
        guest, profile = await self.profile_repo.get_or_create_guest(identifier)
        return self.to_response(profile)

    async def update_profile(self, identifier: str, data: GuestProfileUpdate) -> GuestProfileResponse:
        profile = await self.profile_repo.update_profile(identifier, data)
        return self.to_response(profile)
