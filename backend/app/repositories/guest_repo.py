import uuid

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import utc_now
from app.models.guest import Guest, GuestProfile
from app.repositories.base import BaseRepository


class GuestRepository(BaseRepository[Guest]):
    def __init__(self, session: AsyncSession):
        super().__init__(Guest, session)

    async def get_or_create_by_device_id(self, device_id: str) -> Guest:
        """
        Device ID üzrə mövcud Guest-i tapır və ya yenisini atomik şəkildə yaradır (get_or_create).
        Race condition-a davamlı: unique constraint + ON CONFLICT DO UPDATE.
        Həmçinin hər sorğuda last_seen_at vaxtını yeniləyir və defolt GuestProfile mövcudluğunu təmin edir.
        """
        now = utc_now()
        bind = self.session.bind
        dialect_name = bind.dialect.name if bind else "postgresql"

        # Dialektə uyğun atomik upsert
        if dialect_name == "sqlite":
            stmt = (
                sqlite_insert(Guest)
                .values(
                    id=uuid.uuid4(),
                    device_id=device_id,
                    last_seen_at=now,
                )
                .on_conflict_do_update(
                    index_elements=["device_id"],
                    set_={"last_seen_at": now},
                )
                .returning(Guest)
            )
        else:
            stmt = (
                pg_insert(Guest)
                .values(
                    id=uuid.uuid4(),
                    device_id=device_id,
                    last_seen_at=now,
                )
                .on_conflict_do_update(
                    index_elements=["device_id"],
                    set_={"last_seen_at": now},
                )
                .returning(Guest)
            )

        res = await self.session.execute(stmt)
        guest = res.scalars().one()

        # Profilin mövcudluğunu yoxla və yoxdursa defolt profil yarat
        prof_stmt = select(GuestProfile).where(GuestProfile.guest_id == guest.id)
        prof_res = await self.session.execute(prof_stmt)
        profile = prof_res.scalars().first()
        if not profile:
            profile = GuestProfile(
                id=uuid.uuid4(),
                guest_id=guest.id,
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
        await self.session.refresh(guest)
        return guest

    async def get_by_device_id(self, device_id: str) -> Guest | None:
        query = select(Guest).where(Guest.device_id == device_id)
        result = await self.session.execute(query)
        return result.scalars().first()

