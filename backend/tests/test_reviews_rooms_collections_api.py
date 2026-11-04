import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rooms_and_reviews_api(client: AsyncClient):
    # 1. Fetch hotels to get an existing hotel ID
    hotels_res = await client.get("/api/v1/hotels")
    assert hotels_res.status_code == 200
    hotels_data = hotels_res.json()
    hotel_id = hotels_data["items"][0]["id"]

    # 2. Test GET /hotels/{hotel_id}/rooms
    rooms_res = await client.get(f"/api/v1/hotels/{hotel_id}/rooms")
    assert rooms_res.status_code == 200
    rooms = rooms_res.json()
    assert len(rooms) >= 1
    assert "name" in rooms[0]
    assert "price" in rooms[0]
    assert "capacity" in rooms[0]
    assert "bedType" in rooms[0]

    # 3. Test GET /hotels/{hotel_id}/reviews
    rev_res = await client.get(f"/api/v1/hotels/{hotel_id}/reviews")
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert "items" in rev_data
    assert len(rev_data["items"]) >= 1

    # 4. Test POST /hotels/{hotel_id}/reviews
    new_rev = await client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json={
            "rating": 5.0,
            "comment": "Fantastik dərəcədə gözəl və rahat otel! StayNow ilə rezerv etdik.",
            "roomType": "Deluxe Dəniz Mənzərəli Otaq",
            "userName": "Kamran Əliyev",
            "userCountry": "Azərbaycan",
        },
    )
    assert new_rev.status_code == 201
    created_rev = new_rev.json()
    assert created_rev["rating"] == 5.0
    assert created_rev["userName"] == "Kamran Əliyev"


@pytest.mark.asyncio
async def test_collections_api(client: AsyncClient):
    # 1. List collections
    col_res = await client.get("/api/v1/collections")
    assert col_res.status_code == 200
    cols = col_res.json()
    assert len(cols) >= 4
    col_id = cols[0]["id"]
    assert "title" in cols[0]
    assert "hotelIds" in cols[0]
    assert "hotelCount" in cols[0]

    # 2. Get collection by ID
    single_res = await client.get(f"/api/v1/collections/{col_id}")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == col_id

    # 3. Get hotels in collection
    hotels_res = await client.get(f"/api/v1/collections/{col_id}/hotels")
    assert hotels_res.status_code == 200
    hotels = hotels_res.json()
    assert len(hotels) >= 1
    assert "name" in hotels[0]

