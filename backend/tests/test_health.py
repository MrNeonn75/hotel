import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_liveness_check(client: AsyncClient):
    # Liveness yoxlanışı DB-dən asılı deyil və həmişə 200 qaytarır
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data
    assert "timestamp" in data
    assert "version" in data
    assert "X-Request-ID" in response.headers

    # Kök səviyyəsindəki /health də eyni nəticəni qaytarmalıdır
    root_resp = await client.get("/health")
    assert root_resp.status_code == 200
    assert root_resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_readiness_check_healthy(client: AsyncClient, mock_db_healthy):
    response = await client.get("/api/v1/health/ready")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "environment" in data
    assert "timestamp" in data
    assert "version" in data
    assert "X-Request-ID" in response.headers

    # Kök səviyyəsindəki /health/ready
    root_resp = await client.get("/health/ready")
    assert root_resp.status_code == 200
    assert root_resp.json()["database"] == "connected"


@pytest.mark.asyncio
async def test_readiness_check_unhealthy(client: AsyncClient, mock_db_unhealthy):
    response = await client.get("/api/v1/health/ready")
    assert response.status_code == 503
    data = response.json()

    assert data["status"] == "unhealthy"
    assert data["database"] == "disconnected"
    assert "X-Request-ID" in response.headers
