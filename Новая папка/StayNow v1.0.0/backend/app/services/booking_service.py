import uuid
from datetime import date, datetime

from app.core.errors import NotFoundError, ValidationError
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.repositories.booking_repo import BookingRepository
from app.repositories.hotel_repo import HotelRepository
from app.repositories.profile_repo import ProfileRepository
from app.schemas.booking import BookingCreate, BookingResponse
from app.schemas.profile import normalize_and_validate_phone


def _to_uuid(val: str | uuid.UUID) -> uuid.UUID:
    if isinstance(val, uuid.UUID):
        return val
    return uuid.UUID(str(val))


def _to_date(val: date | str | None) -> date:
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        try:
            return datetime.strptime(val.strip(), "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError("Tarix düzgün formatda deyil (YYYY-MM-DD)") from None
    raise ValidationError("Tarix düzgün daxil edilməyib")


class BookingService:
    def __init__(
        self,
        booking_repo: BookingRepository,
        hotel_repo: HotelRepository,
        profile_repo: ProfileRepository,
    ):
        self.booking_repo = booking_repo
        self.hotel_repo = hotel_repo
        self.profile_repo = profile_repo

    def to_response(self, booking: Booking) -> BookingResponse:
        status_val = booking.status.value if hasattr(booking.status, "value") else str(booking.status)
        payment_val = (
            booking.payment_status.value
            if hasattr(booking.payment_status, "value")
            else str(booking.payment_status)
        )

        return BookingResponse(
            id=str(booking.id),
            reference=booking.reference,
            hotel=booking.hotel_snapshot,
            hotel_snapshot=booking.hotel_snapshot,
            check_in=str(booking.check_in),
            check_out=str(booking.check_out),
            nights=booking.nights,
            adults=booking.adults,
            children=booking.children,
            price_per_night=float(booking.price_per_night),
            discount_amount=float(booking.discount_amount),
            total_price=float(booking.total_price),
            currency=booking.currency,
            status=status_val,
            payment_status=payment_val,
            created_at=booking.created_at,
            updated_at=booking.updated_at,
            first_name=booking.first_name,
            last_name=booking.last_name,
            phone=booking.phone,
            email=booking.email,
            special_requests=booking.special_requests,
            guest_id=str(booking.guest_id),
            hotel_id=str(booking.hotel_id),
            idempotency_key=booking.idempotency_key,
            cancelled_at=booking.cancelled_at,
        )

    async def create_booking(
        self,
        data: BookingCreate,
        guest_id: uuid.UUID,
        idempotency_key: str,
    ) -> tuple[BookingResponse, bool]:
        """
        Rezervasiya yaradır:
        1. Tarixlər və qonaq sayı validasiyası.
        2. Repository-də atomik olaraq otel kilidlənməsi, overbooking yoxlanışı, qiymət hesablaması və profil yenilənməsi.
        3. İdempotentlik: eyni açar olduqda əvvəlki rezervasiyanı qaytarır (is_new=False).
        """
        # 1. Tarix validasiyaları
        c_in = data.check_in or (_to_date(data.check_in_date) if data.check_in_date else None)
        c_out = data.check_out or (_to_date(data.check_out_date) if data.check_out_date else None)
        if not c_in:
            raise ValidationError("Giriş tarixi (checkIn) tələb olunur")
        if not c_out:
            raise ValidationError("Çıxış tarixi (checkOut) tələb olunur")

        today = date.today()
        if c_in < today:
            raise ValidationError("Giriş tarixi bu gündən əvvəl ola bilməz")
        if c_out <= c_in:
            raise ValidationError("Çıxış tarixi giriş tarixindən sonra olmalıdır")

        nights = (c_out - c_in).days
        if nights > 30:
            raise ValidationError("Maksimum rezervasiya müddəti 30 gecədir")

        # 2. Qonaq sayı limitləri
        adults = data.adults or data.adults_count or 1
        children = data.children if data.children is not None else (data.children_count or 0)
        if adults < 1:
            raise ValidationError("Böyüklərin sayı ən azı 1 olmalıdır")
        if children < 0:
            raise ValidationError("Uşaqların sayı mənfi ola bilməz")
        if (adults + children) > 6:
            raise ValidationError("Qonaqların ümumi sayı (böyük + uşaq) maksimum 6 ola bilər")

        # 3. Şəxsi məlumatlar
        first_name = data.first_name
        last_name = data.last_name
        if not first_name and data.guest_name:
            parts = data.guest_name.strip().split()
            first_name = parts[0]
            if len(parts) > 1 and not last_name:
                last_name = " ".join(parts[1:])

        first_name = (first_name or "Qonaq").strip()
        last_name = (last_name or "").strip()

        raw_phone = data.phone or data.guest_phone or ""
        phone = normalize_and_validate_phone(raw_phone) if raw_phone else ""

        email = str(data.email or data.guest_email or "").strip()

        # 4. Otel ID həlli
        try:
            hotel_uuid = _to_uuid(data.hotel_id)
        except (ValueError, TypeError):
            raise NotFoundError(f"'{data.hotel_id}' nömrəli otel tapılmadı") from None

        # 5. Atomik tranzaksiyada yarat
        booking, is_new = await self.booking_repo.create_booking_atomic(
            guest_id=guest_id,
            hotel_id=hotel_uuid,
            check_in=c_in,
            check_out=c_out,
            adults=adults,
            children=children,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            email=email,
            special_requests=data.special_requests,
            idempotency_key=idempotency_key,
        )

        return self.to_response(booking), is_new

    async def get_booking_by_id(self, booking_id: str) -> BookingResponse:
        booking = await self.booking_repo.get_by_id_or_reference(booking_id)
        if not booking:
            raise NotFoundError(f"'{booking_id}' nömrəli rezervasiya tapılmadı")
        return self.to_response(booking)

    async def get_booking_by_id_and_guest(self, booking_id: str, guest_id: uuid.UUID) -> BookingResponse:
        booking = await self.booking_repo.get_by_id_and_guest(booking_id, guest_id)
        if not booking:
            raise NotFoundError(f"'{booking_id}' nömrəli rezervasiya tapılmadı")
        return self.to_response(booking)

    async def get_user_bookings(self, identifier: str) -> list[BookingResponse]:
        bookings = await self.booking_repo.get_by_device_id(identifier)
        return [self.to_response(b) for b in bookings]

    async def get_user_bookings_by_guest_id(
        self,
        guest_id: uuid.UUID,
        status_filter: BookingStatus | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> list[BookingResponse]:
        bookings = await self.booking_repo.get_by_guest(
            guest_id=guest_id,
            status_filter=status_filter,
            page=page,
            limit=limit,
        )
        return [self.to_response(b) for b in bookings]

    async def cancel_booking(self, booking_id: str) -> BookingResponse:
        booking = await self.booking_repo.cancel_booking(booking_id)
        if not booking:
            raise NotFoundError(f"'{booking_id}' nömrəli rezervasiya tapılmadı")
        return self.to_response(booking)

    async def cancel_booking_for_guest(self, booking_id: str, guest_id: uuid.UUID) -> BookingResponse:
        booking = await self.booking_repo.cancel_booking_atomic(booking_id, guest_id)
        return self.to_response(booking)

    async def get_availability(
        self,
        hotel_id: str | uuid.UUID,
        check_in: date | str,
        check_out: date | str,
        guests: int = 1,
    ) -> tuple[bool, int]:
        c_in = _to_date(check_in)
        c_out = _to_date(check_out)
        return await check_hotel_availability(
            self.booking_repo,
            self.hotel_repo,
            hotel_id,
            c_in,
            c_out,
            guests,
        )


async def check_hotel_availability(
    booking_repo: BookingRepository,
    hotel_repo: HotelRepository,
    hotel_id: str | uuid.UUID,
    check_in: date,
    check_out: date,
    guests: int = 1,
) -> tuple[bool, int]:
    """Boş otaq hesablaması: kəsişən confirmed rezervasiyaların sayı < rooms_total."""
    hotel = await hotel_repo.get_by_id(hotel_id)
    if not hotel or not hotel.is_active:
        raise NotFoundError(f"'{hotel_id}' identifikatorlu otel tapılmadı")

    if check_out <= check_in:
        raise ValidationError("Çıxış tarixi giriş tarixindən sonra olmalıdır")

    booked_count = await booking_repo.count_overlapping_confirmed_bookings(
        hotel.id, check_in, check_out
    )
    rooms_left = max(0, hotel.rooms_total - booked_count)
    is_available = rooms_left > 0

    return is_available, rooms_left
