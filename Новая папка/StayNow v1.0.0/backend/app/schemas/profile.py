import re
from datetime import date, datetime
from typing import Any

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import CamelModel

VALID_LANGUAGES = {"az", "en", "ru"}


def mask_document_number(doc: str | None) -> str | None:
    """Sənəd nömrəsini maskalayır (məs. 'AA1234567' -> 'AA****567')."""
    if not doc:
        return None
    clean = doc.strip()
    if not clean:
        return None
    if len(clean) <= 4:
        return "****"
    prefix_len = 2 if len(clean) >= 6 else 1
    suffix_len = 3 if len(clean) >= 6 else 2
    return f"{clean[:prefix_len]}****{clean[-suffix_len:]}"


def normalize_and_validate_phone(phone: str | None) -> str:
    """Telefon nömrəsini +994XXXXXXXXX formatına salır və yoxlayır."""
    if not phone or not phone.strip():
        return ""
    clean = re.sub(r"[\s\-\(\)\.]", "", phone.strip())
    if clean.startswith("00994") and len(clean) == 14:
        clean = "+" + clean[2:]
    elif clean.startswith("0") and len(clean) == 10:
        clean = "+994" + clean[1:]
    elif clean.startswith("994") and len(clean) == 12:
        clean = "+" + clean
    elif not clean.startswith("+") and len(clean) == 9:
        clean = "+994" + clean

    if not re.match(r"^\+994\d{9}$", clean):
        raise ValueError("Telefon nömrəsi +994XXXXXXXXX formatında olmalıdır (məs. +994501234567)")
    return clean


def validate_preferred_language(lang: str | None) -> str:
    """Yalnız az, en, ru dillərini dəstəkləyir."""
    if not lang or not lang.strip():
        return "az"
    norm = lang.strip().lower()
    if norm not in VALID_LANGUAGES:
        raise ValueError("Dəstəklənən dillər yalnız: az, en, ru")
    return norm


def validate_birth_date(val: date | str | None) -> str | None:
    """Doğum tarixinin keçmişdə olduğunu yoxlayır."""
    if val is None:
        return None
    if isinstance(val, str):
        val_str = val.strip()
        if not val_str:
            return None
        try:
            d = datetime.strptime(val_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Doğum tarixi YYYY-MM-DD formatında olmalıdır") from None
    elif isinstance(val, date):
        d = val
    else:
        raise ValueError("Yanlış tarix formatı")

    if d >= date.today():
        raise ValueError("Doğum tarixi keçmişdə olmalıdır")
    return d.isoformat()


class GuestProfileBase(CamelModel):
    first_name: str = ""
    last_name: str = ""
    phone: str = ""
    email: str = ""
    birth_date: str | None = None
    nationality: str = "Azərbaycan"
    document_number: str | None = None
    city: str = "Bakı"
    address: str = ""
    preferred_language: str = "az"


class GuestProfileUpdate(CamelModel):
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=30)
    email: EmailStr | None = None
    birth_date: str | date | None = None
    nationality: str | None = Field(None, max_length=100)
    document_number: str | None = Field(None, max_length=50)
    city: str | None = Field(None, max_length=100)
    address: str | None = Field(None, max_length=255)
    preferred_language: str | None = Field(None, max_length=10)

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return normalize_and_validate_phone(v)

    @field_validator("email", mode="before")
    @classmethod
    def check_email_pre(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v

    @field_validator("birth_date")
    @classmethod
    def check_birth_date(cls, v: str | date | None) -> str | None:
        if v is None:
            return None
        return validate_birth_date(v)

    @field_validator("preferred_language")
    @classmethod
    def check_language(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return validate_preferred_language(v)


class GuestProfileResponse(GuestProfileBase):
    id: str | None = None
    guest_id: str | None = None
    masked_document_number: str | None = None


# Backward-compatible aliases
UserProfileBase = GuestProfileBase
UserProfileUpdate = GuestProfileUpdate
UserProfileResponse = GuestProfileResponse
