from datetime import date, datetime
from typing import Any

from pydantic import EmailStr, Field, model_validator

from app.schemas.base import CamelModel
from app.schemas.profile import normalize_and_validate_phone


class BookingHotelSnapshot(CamelModel):
    name: str = Field(..., max_length=255)
    address: str = Field(..., max_length=500)
    image: str = Field(..., max_length=1000)


class BookingCreate(CamelModel):
    hotel_id: str = Field(..., max_length=100)
    check_in: date | None = None
    check_out: date | None = None
    adults: int = 1
    children: int = 0
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=30)
    email: EmailStr | str | None = Field(None, max_length=255)
    special_requests: str | None = Field(None, max_length=500)

    # Geriyə uyğunluq üçün əlavə sahələr
    idempotency_key: str | None = Field(None, max_length=255)
    user_id: str | None = Field(None, max_length=100)
    device_id: str | None = Field(None, max_length=100)
    check_in_date: str | None = Field(None, max_length=20)
    check_out_date: str | None = Field(None, max_length=20)
    adults_count: int | None = None
    children_count: int | None = None
    guest_name: str | None = Field(None, max_length=200)
    guest_phone: str | None = Field(None, max_length=30)
    guest_email: str | None = Field(None, max_length=255)

    @model_validator(mode="after")
    def validate_dates_and_counts(self) -> "BookingCreate":
        # check_in və check_out dəyərlərini həll et
        c_in = self.check_in
        if not c_in and self.check_in_date:
            try:
                c_in = datetime.strptime(self.check_in_date, "%Y-%m-%d").date()
                self.check_in = c_in
            except ValueError:
                raise ValueError("Giriş tarixi YYYY-MM-DD formatında olmalıdır") from None

        c_out = self.check_out
        if not c_out and self.check_out_date:
            try:
                c_out = datetime.strptime(self.check_out_date, "%Y-%m-%d").date()
                self.check_out = c_out
            except ValueError:
                raise ValueError("Çıxış tarixi YYYY-MM-DD formatında olmalıdır") from None

        today = date.today()
        if c_in and c_in < today:
            raise ValueError("Giriş tarixi bu gündən əvvəl ola bilməz")

        if c_in and c_out:
            if c_out <= c_in:
                raise ValueError("Çıxış tarixi giriş tarixindən sonra olmalıdır")
            nights = (c_out - c_in).days
            if nights > 30:
                raise ValueError("Maksimum rezervasiya müddəti 30 gecədir")

        effective_adults = self.adults if self.adults is not None else (self.adults_count if self.adults_count is not None else 1)
        effective_children = self.children if self.children is not None else (self.children_count if self.children_count is not None else 0)

        if effective_adults < 1:
            raise ValueError("Böyüklərin sayı ən azı 1 olmalıdır")

        if effective_children < 0:
            raise ValueError("Uşaqların sayı mənfi ola bilməz")

        if (effective_adults + effective_children) > 6:
            raise ValueError("Qonaqların ümumi sayı (böyük + uşaq) maksimum 6 ola bilər")

        # Ad və soyad həlli
        if not self.first_name and self.guest_name:
            parts = self.guest_name.strip().split()
            self.first_name = parts[0]
            if len(parts) > 1 and not self.last_name:
                self.last_name = " ".join(parts[1:])

        # Telefon nömrəsi normallaşdırması
        raw_phone = self.phone or self.guest_phone
        if raw_phone:
            self.phone = normalize_and_validate_phone(raw_phone)

        # Email həlli
        raw_email = self.email or self.guest_email
        if raw_email:
            self.email = str(raw_email).strip()

        return self


class BookingResponse(CamelModel):
    id: str
    reference: str
    hotel: dict[str, Any] | None = None
    hotel_snapshot: dict[str, Any] | None = None
    check_in: str
    check_out: str
    nights: int
    adults: int
    children: int
    price_per_night: float
    discount_amount: float
    total_price: float
    currency: str
    status: str
    payment_status: str
    created_at: datetime
    updated_at: datetime | None = None
    first_name: str
    last_name: str
    phone: str
    email: str
    special_requests: str | None = None
    guest_id: str | None = None
    hotel_id: str | None = None
    idempotency_key: str | None = None
    cancelled_at: datetime | None = None


class BookingCancelResponse(CamelModel):
    id: str
    reference: str
    status: str = "cancelled"
    message: str = "Rezervasiya uğurla ləğv edildi"
