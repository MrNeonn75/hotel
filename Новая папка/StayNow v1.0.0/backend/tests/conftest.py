from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.limiter import limiter
from app.main import app
from scripts.seed import seed


@pytest.fixture(autouse=True)
def reset_rate_limits():
    limiter.reset()
    yield
    limiter.reset()


@pytest_asyncio.fixture
async def test_engine():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def seeded_session(test_engine):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)
    with (
        patch("scripts.seed.engine", test_engine),
        patch("scripts.seed.AsyncSessionLocal", session_factory),
    ):
        await seed()

    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(test_engine, seeded_session):
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def mock_db_healthy():
    with patch("app.routers.health.check_db_connection", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = True
        yield mock_check


@pytest.fixture
def mock_db_unhealthy():
    with patch("app.routers.health.check_db_connection", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = False
        yield mock_check
