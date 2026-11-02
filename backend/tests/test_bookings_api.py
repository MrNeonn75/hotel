import asyncio
import re
import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.models.booking import Booking
from app.models.enums import BookingStatus, PaymentStatus
from app.models.guest import Guest, GuestProfile
from app.models.hotel import Hotel


@pytest.mark.asyncio
async def test_create_booking_success_and_profile_autoupdate(client: AsyncClient, seeded_session):
    device_id = str(uuid.uuid4())
    idem_key = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id, "Idempotency-Key": idem_key}

    # 1. Otel götür
    res_hotels = await client.get("/api/v1/hotels")
    hotel = res_hotels.json()["items"][0]
    hotel_id = hotel["id"]
    std_price = float(hotel["standardPrice"])
    disc_price = float(hotel["discountedPrice"])

    # 2. Rezervasiya sorğusu
    check_in = (date.today() + timedelta(days=5)).isoformat()
    check_out = (date.today() + timedelta(days=7)).isoformat()  # 2 gecə

    payload = {
        "hotelId": hotel_id,
        "checkIn": check_in,
        "checkOut": check_out,
        "adults": 2,
        "children": 1,
        "firstName": "Tural",
        "lastName": "Əliyev",
        "phone": "+994503334455",
        "email": "tural@example.com",
        "specialRequests": "Sakit otaq zəhmət olmasa",
    }

    res = await client.post("/api/v1/bookings", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()

    # Sahələrin yoxlanışı
    assert "id" in data
    assert "reference" in data
    # Reference formatı: STN- + 6 simvol (0, O, 1, I çıxarılmış)
    assert re.match(r"^STN-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$", data["reference"])
    assert "0" not in data["reference"][4:]
    assert "O" not in data["reference"][4:]
    assert "1" not in data["reference"][4:]
    assert "I" not in data["reference"][4:]

    assert data["checkIn"] == check_in
    assert data["checkOut"] == check_out
    assert data["nights"] == 2
    assert data["adults"] == 2
    assert data["children"] == 1
    assert data["status"] == "confirmed"
    assert data["paymentStatus"] == "unpaid"
    assert data["firstName"] == "Tural"
    assert data["lastName"] == "Əliyev"
    assert data["phone"] == "+994503334455"
    assert data["email"] == "tural@example.com"
    assert data["specialRequests"] == "Sakit otaq zəhmət olmasa"

    # Qiymət hesablaması (serverdə hesablanıb)
    assert data["pricePerNight"] == pytest.approx(disc_price)
    assert data["totalPrice"] == pytest.approx(disc_price * 2)
    assert data["discountAmount"] == pytest.approx((std_price - disc_price) * 2)
    assert data["currency"] == "AZN"

    # Hotel snapshot
    assert "hotel" in data and data["hotel"] is not None
    assert data["hotel"]["name"] == hotel["name"]
    assert data["hotel"]["address"] == hotel["address"]
    assert "image" in data["hotel"]

    # Profilin avtomatik yenilənməsinin yoxlanışı
    guest = (await seeded_session.execute(select(Guest).where(Guest.device_id == device_id))).scalars().first()
    assert guest is not None
    profile = (await seeded_session.execute(select(GuestProfile).where(GuestProfile.guest_id == guest.id))).scalars().first()
    assert profile is not None
    assert profile.first_name == "Tural"
    assert profile.last_name == "Əliyev"
    assert profile.phone == "+994503334455"
    assert profile.email == "tural@example.com"


@pytest.mark.asyncio
async def test_create_booking_idempotency(client: AsyncClient, seeded_session):
    device_id = str(uuid.uuid4())
    idem_key = "STN-IDEM-" + str(uuid.uuid4())
    headers = {"X-Device-Id": device_id, "Idempotency-Key": idem_key}

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    payload = {
        "hotelId": hotel_id,
        "checkIn": (date.today() + timedelta(days=10)).isoformat(),
        "checkOut": (date.today() + timedelta(days=12)).isoformat(),
        "adults": 1,
        "children": 0,
        "firstName": "Rəşad",
        "lastName": "Məmmədov",
        "phone": "+994501239988",
        "email": "reshad@example.com",
    }

    # 1. İlk sorğu -> 201 Created
    res1 = await client.post("/api/v1/bookings", json=payload, headers=headers)
    assert res1.status_code == 201
    booking1 = res1.json()

    # 2. Eyni Idempotency-Key ilə ikinci sorğu -> 200 OK və eyni rezervasiya
    res2 = await client.post("/api/v1/bookings", json=payload, headers=headers)
    assert res2.status_code == 200
    booking2 = res2.json()

    assert booking1["id"] == booking2["id"]
    assert booking1["reference"] == booking2["reference"]
    assert booking1["createdAt"] == booking2["createdAt"]

    # Bazada yalnız 1 rezervasiya olduğunu yoxla
    bookings_stmt = select(Booking).where(Booking.idempotency_key == idem_key)
    all_matching = (await seeded_session.execute(bookings_stmt)).scalars().all()
    assert len(all_matching) == 1


@pytest.mark.asyncio
async def test_booking_price_calculated_server_side_only(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id, "Idempotency-Key": str(uuid.uuid4())}

    res_hotels = await client.get("/api/v1/hotels")
    hotel = res_hotels.json()["items"][0]
    hotel_id = hotel["id"]
    actual_disc_price = float(hotel["discountedPrice"])

    # Müştəri fırıldaq edib kiçik qiymət göndərməyə çalışsa belə qəbul edilməməlidir
    malicious_payload = {
        "hotelId": hotel_id,
        "checkIn": (date.today() + timedelta(days=15)).isoformat(),
        "checkOut": (date.today() + timedelta(days=18)).isoformat(),  # 3 gecə
        "adults": 1,
        "firstName": "Hacker",
        "lastName": "User",
        "phone": "+994501112233",
        "email": "hacker@example.com",
        "totalPrice": 1.0,  # Göndərilən saxta qiymət
        "pricePerNight": 0.5,
    }

    res = await client.post("/api/v1/bookings", json=malicious_payload, headers=headers)
    assert res.status_code == 201
    data = res.json()

    # Server öz hesabatı ilə yazmalıdır
    assert data["pricePerNight"] == pytest.approx(actual_disc_price)
    assert data["totalPrice"] == pytest.approx(actual_disc_price * 3)


@pytest.mark.asyncio
async def test_create_booking_invalid_dates_and_counts(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id, "Idempotency-Key": str(uuid.uuid4())}

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    base_payload = {
        "hotelId": hotel_id,
        "adults": 2,
        "firstName": "Ayxan",
        "lastName": "Qasımov",
        "phone": "+994509998877",
        "email": "ayxan@example.com",
    }

    # 1. Giriş tarixi keçmişdə olduqda
    past_date = (date.today() - timedelta(days=1)).isoformat()
    r_past = await client.post(
        "/api/v1/bookings",
        json={**base_payload, "checkIn": past_date, "checkOut": (date.today() + timedelta(days=2)).isoformat()},
        headers=headers,
    )
    assert r_past.status_code == 422
    assert "bu gündən əvvəl" in r_past.text

    # 2. Çıxış tarixi girişlə eyni və ya ondan əvvəl olduqda
    in_date = (date.today() + timedelta(days=3)).isoformat()
    r_dates = await client.post(
        "/api/v1/bookings",
        json={**base_payload, "checkIn": in_date, "checkOut": in_date},
        headers=headers,
    )
    assert r_dates.status_code == 422
    assert "sonra olmalıdır" in r_dates.text

    # 3. 30 gecədən çox rezervasiya (məs. 31 gecə)
    r_max_nights = await client.post(
        "/api/v1/bookings",
        json={
            **base_payload,
            "checkIn": (date.today() + timedelta(days=2)).isoformat(),
            "checkOut": (date.today() + timedelta(days=34)).isoformat(),
        },
        headers=headers,
    )
    assert r_max_nights.status_code == 422
    assert "30 gecə" in r_max_nights.text

    # 4. Böyüklərin sayı < 1
    r_adults = await client.post(
        "/api/v1/bookings",
        json={
            **base_payload,
            "checkIn": (date.today() + timedelta(days=2)).isoformat(),
            "checkOut": (date.today() + timedelta(days=4)).isoformat(),
            "adults": 0,
        },
        headers=headers,
    )
    assert r_adults.status_code == 422
    assert "ən azı 1" in r_adults.text

    # 5. Qonaq sayı cəmi > 6 (məsələn, 5 böyük + 2 uşaq = 7)
    r_limit = await client.post(
        "/api/v1/bookings",
        json={
            **base_payload,
            "checkIn": (date.today() + timedelta(days=2)).isoformat(),
            "checkOut": (date.today() + timedelta(days=4)).isoformat(),
            "adults": 5,
            "children": 2,
        },
        headers=headers,
    )
    assert r_limit.status_code == 422
    assert "maksimum 6" in r_limit.text

    # 6. Mövcud olmayan otel ID -> 404
    r_fake_hotel = await client.post(
        "/api/v1/bookings",
        json={
            **base_payload,
            "hotelId": str(uuid.uuid4()),
            "checkIn": (date.today() + timedelta(days=2)).isoformat(),
            "checkOut": (date.today() + timedelta(days=4)).isoformat(),
        },
        headers=headers,
    )
    assert r_fake_hotel.status_code == 404


@pytest.mark.asyncio
async def test_overbooking_parallel_requests(client: AsyncClient, seeded_session):
    """
    Paralel sorğularla overbooking testi:
    rooms_total=1 olan otelə eyni tarix üçün 2 paralel sorğu göndərilir.
    Biri 201 Created almalı, digəri isə 409 Conflict (code: NO_AVAILABILITY) almalıdır.
    """
    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    # Otelin otaq sayını 1 edirik
    h_stmt = select(Hotel).where(Hotel.id == uuid.UUID(hotel_id))
    h = (await seeded_session.execute(h_stmt)).scalars().first()
    h.rooms_total = 1
    await seeded_session.commit()

    check_in = (date.today() + timedelta(days=20)).isoformat()
    check_out = (date.today() + timedelta(days=22)).isoformat()

    guest_1 = str(uuid.uuid4())
    guest_2 = str(uuid.uuid4())

    payload_1 = {
        "hotelId": hotel_id,
        "checkIn": check_in,
        "checkOut": check_out,
        "adults": 1,
        "firstName": "Paralel 1",
        "lastName": "User",
        "phone": "+994501111111",
        "email": "p1@example.com",
    }
    payload_2 = {
        "hotelId": hotel_id,
        "checkIn": check_in,
        "checkOut": check_out,
        "adults": 1,
        "firstName": "Paralel 2",
        "lastName": "User",
        "phone": "+994502222222",
        "email": "p2@example.com",
    }

    # Eyni anda paralel göndər
    req1 = client.post(
        "/api/v1/bookings",
        json=payload_1,
        headers={"X-Device-Id": guest_1, "Idempotency-Key": str(uuid.uuid4())},
    )
    req2 = client.post(
        "/api/v1/bookings",
        json=payload_2,
        headers={"X-Device-Id": guest_2, "Idempotency-Key": str(uuid.uuid4())},
    )

    resp1, resp2 = await asyncio.gather(req1, req2)
    statuses = {resp1.status_code, resp2.status_code}

    assert 201 in statuses
    assert 409 in statuses

    conflict_resp = resp1 if resp1.status_code == 409 else resp2
    conflict_json = conflict_resp.json()
    assert conflict_json["error"]["code"] == "NO_AVAILABILITY"
    assert "boş otaq qalmayıb" in conflict_json["error"]["message"]


@pytest.mark.asyncio
async def test_booking_cancellation_rules_and_idempotency(client: AsyncClient, seeded_session):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    # 1. 24 saatdan çox vaxt qalan rezervasiya yaradılır (məs. 4 gün sonra)
    res_b = await client.post(
        "/api/v1/bookings",
        json={
            "hotelId": hotel_id,
            "checkIn": (date.today() + timedelta(days=4)).isoformat(),
            "checkOut": (date.today() + timedelta(days=6)).isoformat(),
            "adults": 1,
            "firstName": "Nigar",
            "lastName": "Rzayeva",
            "phone": "+994505556677",
            "email": "nigar@example.com",
        },
        headers={**headers, "Idempotency-Key": str(uuid.uuid4())},
    )
    assert res_b.status_code == 201
    booking_id = res_b.json()["id"]

    # Simulyasiya: paymentStatus = PAID edək ki, refund yoxlansın
    b_obj = (await seeded_session.execute(select(Booking).where(Booking.id == uuid.UUID(booking_id)))).scalars().first()
    b_obj.payment_status = PaymentStatus.PAID
    await seeded_session.commit()

    # Ləğv etmə sorğusu -> 200 OK
    res_cancel = await client.post(f"/api/v1/bookings/{booking_id}/cancel", headers=headers)
    assert res_cancel.status_code == 200
    cancel_data = res_cancel.json()
    assert cancel_data["status"] == "cancelled"
    assert cancel_data["paymentStatus"] == "refunded"
    assert cancel_data["cancelledAt"] is not None

    # İdempotentlik: artıq ləğv edilmiş rezervasiyanı təkrar ləğv etdikdə 200 və cari vəziyyət qaytarır
    res_cancel_dup = await client.post(f"/api/v1/bookings/{booking_id}/cancel", headers=headers)
    assert res_cancel_dup.status_code == 200
    assert res_cancel_dup.json()["status"] == "cancelled"

    # 2. 24 saatdan az qalmış rezervasiyanın ləğv edilməsinə icazə VERİLMƏMƏLİDİR
    # Bazada birbaşa sabah üçün (1 gün) rezervasiya yaradaq və saatı 12:00 edək
    urgent_booking = Booking(
        id=uuid.uuid4(),
        reference="STN-URG001",
        guest_id=(await seeded_session.execute(select(Guest).where(Guest.device_id == device_id))).scalars().first().id,
        hotel_id=uuid.UUID(hotel_id),
        check_in=date.today(),  # Bu gün üçün giriş
        check_out=date.today() + timedelta(days=1),
        adults=1,
        children=0,
        first_name="Tez",
        last_name="Gələn",
        phone="+994501112233",
        email="urgent@example.com",
        nights=1,
        price_per_night=Decimal("100.00"),
        total_price=Decimal("100.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
    )
    seeded_session.add(urgent_booking)
    await seeded_session.commit()

    res_urgent_cancel = await client.post(f"/api/v1/bookings/{urgent_booking.id}/cancel", headers=headers)
    assert res_urgent_cancel.status_code == 409
    assert res_urgent_cancel.json()["error"]["code"] == "CANCELLATION_NOT_ALLOWED"
    assert "24 saat" in res_urgent_cancel.json()["error"]["message"]


@pytest.mark.asyncio
async def test_list_bookings_filtering_and_pagination(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    # 3 rezervasiya yaradaq (müxtəlif tarixlərdə)
    for i in range(1, 4):
        await client.post(
            "/api/v1/bookings",
            json={
                "hotelId": hotel_id,
                "checkIn": (date.today() + timedelta(days=i * 5)).isoformat(),
                "checkOut": (date.today() + timedelta(days=i * 5 + 2)).isoformat(),
                "adults": 1,
                "firstName": f"User {i}",
                "lastName": "Test",
                "phone": f"+99450111223{i}",
                "email": f"user{i}@example.com",
            },
            headers={**headers, "Idempotency-Key": f"key-filter-{i}-{uuid.uuid4()}"},
        )

    # 1. Bütün rezervasiyaları gətir
    res_all = await client.get("/api/v1/bookings", headers=headers)
    assert res_all.status_code == 200
    all_bookings = res_all.json()
    assert len(all_bookings) == 3
    # Ən yenisi ən yuxarıda olmalıdır (created_at desc)
    created_times = [b["createdAt"] for b in all_bookings]
    assert created_times == sorted(created_times, reverse=True)

    # Birini ləğv edək
    to_cancel_id = all_bookings[0]["id"]
    await client.post(f"/api/v1/bookings/{to_cancel_id}/cancel", headers=headers)

    # 2. Status üzrə filtrasiya
    res_conf = await client.get("/api/v1/bookings?status=confirmed", headers=headers)
    assert len(res_conf.json()) == 2
    for b in res_conf.json():
        assert b["status"] == "confirmed"

    res_canc = await client.get("/api/v1/bookings?status=cancelled", headers=headers)
    assert len(res_canc.json()) == 1
    assert res_canc.json()[0]["id"] == to_cancel_id

    # 3. Səhifələmə (Pagination)
    res_page1 = await client.get("/api/v1/bookings?page=1&limit=2", headers=headers)
    assert len(res_page1.json()) == 2

    res_page2 = await client.get("/api/v1/bookings?page=2&limit=2", headers=headers)
    assert len(res_page2.json()) == 1


@pytest.mark.asyncio
async def test_get_single_booking_and_cross_guest_isolation(client: AsyncClient):
    guest_a = str(uuid.uuid4())
    guest_b = str(uuid.uuid4())

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    res_create = await client.post(
        "/api/v1/bookings",
        json={
            "hotelId": hotel_id,
            "checkIn": (date.today() + timedelta(days=8)).isoformat(),
            "checkOut": (date.today() + timedelta(days=10)).isoformat(),
            "adults": 1,
            "firstName": "Single",
            "lastName": "User",
            "phone": "+994501234567",
            "email": "single@example.com",
        },
        headers={"X-Device-Id": guest_a, "Idempotency-Key": str(uuid.uuid4())},
    )
    assert res_create.status_code == 201
    booking_id = res_create.json()["id"]
    reference = res_create.json()["reference"]

    # 1. Guest A öz rezervasiyasını ID ilə görə bilir
    res_a_id = await client.get(f"/api/v1/bookings/{booking_id}", headers={"X-Device-Id": guest_a})
    assert res_a_id.status_code == 200
    assert res_a_id.json()["id"] == booking_id

    # 2. Guest A öz rezervasiyasını Reference ilə də görə bilir
    res_a_ref = await client.get(f"/api/v1/bookings/{reference}", headers={"X-Device-Id": guest_a})
    assert res_a_ref.status_code == 200
    assert res_a_ref.json()["reference"] == reference

    # 3. Guest B Guest A-nın rezervasiyasını sorğuladıqda 404 Not Found almalıdır
    res_b_id = await client.get(f"/api/v1/bookings/{booking_id}", headers={"X-Device-Id": guest_b})
    assert res_b_id.status_code == 404
    assert res_b_id.json()["error"]["code"] == "NOT_FOUND"

    res_b_ref = await client.get(f"/api/v1/bookings/{reference}", headers={"X-Device-Id": guest_b})
    assert res_b_ref.status_code == 404
    assert res_b_ref.json()["error"]["code"] == "NOT_FOUND"

