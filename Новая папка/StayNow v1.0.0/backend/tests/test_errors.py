import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_not_found_error_format(client: AsyncClient):
    response = await client.get("/api/v1/non-existent-route")
    assert response.status_code == 404
    data = response.json()

    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert "message" in data["error"]
    assert isinstance(data["error"]["details"], list)
    assert "X-Request-ID" in response.headers


@pytest.mark.asyncio
async def test_validation_error_format(client: AsyncClient):
    # Invalid booking creation (empty body) with valid X-Device-Id
    response = await client.post(
        "/api/v1/bookings",
        json={},
        headers={"X-Device-Id": "11111111-1111-4111-8111-111111111111"},
    )
    assert response.status_code == 422
    data = response.json()

    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "message" in data["error"]
    assert len(data["error"]["details"]) > 0
    assert "field" in data["error"]["details"][0]
    assert "X-Request-ID" in response.headers

