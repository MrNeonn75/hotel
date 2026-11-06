import asyncio
import random
import uuid
from collections import defaultdict
from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError
from app.models.base import utc_now
from app.models.booking import Booking
from app.models.enums import BookingStatus, PaymentStatus
from app.models.guest import Guest, GuestProfile
from app.models.hotel import Hotel
from app.repositories.base import BaseRepository

REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
_hotel_locks: dict[uuid.UUID, asyncio.Lock] = defaultdict(asyncio.Lock)


class BookingRepository(BaseRepository[Booking]):
    def __init__(self, session: AsyncSession):
        super().__init__(Booking, session)

    async def get_or_create_guest(self, device_id: str) -> Guest:
        query = select(Guest).where(Guest.device_id == device_id)
        result = await self.session.execute(query)
        guest = result.scalars().first()
        if not guest:
            guest = Guest(device_id=device_id)
            self.session.add(guest)
            await self.session.commit()
            await self.session.refresh(guest)
        return guest

    async def get_by_id_or_reference(self, identifier: str) -> Booking | None:
        try:
            val_uuid = uuid.UUID(identifier)
            query = select(Booking).where(or_(Booking.id == val_uuid, Booking.reference == identifier))
        except ValueError:
            query = select(Booking).where(Booking.reference == identifier)

        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_guest(
        self,
        guest_id: uuid.UUID,
        status_filter: BookingStatus | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> list[Booking]:
        query = select(Booking).where(Booking.guest_id == guest_id)
        if status_filter:
            query = query.where(Booking.status == status_filter)
        query = query.order_by(Booking.created_at.desc()).offset((page - 1) * limit).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_device_id(self, device_id: str) -> list[Booking]:
        guest = await self.get_or_create_guest(device_id)
        return await self.get_by_guest(guest.id)

    async def get_by_idempotency_key(self, key: str) -> Booking | None:
        query = select(Booking).where(Booking.idempotency_key == key)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_id_and_guest(self, identifier: str, guest_id: uuid.UUID) -> Booking | None:
        booking = await self.get_by_id_or_reference(identifier)
        if not booking or booking.guest_id != guest_id:
            return None
        return booking

    async def generate_unique_reference(self) -> str:
        """Unikal oxunaqlı reference yaradır (STN- + 6 simvol, 0/O/1/I çıxarılmış)."""
        for _ in range(15):
            code = "".join(random.choices(REFERENCE_ALPHABET, k=6))
            ref = f"STN-{code}"
            exists = await self.session.execute(select(Booking.id).where(Booking.reference == ref))
            if not exists.scalars().first():
                return ref
        return f"STN-{uuid.uuid4().hex[:6].upper()}"

    async def create_booking_atomic(
        self,
        guest_id: uuid.UUID,
        hotel_id: uuid.UUID,
        check_in: date,
        check_out: date,
        adults: int,
        children: int,
        first_name: str,
        last_name: str,
        phone: str,
        email: str,
        special_requests: str | None,
        idempotency_key: str,
    ) -> tuple[Booking, bool]:
        """
        Bütün rezervasiya məntiqini vahid DB tranzaksiyasında həyata keçirir:
        1. Idempotency yoxlanışı (eyni açarla təkrar sorğuda əvvəlki rezervasiyanı qaytarır).
        2. Otel sətirini SELECT ... FOR UPDATE ilə kilidləyir (overbooking-ə qarşı).
        3. Boş otaq sayını dəqiq yoxlayır (otaq yoxdursa 409 NO_AVAILABILITY).
        4. Qiymətləri SERVERDƏ hesablayır.
        5. Unikal oxunaqlı reference (STN-XXXXXX) yaradır.
        6. Otelin snapshot-unu saxlayır.
        7. Guest profilini avtomatik doldurur/yeniləyir.
        """
        if idempotency_key:
            existing = await self.get_by_idempotency_key(idempotency_key)
            if existing:
                return existing, False

        async with _hotel_locks[hotel_id]:
            # 1. Otel sətirini FOR UPDATE ilə kilidlə
            hotel_stmt = select(Hotel).where(Hotel.id == hotel_id).with_for_update()
            hotel_res = await self.session.execute(hotel_stmt)
            hotel = hotel_res.scalars().first()
            if not hotel or not hotel.is_active:
                raise NotFoundError(f"'{hotel_id}' nömrəli otel tapılmadı")

            # 2. Boş otaq sayını yoxla (kəsişən confirmed rezervasiyalar)
            booked_count = await self.count_overlapping_confirmed_bookings(hotel.id, check_in, check_out)
            rooms_left = hotel.rooms_total - booked_count
            if rooms_left <= 0:
                raise ConflictError(
                    message="Seçilmiş tarixlər üçün oteldə boş otaq qalmayıb",
                    code="NO_AVAILABILITY",
                )

            # 3. Server tərəfində qiymət hesablaması
            nights = (check_out - check_in).days
            price_per_night = Decimal(str(hotel.discounted_price))
            total_price = price_per_night * Decimal(nights)
            discount_amount = (Decimal(str(hotel.standard_price)) - price_per_night) * Decimal(nights)
            if discount_amount < Decimal("0.00"):
                discount_amount = Decimal("0.00")

            # 4. Unikal oxunaqlı reference
            reference = await self.generate_unique_reference()

            # 5. Hotel snapshot
            first_img = ""
            if hotel.images:
                img0 = hotel.images[0]
                first_img = img0.url if hasattr(img0, "url") else str(img0)

            hotel_snapshot = {
                "name": hotel.name,
                "address": hotel.address,
                "image": first_img,
            }

            # 6. Guest profilini avtomatik yenilə (boşdursa və ya fərqlidirsə)
            prof_stmt = select(GuestProfile).where(GuestProfile.guest_id == guest_id)
            prof_res = await self.session.execute(prof_stmt)
            profile = prof_res.scalars().first()
            if not profile:
                profile = GuestProfile(
                    id=uuid.uuid4(),
                    guest_id=guest_id,
                    first_name=first_name,
                    last_name=last_name,
                    phone=phone,
                    email=email,
                )
                self.session.add(profile)
            else:
                if first_name and (not profile.first_name or profile.first_name != first_name):
                    profile.first_name = first_name
                if last_name and (not profile.last_name or profile.last_name != last_name):
                    profile.last_name = last_name
                if phone and (not profile.phone or profile.phone != phone):
                    profile.phone = phone
                if email and (not profile.email or profile.email != email):
                    profile.email = email

            # 7. Rezervasiya obyektini yarat
            booking = Booking(
                id=uuid.uuid4(),
                reference=reference,
                guest_id=guest_id,
                hotel_id=hotel.id,
                check_in=check_in,
                check_out=check_out,
                adults=adults,
                children=children,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                email=email,
                special_requests=special_requests,
                nights=nights,
                price_per_night=price_per_night,
                discount_amount=discount_amount,
                total_price=total_price,
                currency=hotel.currency,
                status=BookingStatus.CONFIRMED,
                payment_status=PaymentStatus.UNPAID,
                hotel_snapshot=hotel_snapshot,
                idempotency_key=idempotency_key,
            )
            self.session.add(booking)

            try:
                await self.session.commit()
                await self.session.refresh(booking)
            except IntegrityError:
                await self.session.rollback()
                existing = await self.get_by_idempotency_key(idempotency_key)
                if existing:
                    return existing, False
                raise

            return booking, True

    async def cancel_booking_atomic(
        self, booking_id: str, guest_id: uuid.UUID
    ) -> Booking:
        """
        Rezervasiyanı ləğv edir:
        - Yalnız confirmed statusunda olanlar ləğv edilə bilər.
        - Check-in tarixinə ən azı 24 saat qalmış olmalıdır (əks halda 409 CANCELLATION_NOT_ALLOWED).
        - İdempotentdir: artıq ləğv edilibsə xəta atmır, cari vəziyyəti qaytarır.
        - PaymentStatus paid idisə refunded edilir.
        """
        booking = await self.get_by_id_and_guest(booking_id, guest_id)
        if not booking:
            raise NotFoundError(f"'{booking_id}' nömrəli rezervasiya tapılmadı")

        if booking.status == BookingStatus.CANCELLED:
            return booking

        if booking.status != BookingStatus.CONFIRMED:
            raise ConflictError(
                message="Yalnız təsdiqlənmiş (confirmed) rezervasiyalar ləğv edilə bilər",
                code="CANCELLATION_NOT_ALLOWED",
            )

        # Giriş vaxtına ən azı 24 saat qalmalıdır (otelin standart saat 14:00 giriş vaxtı)
        check_in_dt = datetime.combine(
            booking.check_in,
            datetime.strptime("14:00", "%H:%M").time(),
            tzinfo=UTC,
        )
        now = utc_now()
        hours_left = (check_in_dt - now).total_seconds() / 3600
        if hours_left < 24:
            raise ConflictError(
                message="Rezervasiyanı yalnız giriş vaxtına ən azı 24 saat qalana qədər ləğv etmək mümkündür",
                code="CANCELLATION_NOT_ALLOWED",
            )

        booking.status = BookingStatus.CANCELLED
        booking.cancelled_at = utc_now()
        if booking.payment_status == PaymentStatus.PAID:
            booking.payment_status = PaymentStatus.REFUNDED

        await self.session.commit()
        await self.session.refresh(booking)
        return booking

    async def cancel_booking(self, booking_id: str) -> Booking | None:
        booking = await self.get_by_id_or_reference(booking_id)
        if booking:
            booking.status = BookingStatus.CANCELLED
            booking.cancelled_at = utc_now()
            await self.session.commit()
            await self.session.refresh(booking)
        return booking

    async def cancel_booking_for_guest(self, booking_id: str, guest_id: uuid.UUID) -> Booking | None:
        return await self.cancel_booking_atomic(booking_id, guest_id)

    async def anonymize_guest_bookings(self, guest_id: uuid.UUID) -> int:
        stmt = (
            update(Booking)
            .where(Booking.guest_id == guest_id)
            .values(
                first_name="Anonim",
                last_name="Qonaq",
                phone="+994000000000",
                email="deleted@staynow.az",
                special_requests=None,
            )
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount

    async def count_overlapping_confirmed_bookings(
        self,
        hotel_id: uuid.UUID,
        check_in: date,
        check_out: date,
    ) -> int:
        """Kəsişən confirmed rezervasiyaların sayını hesablayır."""
        query = (
            select(func.count(Booking.id))
            .where(
                Booking.hotel_id == hotel_id,
                Booking.status == BookingStatus.CONFIRMED,
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
        )
        result = await self.session.execute(query)
        return result.scalar() or 0

    async def get_booked_rooms_map(
        self,
        check_in: date,
        check_out: date,
    ) -> dict[uuid.UUID, int]:
        """Bütün otellər üzrə kəsişən confirmed rezervasiyaların xəritəsini qaytarır."""
        query = (
            select(Booking.hotel_id, func.count(Booking.id).label("booked_count"))
            .where(
                Booking.status == BookingStatus.CONFIRMED,
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .group_by(Booking.hotel_id)
        )
        result = await self.session.execute(query)
        return {row.hotel_id: row.booked_count for row in result.all()}
