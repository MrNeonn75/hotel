from decimal import Decimal
from unittest.mock import patch

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.hotel import Amenity, Hotel, HotelImage
from scripts.seed import calculate_discount_percent, seed


def test_calculate_discount_percent():
    assert calculate_discount_percent(Decimal("220"), Decimal("145")) == 34
    assert calculate_discount_percent(Decimal("440"), Decimal("320")) == 27
    assert calculate_discount_percent(Decimal("380"), Decimal("245")) == 36
    assert calculate_discount_percent(Decimal("160"), Decimal("99")) == 38
    assert calculate_discount_percent(Decimal("130"), Decimal("85")) == 35


@pytest.mark.asyncio
async def test_seed_idempotency_and_data_integrity(tmp_path):
    test_db_url = f"sqlite+aiosqlite:///{tmp_path / 'test_seed.db'}"
    engine = create_async_engine(test_db_url, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    # Patch engine and AsyncSessionLocal in scripts.seed
    with (
        patch("scripts.seed.engine", engine),
        patch("scripts.seed.AsyncSessionLocal", session_factory),
    ):
        # 1. First run of seed()
        await seed()

        async with session_factory() as session:
            # Check Amenities
            amenities_res = await session.execute(select(Amenity))
            amenities = list(amenities_res.scalars().all())
            assert len(amenities) == 10, "10 amenity yaradılmalıdır"

            # Check Hotels
            hotels_res = await session.execute(select(Hotel))
            hotels = list(hotels_res.scalars().all())
            assert len(hotels) == 10, "10 otel yaradılmalıdır"

            # Check Images
            images_count = await session.scalar(select(func.count(HotelImage.id)))
            assert images_count == 50, "Hər otel üçün 5 şəkil olmaqla cəmi 50 şəkil olmalıdır"

            # Verify integrity of each hotel
            for hotel in hotels:
                assert 80 <= hotel.discounted_price <= 450, f"{hotel.name} qiymət aralığı 80-450 AZN olmalıdır"
                assert 10 <= hotel.discount_percent <= 45, f"{hotel.name} endirim 10-45% aralığında olmalıdır"
                assert 10 <= hotel.rooms_total <= 60, f"{hotel.name} otaq sayı 10-60 aralığında olmalıdır"

                # Check discount_percent calculation
                expected_discount = calculate_discount_percent(hotel.standard_price, hotel.discounted_price)
                assert hotel.discount_percent == expected_discount

            # 2. Second run of seed() (Idempotency check)
            await seed()

            # Check that counts did NOT double
            hotel_count_2 = await session.scalar(select(func.count(Hotel.id)))
            assert hotel_count_2 == 10, "Təkrar seed zamanı otellər dublikatlaşmamalıdır"

            amenity_count_2 = await session.scalar(select(func.count(Amenity.id)))
            assert amenity_count_2 == 10, "Təkrar seed zamanı xidmətlər dublikatlaşmamalıdır"

            images_count_2 = await session.scalar(select(func.count(HotelImage.id)))
            assert images_count_2 == 50, "Təkrar seed zamanı şəkillər dublikatlaşmamalıdır"

    await engine.dispose()
