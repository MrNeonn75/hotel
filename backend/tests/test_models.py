import uuid
from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.core.security import encryptor
from app.models.booking import Booking
from app.models.enums import BookingStatus, PaymentStatus
from app.models.favorite import Favorite
from app.models.guest import Guest, GuestProfile
from app.models.hotel import Amenity, Hotel, HotelImage


@pytest.fixture
async def test_session():
    # In-memory SQLite async engine for isolated model testing
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_hotel_uuid_and_timestamps(test_session: AsyncSession):
    hotel = Hotel(
        name="Test Hotel",
        city="Bakı",
        address="Test küç. 1",
        latitude=40.4,
        longitude=49.8,
        standard_price=Decimal("200.00"),
        discounted_price=Decimal("150.00"),
        rating=Decimal("4.5"),
    )
    test_session.add(hotel)
    await test_session.commit()
    await test_session.refresh(hotel)

    assert isinstance(hotel.id, uuid.UUID)
    assert hotel.created_at is not None
    assert hotel.updated_at is not None
    assert hotel.standard_price == Decimal("200.00")
    assert hotel.discounted_price == Decimal("150.00")


@pytest.mark.asyncio
async def test_hotel_with_images_and_amenities(test_session: AsyncSession):
    amenity_wifi = Amenity(key="wifi", label_az="Pulsuz Wi-Fi")
    amenity_pool = Amenity(key="pool", label_az="Üzmə hovuzu")
    test_session.add_all([amenity_wifi, amenity_pool])
    await test_session.flush()

    hotel = Hotel(
        name="Luxury Baku Hotel",
        city="Bakı",
        address="Bulvar 12",
        latitude=40.37,
        longitude=49.85,
        standard_price=Decimal("300.00"),
        discounted_price=Decimal("250.00"),
    )
    hotel.amenities.extend([amenity_wifi, amenity_pool])
    test_session.add(hotel)
    await test_session.flush()

    img1 = HotelImage(hotel_id=hotel.id, url="https://img1.jpg", position=0)
    img2 = HotelImage(hotel_id=hotel.id, url="https://img2.jpg", position=1)
    test_session.add_all([img1, img2])
    await test_session.commit()

    # Query back
    result = await test_session.execute(select(Hotel).where(Hotel.id == hotel.id))
    fetched = result.scalars().first()
    assert fetched is not None
    assert len(fetched.amenities) == 2
    assert len(fetched.images) == 2
    assert fetched.images[0].url == "https://img1.jpg"


@pytest.mark.asyncio
async def test_guest_and_encrypted_profile(test_session: AsyncSession):
    guest = Guest(device_id="device-test-123")
    test_session.add(guest)
    await test_session.flush()

    plain_doc = "AZE12345678"
    encrypted_doc = encryptor.encrypt(plain_doc)

    profile = GuestProfile(
        guest_id=guest.id,
        first_name="Əli",
        last_name="Həsənov",
        phone="+994509876543",
        email="ali@example.com",
        document_number_encrypted=encrypted_doc,
    )
    test_session.add(profile)
    await test_session.commit()

    assert isinstance(guest.id, uuid.UUID)
    assert isinstance(profile.id, uuid.UUID)
    assert profile.guest_id == guest.id

    # Verify decrypt
    decrypted = encryptor.decrypt(profile.document_number_encrypted)
    assert decrypted == plain_doc


@pytest.mark.asyncio
async def test_favorite_unique_constraint(test_session: AsyncSession):
    guest = Guest(device_id="fav-device-1")
    hotel = Hotel(
        name="Fav Hotel",
        city="Bakı",
        address="Ünvan",
        latitude=40.4,
        longitude=49.8,
        standard_price=Decimal("100.00"),
        discounted_price=Decimal("90.00"),
    )
    test_session.add_all([guest, hotel])
    await test_session.flush()

    fav1 = Favorite(guest_id=guest.id, hotel_id=hotel.id)
    test_session.add(fav1)
    await test_session.commit()

    # Duplicate favorite must fail
    fav2 = Favorite(guest_id=guest.id, hotel_id=hotel.id)
    test_session.add(fav2)
    with pytest.raises(IntegrityError):
        await test_session.commit()
    await test_session.rollback()


@pytest.mark.asyncio
async def test_booking_creation_and_cancellation(test_session: AsyncSession):
    guest = Guest(device_id="booking-device-1")
    hotel = Hotel(
        name="Booking Hotel",
        city="Bakı",
        address="Ünvan",
        latitude=40.4,
        longitude=49.8,
        standard_price=Decimal("120.00"),
        discounted_price=Decimal("100.00"),
    )
    test_session.add_all([guest, hotel])
    await test_session.flush()

    check_in = date.today()
    check_out = check_in + timedelta(days=2)

    booking = Booking(
        reference="STN-7K2P9X",
        guest_id=guest.id,
        hotel_id=hotel.id,
        check_in=check_in,
        check_out=check_out,
        adults=2,
        children=1,
        first_name="Leyla",
        last_name="Qasımova",
        phone="+994551112233",
        email="leyla@example.com",
        nights=2,
        price_per_night=Decimal("100.00"),
        discount_amount=Decimal("40.00"),
        total_price=Decimal("200.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
        hotel_snapshot={"name": hotel.name, "address": hotel.address, "image": ""},
    )
    test_session.add(booking)
    await test_session.commit()

    assert isinstance(booking.id, uuid.UUID)
    assert booking.reference == "STN-7K2P9X"
    assert booking.status == BookingStatus.CONFIRMED
    assert booking.cancelled_at is None

    # Cancel booking
    booking.status = BookingStatus.CANCELLED
    from app.models.base import utc_now
    booking.cancelled_at = utc_now()
    await test_session.commit()
    await test_session.refresh(booking)

    assert booking.status == BookingStatus.CANCELLED
    assert booking.cancelled_at is not None


@pytest.mark.asyncio
async def test_hotel_check_constraints(test_session: AsyncSession):
    # Invalid discount price: discounted_price > standard_price
    invalid_hotel = Hotel(
        name="Invalid Hotel",
        city="Bakı",
        address="Ünvan",
        latitude=40.4,
        longitude=49.8,
        standard_price=Decimal("100.00"),
        discounted_price=Decimal("150.00"),  # > standard_price
    )
    test_session.add(invalid_hotel)
    with pytest.raises(IntegrityError):
        await test_session.commit()
    await test_session.rollback()

    # Invalid rating: > 5
    invalid_rating_hotel = Hotel(
        name="Invalid Rating Hotel",
        city="Bakı",
        address="Ünvan",
        latitude=40.4,
        longitude=49.8,
        standard_price=Decimal("100.00"),
        discounted_price=Decimal("80.00"),
        rating=Decimal("5.5"),  # > 5
    )
    test_session.add(invalid_rating_hotel)
    with pytest.raises(IntegrityError):
        await test_session.commit()
    await test_session.rollback()


@pytest.mark.asyncio
async def test_booking_check_constraints(test_session: AsyncSession):
    guest = Guest(device_id="ck-booking-guest")
    hotel = Hotel(
        name="Valid Hotel",
        city="Bakı",
        address="Ünvan",
        latitude=40.4,
        longitude=49.8,
        standard_price=Decimal("100.00"),
        discounted_price=Decimal("80.00"),
    )
    test_session.add_all([guest, hotel])
    await test_session.flush()

    today = date.today()

    # Invalid dates: check_out <= check_in
    invalid_dates_booking = Booking(
        reference="STN-INV001",
        guest_id=guest.id,
        hotel_id=hotel.id,
        check_in=today,
        check_out=today,  # <= check_in
        adults=1,
        first_name="Test",
        last_name="Test",
        phone="123",
        email="test@test.com",
        nights=0,
        price_per_night=Decimal("80.00"),
        total_price=Decimal("80.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
    )
    test_session.add(invalid_dates_booking)
    with pytest.raises(IntegrityError):
        await test_session.commit()
    await test_session.rollback()

    # Invalid adults: adults < 1
    invalid_adults_booking = Booking(
        reference="STN-INV002",
        guest_id=guest.id,
        hotel_id=hotel.id,
        check_in=today,
        check_out=today + timedelta(days=1),
        adults=0,  # < 1
        first_name="Test",
        last_name="Test",
        phone="123",
        email="test@test.com",
        nights=1,
        price_per_night=Decimal("80.00"),
        total_price=Decimal("80.00"),
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.UNPAID,
    )
    test_session.add(invalid_adults_booking)
    with pytest.raises(IntegrityError):
        await test_session.commit()
    await test_session.rollback()

