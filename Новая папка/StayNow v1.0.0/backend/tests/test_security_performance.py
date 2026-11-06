import logging
import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.core.limiter import limiter
from app.core.logging import SensitiveDataFilter


@pytest.mark.asyncio
async def test_input_whitespace_stripping_and_max_length(client: AsyncClient):
    """Bütün CamelModel sahələrində boşluqların (strip) təmizlənməsini və max_length yoxlayır."""
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    # 1. Profil məlumatlarında boşluqların avtomatik təmizlənməsi
    update_data = {
        "firstName": "   Rəşad   ",
        "lastName": "   Məmmədov   ",
        "city": "   Gəncə   ",
        "address": "   Nizami küç. 45   ",
    }
    put_resp = await client.put("/api/v1/profile", json=update_data, headers=headers)
    assert put_resp.status_code == 200
    prof = put_resp.json()
    assert prof["firstName"] == "Rəşad"
    assert prof["lastName"] == "Məmmədov"
    assert prof["city"] == "Gəncə"
    assert prof["address"] == "Nizami küç. 45"

    # 2. Rezervasiyada specialRequests sahəsinin 500 simvol limiti
    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    too_long_requests = "A" * 501
    valid_requests = "B" * 500

    # 501 simvol -> 422 xəta
    r_fail = await client.post(
        "/api/v1/bookings",
        json={
            "hotelId": hotel_id,
            "checkIn": (date.today() + timedelta(days=2)).isoformat(),
            "checkOut": (date.today() + timedelta(days=4)).isoformat(),
            "adults": 1,
            "firstName": "Test",
            "lastName": "User",
            "phone": "+994501112233",
            "email": "test@example.com",
            "specialRequests": too_long_requests,
        },
        headers={"X-Device-Id": device_id, "Idempotency-Key": str(uuid.uuid4())},
    )
    assert r_fail.status_code == 422
    assert "specialRequests" in r_fail.text or "special_requests" in r_fail.text

    # 500 simvol -> uğurlu 201
    r_ok = await client.post(
        "/api/v1/bookings",
        json={
            "hotelId": hotel_id,
            "checkIn": (date.today() + timedelta(days=2)).isoformat(),
            "checkOut": (date.today() + timedelta(days=4)).isoformat(),
            "adults": 1,
            "firstName": "Test",
            "lastName": "User",
            "phone": "+994501112233",
            "email": "test@example.com",
            "specialRequests": valid_requests,
        },
        headers={"X-Device-Id": device_id, "Idempotency-Key": str(uuid.uuid4())},
    )
    assert r_ok.status_code == 201
    assert len(r_ok.json()["specialRequests"]) == 500


def test_sensitive_data_logging_filter():
    """Həssas sahələrin (phone, email, documentNumber) loglarda maskalanmasını yoxlayır."""
    s_filter = SensitiveDataFilter()

    # 1. Düz mətn mesajında maskalama
    record1 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg="İstifadəçi qeydiyyatı: email=elshan.dev@example.com və telefon=+994501234567, sənəd AA1234567",
        args=(),
        exc_info=None,
    )
    s_filter.filter(record1)
    assert "elshan.dev@example.com" not in record1.msg
    assert "+994501234567" not in record1.msg
    assert "el***@example.com" in record1.msg
    assert "+99450****567" in record1.msg

    # 2. Key-value formatında maskalama
    record2 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg="Giriş: phone: '+994559876543', email: 'test@mail.az', documentNumber: 'C1234567'",
        args=(),
        exc_info=None,
    )
    s_filter.filter(record2)
    assert "+994559876543" not in record2.msg
    assert "test@mail.az" not in record2.msg
    assert "C1234567" not in record2.msg

    # 3. Dict tipli args arqumentlərində maskalama
    record3 = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="",
        lineno=0,
        msg="Profil məlumatları: %s",
        args=(
            {
                "phone": "+994701112233",
                "email": "admin@staynow.az",
                "document_number": "A9988776",
                "city": "Bakı",
            },
        ),
        exc_info=None,
    )
    s_filter.filter(record3)
    dict_arg = record3.args if isinstance(record3.args, dict) else record3.args[0]
    assert dict_arg["phone"] == "****"
    assert dict_arg["email"] == "****"
    assert dict_arg["document_number"] == "****"
    assert dict_arg["city"] == "Bakı"


@pytest.mark.asyncio
async def test_hotels_etag_and_caching(client: AsyncClient):
    """Hotels siyahısı üçün ETag və Cache-Control (60s) başlığının işləməsini yoxlayır."""
    resp1 = await client.get("/api/v1/hotels")
    assert resp1.status_code == 200
    assert "ETag" in resp1.headers
    assert "Cache-Control" in resp1.headers
    assert "max-age=60" in resp1.headers["Cache-Control"]

    etag = resp1.headers["ETag"]
    assert etag.startswith('"') and etag.endswith('"')

    # If-None-Match ilə təkrar sorğu -> 304 Not Modified
    resp2 = await client.get("/api/v1/hotels", headers={"If-None-Match": etag})
    assert resp2.status_code == 304
    assert resp2.headers["ETag"] == etag
    assert "max-age=60" in resp2.headers["Cache-Control"]
    assert resp2.text == ""

    # Fərqli ETag ilə sorğu -> 200 OK
    resp3 = await client.get("/api/v1/hotels", headers={"If-None-Match": '"different-hash"'})
    assert resp3.status_code == 200


@pytest.mark.asyncio
async def test_gzip_compression(client: AsyncClient):
    """GZip middleware vasitəsilə 1000 baytdan böyük cavabların sıxışdırılmasını yoxlayır."""
    resp = await client.get("/api/v1/hotels", headers={"Accept-Encoding": "gzip"})
    assert resp.status_code == 200
    assert resp.headers.get("Content-Encoding") == "gzip"


@pytest.mark.asyncio
async def test_rate_limiting_device_bookings(client: AsyncClient):
    """POST /api/v1/bookings üçün cihaz üzrə 10/dəqiqə limitini yoxlayır."""
    limiter.reset()

    dev_a = str(uuid.uuid4())
    dev_b = str(uuid.uuid4())

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    booking_payload = {
        "hotelId": hotel_id,
        "checkIn": (date.today() + timedelta(days=5)).isoformat(),
        "checkOut": (date.today() + timedelta(days=7)).isoformat(),
        "adults": 1,
        "firstName": "Murad",
        "lastName": "Əliyev",
        "phone": "+994503334455",
        "email": "murad@example.com",
    }

    # Device A ilə ardıcıl 10 sorğu göndəririk (limit 10/dəqiqədir)
    for i in range(10):
        r = await client.post(
            "/api/v1/bookings",
            json=booking_payload,
            headers={"X-Device-Id": dev_a, "Idempotency-Key": f"key-{i}-{uuid.uuid4()}"},
        )
        assert r.status_code in (200, 201, 409)

    # 11-ci sorğu 429 TOO_MANY_REQUESTS qaytarmalıdır
    r11 = await client.post(
        "/api/v1/bookings",
        json=booking_payload,
        headers={"X-Device-Id": dev_a, "Idempotency-Key": f"key-11-{uuid.uuid4()}"},
    )
    assert r11.status_code == 429
    err = r11.json()
    assert err["error"]["code"] == "TOO_MANY_REQUESTS"
    assert "Həddindən artıq çox sorğu" in err["error"]["message"]
    assert "Retry-After" in r11.headers

    # Device B isə bloklanmamış olmalıdır
    r_dev_b = await client.post(
        "/api/v1/bookings",
        json=booking_payload,
        headers={"X-Device-Id": dev_b, "Idempotency-Key": f"key-b-{uuid.uuid4()}"},
    )
    assert r_dev_b.status_code in (200, 201, 409)


@pytest.mark.asyncio
async def test_health_liveness_independence_from_db(client: AsyncClient):
    """Liveness probe (/health) DB xətası olduqda belə 200 qaytarmalıdır."""
    with patch("app.routers.health.check_db_connection", new_callable=AsyncMock) as mock_db:
        mock_db.return_value = False

        # Liveness DB-yə baxmır -> 200 OK
        live_resp = await client.get("/api/v1/health")
        assert live_resp.status_code == 200
        assert live_resp.json()["status"] == "healthy"

        # Readiness isə DB-yə baxır -> 503
        ready_resp = await client.get("/api/v1/health/ready")
        assert ready_resp.status_code == 503
        assert ready_resp.json()["status"] == "unhealthy"


@pytest.mark.asyncio
async def test_rate_limiting_public_endpoints_ip(client: AsyncClient):
    """Public endpoint-lər üçün IP üzrə 120/dəqiqə limitini yoxlayır."""
    limiter.reset()

    for _ in range(120):
        r = await client.get("/api/v1/hotels")
        assert r.status_code == 200

    r121 = await client.get("/api/v1/hotels")
    assert r121.status_code == 429
    assert r121.json()["error"]["code"] == "TOO_MANY_REQUESTS"
