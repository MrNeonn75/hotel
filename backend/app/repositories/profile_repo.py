import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import encryptor
from app.models.base import utc_now
from app.models.guest import Guest, GuestProfile
from app.repositories.base import BaseRepository
from app.schemas.profile import GuestProfileUpdate


class ProfileRepository(BaseRepository[GuestProfile]):
    def __init__(self, session: AsyncSession):
        super().__init__(GuestProfile, session)

    async def get_by_guest_id(self, guest_id: uuid.UUID) -> GuestProfile | None:
        query = select(GuestProfile).where(GuestProfile.guest_id == guest_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_or_create_profile(self, guest_id: uuid.UUID) -> GuestProfile:
        profile = await self.get_by_guest_id(guest_id)
        if not profile:
            profile = GuestProfile(
                id=uuid.uuid4(),
                guest_id=guest_id,
                first_name="",
                last_name="",
                phone="",
                email="",
                birth_date=None,
                nationality="Azərbaycan",
                document_number_encrypted=None,
                city="Bakı",
                address="",
                preferred_language="az",
            )
            self.session.add(profile)
            await self.session.commit()
            await self.session.refresh(profile)
        return profile

    async def update_profile_by_guest_id(self, guest_id: uuid.UUID, data: GuestProfileUpdate) -> GuestProfile:
        profile = await self.get_or_create_profile(guest_id)

        update_dict = data.model_dump(exclude_unset=True)
        if "document_number" in update_dict:
            doc_num = update_dict.pop("document_number")
            if doc_num and doc_num.strip():
                profile.document_number_encrypted = encryptor.encrypt(doc_num.strip())
            else:
                profile.document_number_encrypted = None

        for key, value in update_dict.items():
            if hasattr(profile, key) and value is not None:
                setattr(profile, key, value)

        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    async def clear_profile(self, guest_id: uuid.UUID) -> GuestProfile:
        """GDPR üzrə profilin şəxsi məlumatlarını sıfırlayır."""
        profile = await self.get_or_create_profile(guest_id)
        profile.first_name = ""
        profile.last_name = ""
        profile.phone = ""
        profile.email = ""
        profile.birth_date = None
        profile.nationality = "Azərbaycan"
        profile.document_number_encrypted = None
        profile.city = "Bakı"
        profile.address = ""
        profile.preferred_language = "az"
        await self.session.commit()
        await self.session.refresh(profile)
        return profile

    # Köhnə metodlarla geriyə uyğunluq
    async def get_or_create_guest(self, device_id: str) -> tuple[Guest, GuestProfile]:
        query = select(Guest).where(Guest.device_id == device_id)
        result = await self.session.execute(query)
        guest = result.scalars().first()

        if not guest:
            guest = Guest(id=uuid.uuid4(), device_id=device_id)
            self.session.add(guest)
            await self.session.flush()

            profile = GuestProfile(
                id=uuid.uuid4(),
                guest_id=guest.id,
                first_name="",
                last_name="",
                phone="",
                email="",
                nationality="Azərbaycan",
                city="Bakı",
                address="",
                preferred_language="az",
            )
            self.session.add(profile)
            await self.session.commit()
            await self.session.refresh(guest)
            await self.session.refresh(profile)
            return guest, profile

        guest.last_seen_at = utc_now()
        profile = await self.get_or_create_profile(guest.id)
        await self.session.commit()
        await self.session.refresh(guest)
        return guest, profile

    async def update_profile(self, device_id: str, data: GuestProfileUpdate) -> GuestProfile:
        guest, _ = await self.get_or_create_guest(device_id)
        return await self.update_profile_by_guest_id(guest.id, data)
