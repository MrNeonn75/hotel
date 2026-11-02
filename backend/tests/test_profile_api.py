import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.security import encryptor
from app.models.booking import Booking
from app.models.enums import BookingStatus, PaymentStatus
from app.models.guest import Guest, GuestProfile
from app.schemas.profile import mask_document_number, normalize_and_validate_phone


@pytest.mark.asyncio
async def test_profile_get_default_values(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    res = await client.get("/api/v1/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["firstName"] == ""
    assert data["lastName"] == ""
    assert data["phone"] == ""
    assert data["email"] == ""
    assert data["birthDate"] is None
    assert data["nationality"] == "Azərbaycan"
    assert data["documentNumber"] is None
    assert data["city"] == "Bakı"
    assert data["address"] == ""
    assert data["preferredLanguage"] == "az"


@pytest.mark.asyncio
async def test_profile_put_upsert_and_normalization(client: AsyncClient, seeded_session):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    payload = {
        "firstName": "Elşən",
        "lastName": "Məmmədov",
        "phone": "050 123 45 67",  # Needs normalization to +994501234567
        "email": "elshan@example.com",
        "birthDate": "1995-04-12",
        "nationality": "Azərbaycan",
        "documentNumber": "AA1234567",  # Needs Fernet encryption in DB & masking in response
        "city": "Bakı",
        "address": "Nizami küç. 42",
        "preferredLanguage": "AZ",  # Needs lowercase normalization to "az"
    }

    res = await client.put("/api/v1/profile", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    # Response assertions
    assert data["firstName"] == "Elşən"
    assert data["lastName"] == "Məmmədov"
    assert data["phone"] == "+994501234567"
    assert data["email"] == "elshan@example.com"
    assert data["birthDate"] == "1995-04-12"
    assert data["documentNumber"] == "AA****567"  # Masked!
    assert data["maskedDocumentNumber"] == "AA****567"
    assert data["preferredLanguage"] == "az"

    # Database assertions (verify Fernet encryption)
    guest_stmt = select(Guest).where(Guest.device_id == device_id)
    guest = (await seeded_session.execute(guest_stmt)).scalars().first()
    assert guest is not None

    prof_stmt = select(GuestProfile).where(GuestProfile.guest_id == guest.id)
    profile = (await seeded_session.execute(prof_stmt)).scalars().first()
    assert profile is not None

    # Stored value is encrypted and not plain text
    assert profile.document_number_encrypted is not None
    assert profile.document_number_encrypted != "AA1234567"
    # Decrypting via encryptor yields original
    assert encryptor.decrypt(profile.document_number_encrypted) == "AA1234567"


@pytest.mark.asyncio
async def test_profile_validation_errors(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    # 1. Invalid phone number
    res_phone = await client.put("/api/v1/profile", json={"phone": "12345"}, headers=headers)
    assert res_phone.status_code == 422
    assert "Telefon nömrəsi" in res_phone.json()["error"]["details"][0]["message"]

    # 2. Invalid email format
    res_email = await client.put("/api/v1/profile", json={"email": "not-an-email"}, headers=headers)
    assert res_email.status_code == 422
    assert "email" in res_email.json()["error"]["details"][0]["message"].lower()

    # 3. Future birth date
    future_date = (date.today() + timedelta(days=1)).isoformat()
    res_birth = await client.put("/api/v1/profile", json={"birthDate": future_date}, headers=headers)
    assert res_birth.status_code == 422
    assert "keçmişdə" in res_birth.json()["error"]["details"][0]["message"]

    # 4. Today's birth date (must be strictly in the past)
    today_date = date.today().isoformat()
    res_today = await client.put("/api/v1/profile", json={"birthDate": today_date}, headers=headers)
    assert res_today.status_code == 422
    assert "keçmişdə" in res_today.json()["error"]["details"][0]["message"]

    # 5. Unsupported language
    res_lang = await client.put("/api/v1/profile", json={"preferredLanguage": "fr"}, headers=headers)
    assert res_lang.status_code == 422
    assert "az, en, ru" in res_lang.json()["error"]["details"][0]["message"]


@pytest.mark.asyncio
async def test_profile_delete_gdpr(client: AsyncClient, seeded_session):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    # 1. Setup profile data
    await client.put(
        "/api/v1/profile",
        json={
            "firstName": "Leyla",
            "lastName": "Əliyeva",
            "phone": "+994502223344",
            "email": "leyla@example.com",
            "documentNumber": "AA9876543",
        },
        headers=headers,
    )

    # 2. Add a favorite
    res_hotels = await client.get("/api/v1/hotels")
    hotel = res_hotels.json()["items"][0]
    hotel_id = hotel["id"]
    await client.put(f"/api/v1/favorites/{hotel_id}", headers=headers)

    # 3. Create a booking directly in session for this guest
    guest = (await seeded_session.execute(select(Guest).where(Guest.device_id == device_id))).scalars().first()
    booking = Booking(
        reference="STN-GDPR01",
        guest_id=guest.id,
        hotel_id=uuid.UUID(hotel_id),
        check_in=date.today() + timedelta(days=5),
        check_out=date.today() + timedelta(days=7),
        adults=2,
        first_name="Leyla",
        last_name="Əliyeva",
        phone="+994502223344",
        email="leyla@example.com",
        special_requests="Yüksək mərtəbə xahiş edirəm",
        nights=2,
        price_per_night=Decimal("150.00"),
        total_price=Decimal("300.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
    )
    seeded_session.add(booking)
    await seeded_session.commit()
    await seeded_session.refresh(booking)

    # 4. Invoke GDPR DELETE /api/v1/profile
    res_del = await client.delete("/api/v1/profile", headers=headers)
    assert res_del.status_code == 200
    assert "silindi" in res_del.json()["message"]

    # 5. Check Profile fields are cleared to default
    res_prof_after = await client.get("/api/v1/profile", headers=headers)
    prof_data = res_prof_after.json()
    assert prof_data["firstName"] == ""
    assert prof_data["lastName"] == ""
    assert prof_data["phone"] == ""
    assert prof_data["email"] == ""
    assert prof_data["documentNumber"] is None
    assert prof_data["birthDate"] is None

    # 6. Check Favorites remain intact
    res_fav_after = await client.get("/api/v1/favorites/ids", headers=headers)
    assert res_fav_after.json() == [hotel_id]

    # 7. Check Booking personal info is anonymized, but booking itself exists
    await seeded_session.refresh(booking)
    assert booking.first_name == "Anonim"
    assert booking.last_name == "Qonaq"
    assert booking.phone == "+994000000000"
    assert booking.email == "deleted@staynow.az"
    assert booking.special_requests is None
    # Financial and reference data remain intact
    assert booking.reference == "STN-GDPR01"
    assert booking.total_price == Decimal("300.00")
    assert booking.status == BookingStatus.CONFIRMED


@pytest.mark.asyncio
async def test_profile_guest_isolation(client: AsyncClient):
    guest_a = str(uuid.uuid4())
    guest_b = str(uuid.uuid4())

    await client.put(
        "/api/v1/profile",
        json={"firstName": "Murad", "lastName": "Quliyev"},
        headers={"X-Device-Id": guest_a},
    )

    await client.put(
        "/api/v1/profile",
        json={"firstName": "Aysel", "lastName": "Kərimova"},
        headers={"X-Device-Id": guest_b},
    )

    res_a = await client.get("/api/v1/profile", headers={"X-Device-Id": guest_a})
    assert res_a.json()["firstName"] == "Murad"
    assert res_a.json()["lastName"] == "Quliyev"

    res_b = await client.get("/api/v1/profile", headers={"X-Device-Id": guest_b})
    assert res_b.json()["firstName"] == "Aysel"
    assert res_b.json()["lastName"] == "Kərimova"


@pytest.mark.asyncio
async def test_profile_security_encryption_and_masking_and_no_logging(
    client: AsyncClient, seeded_session, caplog: pytest.LogCaptureFixture
):
    import logging

    caplog.set_level(logging.DEBUG)

    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}
    plain_doc = "AA1234567"

    # 1. PUT profile with sensitive documentNumber
    res_put = await client.put(
        "/api/v1/profile",
        json={
            "firstName": "Murad",
            "documentNumber": plain_doc,
        },
        headers=headers,
    )
    assert res_put.status_code == 200
    put_data = res_put.json()

    # Masking assertion: only masked value returned in API response
    assert put_data["documentNumber"] == "AA****567"
    assert put_data["maskedDocumentNumber"] == "AA****567"
    assert plain_doc not in str(put_data)

    # Encryption assertion: verified in database that Fernet encryption is used
    guest = (await seeded_session.execute(select(Guest).where(Guest.device_id == device_id))).scalars().first()
    profile = (
        await seeded_session.execute(select(GuestProfile).where(GuestProfile.guest_id == guest.id))
    ).scalars().first()
    assert profile.document_number_encrypted is not None
    assert profile.document_number_encrypted != plain_doc
    assert profile.document_number_encrypted.startswith("gAAAAA")  # Fernet token header
    assert encryptor.decrypt(profile.document_number_encrypted) == plain_doc

    # Log privacy assertion: plain_doc MUST NEVER appear in captured logs
    assert plain_doc not in caplog.text

    # 2. GET profile
    caplog.clear()
    res_get = await client.get("/api/v1/profile", headers=headers)
    assert res_get.status_code == 200
    get_data = res_get.json()
    assert get_data["documentNumber"] == "AA****567"
    assert plain_doc not in res_get.text
    assert plain_doc not in caplog.text


@pytest.mark.asyncio
async def test_profile_idempotent_upsert_and_gdpr(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    payload = {
        "firstName": "Kamran",
        "lastName": "Həsənov",
        "phone": "+994551112233",
        "preferredLanguage": "en",
    }

    # First PUT
    r1 = await client.put("/api/v1/profile", json=payload, headers=headers)
    assert r1.status_code == 200
    data1 = r1.json()

    # Second PUT with identical payload
    r2 = await client.put("/api/v1/profile", json=payload, headers=headers)
    assert r2.status_code == 200
    data2 = r2.json()

    assert data1["firstName"] == data2["firstName"] == "Kamran"
    assert data1["phone"] == data2["phone"] == "+994551112233"

    # First DELETE (GDPR)
    d1 = await client.delete("/api/v1/profile", headers=headers)
    assert d1.status_code == 200

    # Second DELETE (Idempotent)
    d2 = await client.delete("/api/v1/profile", headers=headers)
    assert d2.status_code == 200

    # Verify cleared profile state
    res_prof = await client.get("/api/v1/profile", headers=headers)
    assert res_prof.json()["firstName"] == ""


@pytest.mark.asyncio
async def test_profile_gdpr_isolation_across_guests(client: AsyncClient, seeded_session):
    guest_a_device = str(uuid.uuid4())
    guest_b_device = str(uuid.uuid4())
    headers_a = {"X-Device-Id": guest_a_device}
    headers_b = {"X-Device-Id": guest_b_device}

    # Setup Profile A
    await client.put(
        "/api/v1/profile",
        json={"firstName": "UserA", "lastName": "LastNameA", "phone": "+994501111111"},
        headers=headers_a,
    )

    # Setup Profile B
    await client.put(
        "/api/v1/profile",
        json={"firstName": "UserB", "lastName": "LastNameB", "phone": "+994502222222"},
        headers=headers_b,
    )

    # Fetch hotel for bookings
    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = uuid.UUID(res_hotels.json()["items"][0]["id"])

    # Create booking for Guest A
    guest_a = (await seeded_session.execute(select(Guest).where(Guest.device_id == guest_a_device))).scalars().first()
    booking_a = Booking(
        reference="STN-ISO-A",
        guest_id=guest_a.id,
        hotel_id=hotel_id,
        check_in=date.today() + timedelta(days=2),
        check_out=date.today() + timedelta(days=4),
        adults=1,
        first_name="UserA",
        last_name="LastNameA",
        phone="+994501111111",
        email="usera@example.com",
        nights=2,
        price_per_night=Decimal("100.00"),
        total_price=Decimal("200.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
    )
    seeded_session.add(booking_a)

    # Create booking for Guest B
    guest_b = (await seeded_session.execute(select(Guest).where(Guest.device_id == guest_b_device))).scalars().first()
    booking_b = Booking(
        reference="STN-ISO-B",
        guest_id=guest_b.id,
        hotel_id=hotel_id,
        check_in=date.today() + timedelta(days=3),
        check_out=date.today() + timedelta(days=5),
        adults=1,
        first_name="UserB",
        last_name="LastNameB",
        phone="+994502222222",
        email="userb@example.com",
        nights=2,
        price_per_night=Decimal("120.00"),
        total_price=Decimal("240.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
    )
    seeded_session.add(booking_b)
    await seeded_session.commit()

    # Guest A executes GDPR DELETE
    res_del_a = await client.delete("/api/v1/profile", headers=headers_a)
    assert res_del_a.status_code == 200

    # Guest A profile and booking are cleared/anonymized
    res_prof_a = await client.get("/api/v1/profile", headers=headers_a)
    assert res_prof_a.json()["firstName"] == ""
    await seeded_session.refresh(booking_a)
    assert booking_a.first_name == "Anonim"
    assert booking_a.last_name == "Qonaq"
    assert booking_a.phone == "+994000000000"
    assert booking_a.email == "deleted@staynow.az"

    # Guest B profile and booking MUST REMAIN completely intact!
    res_prof_b = await client.get("/api/v1/profile", headers=headers_b)
    assert res_prof_b.json()["firstName"] == "UserB"
    assert res_prof_b.json()["phone"] == "+994502222222"
    await seeded_session.refresh(booking_b)
    assert booking_b.first_name == "UserB"
    assert booking_b.last_name == "LastNameB"
    assert booking_b.phone == "+994502222222"
    assert booking_b.email == "userb@example.com"


def test_document_number_masking_formats():
    assert mask_document_number("AA1234567") == "AA****567"
    assert mask_document_number("AZE12345678") == "AZ****678"
    assert mask_document_number("12345") == "1****45"
    assert mask_document_number("1234") == "****"
    assert mask_document_number("1") == "****"
    assert mask_document_number("") is None
    assert mask_document_number(None) is None


def test_phone_normalization_formats():
    assert normalize_and_validate_phone("0501234567") == "+994501234567"
    assert normalize_and_validate_phone("050 123 45 67") == "+994501234567"
    assert normalize_and_validate_phone("050-123-45-67") == "+994501234567"
    assert normalize_and_validate_phone("+994 (50) 123 45 67") == "+994501234567"
    assert normalize_and_validate_phone("994501234567") == "+994501234567"
    assert normalize_and_validate_phone("00994501234567") == "+994501234567"
    assert normalize_and_validate_phone("501234567") == "+994501234567"
    assert normalize_and_validate_phone("+994501234567") == "+994501234567"

    with pytest.raises(ValueError):
        normalize_and_validate_phone("12345")
    with pytest.raises(ValueError):
        normalize_and_validate_phone("+12345678901")


