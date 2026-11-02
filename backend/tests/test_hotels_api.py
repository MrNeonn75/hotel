import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.models.booking import Booking
from app.models.enums import BookingStatus, PaymentStatus
from app.models.guest import Guest
from app.models.hotel import Hotel


@pytest.mark.asyncio
async def test_get_hotels_default_list(client: AsyncClient):
    response = await client.get("/api/v1/hotels")
    assert response.status_code == 200
    data = response.json()

    assert "items" in data
    assert "page" in data
    assert "pageSize" in data
    assert "total" in data

    assert data["total"] == 10
    assert len(data["items"]) == 10
    assert data["page"] == 1
    assert data["pageSize"] == 20

    # Test frontend schema alignment
    item = data["items"][0]
    required_fields = [
        "id",
        "name",
        "city",
        "address",
        "latitude",
        "longitude",
        "images",
        "rating",
        "reviewCount",
        "standardPrice",
        "discountedPrice",
        "discountPercent",
        "currency",
        "amenities",
        "advantages",
        "checkInTime",
        "checkOutTime",
    ]
    for field in required_fields:
        assert field in item, f"Sahə '{field}' cavabda tapılmadı"

    assert isinstance(item["images"], list)
    assert len(item["images"]) == 5
    assert isinstance(item["amenities"], list)


@pytest.mark.asyncio
async def test_get_hotels_search_and_city(client: AsyncClient):
    # Search by name
    res = await client.get("/api/v1/hotels", params={"q": "Boulevard"})
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert "Boulevard" in data["items"][0]["name"]

    # Search by city
    res_city = await client.get("/api/v1/hotels", params={"city": "Bakı"})
    assert res_city.status_code == 200
    assert res_city.json()["total"] == 10

    # Search not found
    res_empty = await client.get("/api/v1/hotels", params={"q": "MövcudOlmayanOtel"})
    assert res_empty.status_code == 200
    assert res_empty.json()["total"] == 0
    assert len(res_empty.json()["items"]) == 0


@pytest.mark.asyncio
async def test_get_hotels_price_and_discount_filter(client: AsyncClient):
    res = await client.get("/api/v1/hotels", params={"minPrice": 100, "maxPrice": 250})
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert 100 <= item["discountedPrice"] <= 250

    # hasDiscount filter
    res_disc = await client.get("/api/v1/hotels", params={"hasDiscount": "true"})
    assert res_disc.status_code == 200
    for item in res_disc.json()["items"]:
        assert item["discountPercent"] > 0


@pytest.mark.asyncio
async def test_get_hotels_amenities_all_match(client: AsyncClient):
    # "wifi,pool,spa" - hamısı olmalıdır
    res = await client.get("/api/v1/hotels", params={"amenities": "wifi,pool,spa"})
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    for item in data["items"]:
        amenities = item["amenities"]
        assert "wifi" in amenities
        assert "pool" in amenities
        assert "spa" in amenities


@pytest.mark.asyncio
async def test_get_hotels_sorting(client: AsyncClient):
    # price_asc
    res_asc = await client.get("/api/v1/hotels", params={"sort": "price_asc"})
    items_asc = res_asc.json()["items"]
    prices_asc = [it["discountedPrice"] for it in items_asc]
    assert prices_asc == sorted(prices_asc)

    # price_desc
    res_desc = await client.get("/api/v1/hotels", params={"sort": "price_desc"})
    items_desc = res_desc.json()["items"]
    prices_desc = [it["discountedPrice"] for it in items_desc]
    assert prices_desc == sorted(prices_desc, reverse=True)

    # rating_desc
    res_rating = await client.get("/api/v1/hotels", params={"sort": "rating_desc"})
    ratings = [it["rating"] for it in res_rating.json()["items"]]
    assert ratings == sorted(ratings, reverse=True)


@pytest.mark.asyncio
async def test_get_hotels_haversine_distance_filter(client: AsyncClient):
    # Ağ Şəhər Bulvar otelinin koordinatları: 40.3804, 49.8821
    res = await client.get(
        "/api/v1/hotels",
        params={"lat": 40.3804, "lng": 49.8821, "radiusKm": 4.0},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert "distanceKm" in item
        assert item["distanceKm"] is not None
        assert item["distanceKm"] <= 4.0


@pytest.mark.asyncio
async def test_get_hotels_pagination(client: AsyncClient):
    res = await client.get("/api/v1/hotels", params={"page": 2, "pageSize": 3})
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 2
    assert data["pageSize"] == 3
    assert data["total"] == 10
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_get_hotel_by_id_success_and_not_found(client: AsyncClient):
    # 1. Mövcud otelin ID-sini al
    res_list = await client.get("/api/v1/hotels")
    hotel_id = res_list.json()["items"][0]["id"]

    # 2. Detalları çək
    res_detail = await client.get(f"/api/v1/hotels/{hotel_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["id"] == hotel_id
    assert "description" in detail
    assert "rules" in detail
    assert "importantInfo" in detail
    assert len(detail["images"]) == 5

    # 3. Tapılmayan otel (404)
    fake_id = "00000000-0000-0000-0000-000000000000"
    res_404 = await client.get(f"/api/v1/hotels/{fake_id}")
    assert res_404.status_code == 404
    err_data = res_404.json()
    assert err_data["error"]["code"] == "NOT_FOUND"
    assert "tapılmadı" in err_data["error"]["message"]


@pytest.mark.asyncio
async def test_get_hotels_by_ids_preserves_order(client: AsyncClient):
    res_list = await client.get("/api/v1/hotels")
    items = res_list.json()["items"]
    id_1 = items[0]["id"]
    id_2 = items[1]["id"]
    id_3 = items[2]["id"]

    # İstənilən ardıcıllıq: id_3, id_1, id_2
    requested_ids = f"{id_3},{id_1},{id_2}"
    res = await client.get("/api/v1/hotels/by-ids", params={"ids": requested_ids})
    assert res.status_code == 200
    data = res.json()

    assert len(data) == 3
    assert data[0]["id"] == id_3
    assert data[1]["id"] == id_1
    assert data[2]["id"] == id_2


@pytest.mark.asyncio
async def test_get_hotel_availability(client: AsyncClient):
    res_list = await client.get("/api/v1/hotels")
    hotel_id = res_list.json()["items"][0]["id"]

    today = date.today()
    check_in = str(today + timedelta(days=10))
    check_out = str(today + timedelta(days=12))

    # Uğurlu availability sorğusu
    res = await client.get(
        f"/api/v1/hotels/{hotel_id}/availability",
        params={"checkIn": check_in, "checkOut": check_out, "guests": 2},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["available"] is True
    assert data["roomsLeft"] > 0

    # Yanlış tarixlər (check_out <= check_in)
    res_bad = await client.get(
        f"/api/v1/hotels/{hotel_id}/availability",
        params={"checkIn": check_out, "checkOut": check_in},
    )
    assert res_bad.status_code == 422
    assert "Çıxış tarixi" in res_bad.json()["error"]["message"]

    # Mövcud olmayan otel
    res_404 = await client.get(
        "/api/v1/hotels/00000000-0000-0000-0000-000000000000/availability",
        params={"checkIn": check_in, "checkOut": check_out},
    )
    assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_hotels_filter_by_availability(client: AsyncClient, seeded_session):
    # Bütün otaqları dolmuş otel ssenarisi
    res_list = await client.get("/api/v1/hotels")
    first_hotel = res_list.json()["items"][0]
    hotel_id = first_hotel["id"]

    check_in_date = date.today() + timedelta(days=20)
    check_out_date = check_in_date + timedelta(days=3)

    # Otelin bütün otaqlarını rezerv edək
    hotel_record = await seeded_session.scalar(select(Hotel).where(Hotel.id == uuid.UUID(hotel_id)))
    guest_record = await seeded_session.scalar(select(Guest).limit(1))

    for i in range(hotel_record.rooms_total):
        b = Booking(
            reference=f"STN-TEST{i:03d}",
            guest_id=guest_record.id,
            hotel_id=hotel_record.id,
            check_in=check_in_date,
            check_out=check_out_date,
            adults=1,
            first_name="Test",
            last_name="User",
            phone="123",
            email="test@test.com",
            nights=3,
            price_per_night=Decimal("100"),
            total_price=Decimal("300"),
            status=BookingStatus.CONFIRMED,
            payment_status=PaymentStatus.PAID,
        )
        seeded_session.add(b)
    await seeded_session.commit()

    # İndi həmin tarixlərdə otelləri axtaranda bu otel siyahıda olmamalıdır
    res_avail = await client.get(
        "/api/v1/hotels",
        params={"checkIn": str(check_in_date), "checkOut": str(check_out_date)},
    )
    assert res_avail.status_code == 200
    avail_hotels = res_avail.json()["items"]
    avail_ids = [h["id"] for h in avail_hotels]
    assert hotel_id not in avail_ids
    assert res_avail.json()["total"] == 9
