import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_favorites_crud_and_idempotency(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    # 1. Fetch hotels to get valid hotel IDs
    res_hotels = await client.get("/api/v1/hotels")
    hotels = res_hotels.json()["items"]
    hotel_1 = hotels[0]["id"]
    hotel_2 = hotels[1]["id"]

    # 2. Initially empty
    res_list = await client.get("/api/v1/favorites", headers=headers)
    assert res_list.status_code == 200
    assert res_list.json() == []

    res_ids = await client.get("/api/v1/favorites/ids", headers=headers)
    assert res_ids.status_code == 200
    assert res_ids.json() == []

    # 3. Add hotel_1 -> 201 Created
    res_add1 = await client.put(f"/api/v1/favorites/{hotel_1}", headers=headers)
    assert res_add1.status_code == 201
    assert res_add1.json()["isFavorite"] is True
    assert res_add1.json()["hotelId"] == hotel_1
    assert "əlavə olundu" in res_add1.json()["message"]

    # 4. Add hotel_1 again -> 200 OK (idempotent)
    res_add1_dup = await client.put(f"/api/v1/favorites/{hotel_1}", headers=headers)
    assert res_add1_dup.status_code == 200
    assert res_add1_dup.json()["isFavorite"] is True
    assert "artıq" in res_add1_dup.json()["message"]

    # 5. Add hotel_2 -> 201 Created
    res_add2 = await client.put(f"/api/v1/favorites/{hotel_2}", headers=headers)
    assert res_add2.status_code == 201

    # 6. Check IDs (newest added first: hotel_2 then hotel_1)
    res_ids_after = await client.get("/api/v1/favorites/ids", headers=headers)
    assert res_ids_after.status_code == 200
    fav_ids = res_ids_after.json()
    assert fav_ids == [hotel_2, hotel_1]

    # 7. Check full hotel list
    res_full = await client.get("/api/v1/favorites", headers=headers)
    assert res_full.status_code == 200
    full_items = res_full.json()
    assert len(full_items) == 2
    assert full_items[0]["id"] == hotel_2
    assert full_items[1]["id"] == hotel_1
    # Check fields in HotelListItem
    assert "name" in full_items[0]
    assert "discountedPrice" in full_items[0]
    assert "images" in full_items[0]

    # 8. Remove hotel_1 -> 204 No Content
    res_del1 = await client.delete(f"/api/v1/favorites/{hotel_1}", headers=headers)
    assert res_del1.status_code == 204

    # 9. Remove hotel_1 again -> 204 No Content (idempotent)
    res_del1_dup = await client.delete(f"/api/v1/favorites/{hotel_1}", headers=headers)
    assert res_del1_dup.status_code == 204

    # 10. Verify remaining
    res_ids_final = await client.get("/api/v1/favorites/ids", headers=headers)
    assert res_ids_final.json() == [hotel_2]


@pytest.mark.asyncio
async def test_favorites_not_found_hotel(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    fake_hotel_id = str(uuid.uuid4())
    res = await client.put(f"/api/v1/favorites/{fake_hotel_id}", headers=headers)
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_favorites_sync(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    # Fetch hotels
    res_hotels = await client.get("/api/v1/hotels")
    hotels = res_hotels.json()["items"]
    hotel_1 = hotels[0]["id"]
    hotel_2 = hotels[1]["id"]
    hotel_3 = hotels[2]["id"]

    # Pre-populate server favorite with hotel_1
    await client.put(f"/api/v1/favorites/{hotel_1}", headers=headers)

    # Sync local favorites containing hotel_2, hotel_3, plus a fake non-existent ID
    fake_id = str(uuid.uuid4())
    sync_payload = {"hotelIds": [hotel_2, hotel_3, fake_id]}
    res_sync = await client.post("/api/v1/favorites/sync", json=sync_payload, headers=headers)
    assert res_sync.status_code == 200
    synced_ids = res_sync.json()

    # The union must contain hotel_1, hotel_2, hotel_3, and NOT fake_id
    assert set(synced_ids) == {hotel_1, hotel_2, hotel_3}
    assert fake_id not in synced_ids


@pytest.mark.asyncio
async def test_favorites_guest_isolation(client: AsyncClient):
    # Two distinct guests
    guest_a_id = str(uuid.uuid4())
    guest_b_id = str(uuid.uuid4())
    headers_a = {"X-Device-Id": guest_a_id}
    headers_b = {"X-Device-Id": guest_b_id}

    res_hotels = await client.get("/api/v1/hotels")
    hotels = res_hotels.json()["items"]
    hotel_1 = hotels[0]["id"]
    hotel_2 = hotels[1]["id"]

    # Guest A favorites hotel 1
    await client.put(f"/api/v1/favorites/{hotel_1}", headers=headers_a)

    # Guest B favorites hotel 2
    await client.put(f"/api/v1/favorites/{hotel_2}", headers=headers_b)

    # Check Guest A
    res_a = await client.get("/api/v1/favorites/ids", headers=headers_a)
    assert res_a.json() == [hotel_1]

    # Check Guest B
    res_b = await client.get("/api/v1/favorites/ids", headers=headers_b)
    assert res_b.json() == [hotel_2]


@pytest.mark.asyncio
async def test_favorites_idempotency_consecutive_calls(client: AsyncClient):
    device_id = str(uuid.uuid4())
    headers = {"X-Device-Id": device_id}

    res_hotels = await client.get("/api/v1/hotels")
    hotel_id = res_hotels.json()["items"][0]["id"]

    # 1. First PUT -> 201 Created
    r1 = await client.put(f"/api/v1/favorites/{hotel_id}", headers=headers)
    assert r1.status_code == 201

    # 2. Consecutive PUTs -> 200 OK, no duplicates
    r2 = await client.put(f"/api/v1/favorites/{hotel_id}", headers=headers)
    assert r2.status_code == 200
    r3 = await client.put(f"/api/v1/favorites/{hotel_id}", headers=headers)
    assert r3.status_code == 200

    favs = await client.get("/api/v1/favorites/ids", headers=headers)
    assert favs.json() == [hotel_id]

    # 3. First DELETE -> 204 No Content
    d1 = await client.delete(f"/api/v1/favorites/{hotel_id}", headers=headers)
    assert d1.status_code == 204

    # 4. Consecutive DELETEs on already removed item -> 204 No Content
    d2 = await client.delete(f"/api/v1/favorites/{hotel_id}", headers=headers)
    assert d2.status_code == 204
    d3 = await client.delete(f"/api/v1/favorites/{hotel_id}", headers=headers)
    assert d3.status_code == 204

    # 5. DELETE on never-favorited hotel -> 204 No Content
    other_hotel_id = res_hotels.json()["items"][1]["id"]
    d_never = await client.delete(f"/api/v1/favorites/{other_hotel_id}", headers=headers)
    assert d_never.status_code == 204

    # 6. Consecutive sync with same payload -> identical result
    sync_res_1 = await client.post("/api/v1/favorites/sync", json={"hotelIds": [hotel_id, other_hotel_id]}, headers=headers)
    assert sync_res_1.status_code == 200
    sync_res_2 = await client.post("/api/v1/favorites/sync", json={"hotelIds": [hotel_id, other_hotel_id]}, headers=headers)
    assert sync_res_2.status_code == 200
    assert set(sync_res_1.json()) == set(sync_res_2.json()) == {hotel_id, other_hotel_id}


