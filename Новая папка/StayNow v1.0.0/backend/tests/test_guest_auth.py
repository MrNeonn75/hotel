import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.models.guest import Guest, GuestProfile


@pytest.mark.asyncio
async def test_protected_routes_require_x_device_id(client: AsyncClient):
    # Favorites without header -> 400
    res_fav = await client.get("/api/v1/favorites")
    assert res_fav.status_code == 400
    assert res_fav.json()["error"]["code"] == "BAD_REQUEST"
    assert "X-Device-Id" in res_fav.json()["error"]["message"]

    # Profile without header -> 400
    res_prof = await client.get("/api/v1/profile")
    assert res_prof.status_code == 400
    assert res_prof.json()["error"]["code"] == "BAD_REQUEST"
    assert "X-Device-Id" in res_prof.json()["error"]["message"]

    # Bookings without header -> 400
    res_book = await client.get("/api/v1/bookings")
    assert res_book.status_code == 400
    assert res_book.json()["error"]["code"] == "BAD_REQUEST"
    assert "X-Device-Id" in res_book.json()["error"]["message"]


@pytest.mark.asyncio
async def test_invalid_device_id_format(client: AsyncClient):
    # Non-UUID string -> 400
    res_invalid = await client.get("/api/v1/favorites", headers={"X-Device-Id": "not-a-uuid"})
    assert res_invalid.status_code == 400
    assert "UUID v4" in res_invalid.json()["error"]["message"]

    # Empty string -> 400
    res_empty = await client.get("/api/v1/favorites", headers={"X-Device-Id": "   "})
    assert res_empty.status_code == 400
    assert "X-Device-Id" in res_empty.json()["error"]["message"]

    # UUID v1 (not v4) -> 400
    uuid_v1 = str(uuid.uuid1())
    res_v1 = await client.get("/api/v1/favorites", headers={"X-Device-Id": uuid_v1})
    assert res_v1.status_code == 400
    assert "UUID v4" in res_v1.json()["error"]["message"]


@pytest.mark.asyncio
async def test_public_routes_do_not_require_device_id(client: AsyncClient):
    # Hotels list endpoint is public
    res_hotels = await client.get("/api/v1/hotels")
    assert res_hotels.status_code == 200

    # Hotel search is public
    res_search = await client.get("/api/v1/hotels", params={"city": "Bakı"})
    assert res_search.status_code == 200


@pytest.mark.asyncio
async def test_new_guest_auto_creation_and_last_seen_update(client: AsyncClient, seeded_session):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    # 1. First request creates guest and profile
    res1 = await client.get("/api/v1/favorites/ids", headers=headers)
    assert res1.status_code == 200
    assert res1.json() == []

    # Check database
    guest_stmt = select(Guest).where(Guest.device_id == device_id)
    guest = (await seeded_session.execute(guest_stmt)).scalars().first()
    assert guest is not None
    assert guest.device_id == device_id
    initial_last_seen = guest.last_seen_at

    # Check default profile created
    prof_stmt = select(GuestProfile).where(GuestProfile.guest_id == guest.id)
    profile = (await seeded_session.execute(prof_stmt)).scalars().first()
    assert profile is not None
    assert profile.preferred_language == "az"

    # 2. Second request with same device_id should reuse guest and update last_seen_at
    res2 = await client.get("/api/v1/profile", headers=headers)
    assert res2.status_code == 200

    await seeded_session.refresh(guest)
    # Ensure guest was not duplicated
    all_guests = (await seeded_session.execute(guest_stmt)).scalars().all()
    assert len(all_guests) == 1
    assert guest.last_seen_at >= initial_last_seen


@pytest.mark.asyncio
async def test_guest_cross_resource_isolation_returns_404(client: AsyncClient):
    guest_a = str(uuid.uuid4())
    guest_b = str(uuid.uuid4())

    # Fetch hotels
    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    # Guest A creates booking
    booking_payload = {
        "hotelId": hotel_id,
        "checkInDate": "2026-11-10",
        "checkOutDate": "2026-11-12",
        "adults": 2,
        "firstName": "Qonaq A",
        "phone": "+994501112233",
        "email": "guest_a@test.com",
    }
    res_book = await client.post(
        "/api/v1/bookings",
        json=booking_payload,
        headers={"X-Device-Id": guest_a, "Idempotency-Key": str(uuid.uuid4())},
    )
    assert res_book.status_code == 201
    booking_id = res_book.json()["id"]

    # Guest A can see the booking
    res_a_view = await client.get(f"/api/v1/bookings/{booking_id}", headers={"X-Device-Id": guest_a})
    assert res_a_view.status_code == 200

    # Guest B cannot see Guest A's booking -> returns 404
    res_b_view = await client.get(f"/api/v1/bookings/{booking_id}", headers={"X-Device-Id": guest_b})
    assert res_b_view.status_code == 404
    assert res_b_view.json()["error"]["code"] == "NOT_FOUND"

    # Guest B cannot cancel Guest A's booking -> returns 404
    res_b_cancel = await client.patch(f"/api/v1/bookings/{booking_id}/cancel", headers={"X-Device-Id": guest_b})
    assert res_b_cancel.status_code == 404
    assert res_b_cancel.json()["error"]["code"] == "NOT_FOUND"
