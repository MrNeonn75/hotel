import math
import uuid
from collections.abc import Sequence
from datetime import date, timedelta
from decimal import Decimal

from app.core.errors import NotFoundError, ValidationError
from app.models.hotel import Hotel
from app.repositories.booking_repo import BookingRepository
from app.repositories.hotel_repo import HotelRepository
from app.schemas.hotel import (
    CityResponse,
    HotelFilterParams,
    HotelListItem,
    HotelListResponse,
    HotelResponse,
)


def calculate_review_label(rating: float | Decimal) -> str:
    r = float(rating)
    if r >= 9.0:
        return "Əla"
    if r >= 8.0:
        return "Çox yaxşı"
    if r >= 7.0:
        return "Yaxşı"
    return "Orta"


def calculate_rooms_left(rooms_total: int, booked_count: int) -> int | None:
    avail = rooms_total - booked_count
    if avail <= 0:
        return 0
    if 1 <= avail <= 5:
        return avail
    return None


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """İki coğrafi koordinat arasındakı məsafəni km ilə hesablayır (Haversine düsturu)."""
    r = 6371.0  # Yerin radiusu km ilə
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


def serialize_hotel_response(
    hotel: Hotel,
    distance_km: float | None = None,
    rooms_left: int | None = None,
) -> HotelResponse:
    images = (
        [img.url for img in hotel.images]
        if hotel.images and hasattr(hotel.images[0], "url")
        else [str(x) for x in (hotel.images or [])]
    )
    amenities = (
        [a.key for a in hotel.amenities]
        if hotel.amenities and hasattr(hotel.amenities[0], "key")
        else [str(x) for x in (hotel.amenities or [])]
    )

    return HotelResponse(
        id=str(hotel.id),
        name=hotel.name,
        city=hotel.city,
        neighborhood=hotel.neighborhood or "",
        address=hotel.address,
        latitude=hotel.latitude,
        longitude=hotel.longitude,
        images=images,
        star_rating=hotel.star_rating or 3,
        rating=float(hotel.rating),
        review_label=calculate_review_label(hotel.rating),
        review_count=hotel.review_count,
        tagline=hotel.tagline or "",
        description=hotel.description,
        standard_price=float(hotel.standard_price),
        discounted_price=float(hotel.discounted_price),
        discount_percent=hotel.discount_percent,
        currency=hotel.currency,
        amenities=amenities,
        advantages=hotel.advantages or [],
        rules=hotel.rules or [],
        important_info=hotel.important_info or [],
        check_in_time=hotel.check_in_time,
        check_out_time=hotel.check_out_time,
        free_cancellation=hotel.free_cancellation if hotel.free_cancellation is not None else True,
        rooms_left=rooms_left,
        deal_label=hotel.deal_label,
        distance_km=distance_km,
        is_active=hotel.is_active,
    )


def serialize_hotel_list_item(
    hotel: Hotel,
    distance_km: float | None = None,
    rooms_left: int | None = None,
) -> HotelListItem:
    images = (
        [img.url for img in hotel.images]
        if hotel.images and hasattr(hotel.images[0], "url")
        else [str(x) for x in (hotel.images or [])]
    )
    amenities = (
        [a.key for a in hotel.amenities]
        if hotel.amenities and hasattr(hotel.amenities[0], "key")
        else [str(x) for x in (hotel.amenities or [])]
    )

    return HotelListItem(
        id=str(hotel.id),
        name=hotel.name,
        city=hotel.city,
        neighborhood=hotel.neighborhood or "",
        address=hotel.address,
        latitude=hotel.latitude,
        longitude=hotel.longitude,
        images=images,
        star_rating=hotel.star_rating or 3,
        rating=float(hotel.rating),
        review_label=calculate_review_label(hotel.rating),
        review_count=hotel.review_count,
        tagline=hotel.tagline or "",
        standard_price=float(hotel.standard_price),
        discounted_price=float(hotel.discounted_price),
        discount_percent=hotel.discount_percent,
        currency=hotel.currency,
        amenities=amenities,
        advantages=hotel.advantages or [],
        check_in_time=hotel.check_in_time,
        check_out_time=hotel.check_out_time,
        free_cancellation=hotel.free_cancellation if hotel.free_cancellation is not None else True,
        rooms_left=rooms_left,
        deal_label=hotel.deal_label,
        distance_km=distance_km,
        is_active=hotel.is_active,
    )


serialize_hotel = serialize_hotel_response


class HotelService:
    def __init__(self, hotel_repo: HotelRepository, booking_repo: BookingRepository | None = None):
        self.hotel_repo = hotel_repo
        self.booking_repo = booking_repo

    async def get_hotels(self, filters: HotelFilterParams) -> HotelListResponse:
        # Tarix təyini və yoxlanışı
        has_explicit_dates = bool(filters.check_in and filters.check_out)
        if has_explicit_dates:
            assert filters.check_in is not None
            assert filters.check_out is not None
            if filters.check_out <= filters.check_in:
                raise ValidationError("Çıxış tarixi giriş tarixindən sonra olmalıdır")
            target_check_in = filters.check_in
            target_check_out = filters.check_out
        else:
            today = date.today()
            target_check_in = today
            target_check_out = today + timedelta(days=1)

        booked_map: dict[uuid.UUID, int] = {}
        if self.booking_repo:
            booked_map = await self.booking_repo.get_booked_rooms_map(
                target_check_in, target_check_out
            )

        # Otelləri bazadan çək
        hotels = await self.hotel_repo.get_hotels(
            q=filters.q,
            city=filters.city,
            min_price=filters.min_price,
            max_price=filters.max_price,
            amenities=filters.amenities,
            min_rating=filters.min_rating,
            min_stars=filters.min_stars,
            has_discount=filters.has_discount,
            sort=filters.sort,
        )

        filtered_items: list[HotelListItem] = []

        for hotel in hotels:
            booked_count = booked_map.get(hotel.id, 0)
            avail = hotel.rooms_total - booked_count
            rooms_left_val = calculate_rooms_left(hotel.rooms_total, booked_count)

            # Əgər istifadəçi konkret tarix veribsə və otaq qalmayıbsa, siyahıdan çıxar
            if has_explicit_dates and avail <= 0:
                continue

            # Koordinat və Radius filtri (Haversine)
            distance_km = None
            if filters.lat is not None and filters.lng is not None:
                distance_km = haversine_distance(
                    filters.lat, filters.lng, hotel.latitude, hotel.longitude
                )
                if filters.radius_km is not None and distance_km > filters.radius_km:
                    continue

            item = serialize_hotel_list_item(
                hotel, distance_km=distance_km, rooms_left=rooms_left_val
            )
            filtered_items.append(item)

        # Əgər məsafəyə görə sıralama istənilsə və ya sort=="recommended" + lat/lng verilibsə
        if filters.lat is not None and filters.lng is not None and filters.sort == "distance_asc":
            filtered_items.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999)

        total = len(filtered_items)
        page = max(1, filters.page)
        page_size = min(50, max(1, filters.page_size))

        start = (page - 1) * page_size
        end = start + page_size
        paginated_items = filtered_items[start:end]

        return HotelListResponse(
            items=paginated_items,
            page=page,
            page_size=page_size,
            total=total,
        )

    async def get_hotel_by_id(
        self,
        hotel_id: str,
        check_in: date | None = None,
        check_out: date | None = None,
    ) -> HotelResponse:
        hotel = await self.hotel_repo.get_by_id(hotel_id)
        if not hotel or not hotel.is_active:
            raise NotFoundError(f"'{hotel_id}' identifikatorlu otel tapılmadı")

        rooms_left = None
        if self.booking_repo:
            if check_in and check_out:
                if check_out <= check_in:
                    raise ValidationError("Çıxış tarixi giriş tarixindən sonra olmalıdır")
                target_c_in = check_in
                target_c_out = check_out
            else:
                today = date.today()
                target_c_in = today
                target_c_out = today + timedelta(days=1)

            booked = await self.booking_repo.count_overlapping_confirmed_bookings(
                hotel.id, target_c_in, target_c_out
            )
            rooms_left = calculate_rooms_left(hotel.rooms_total, booked)

        return serialize_hotel_response(hotel, rooms_left=rooms_left)

    async def get_hotels_by_ids(self, hotel_ids: Sequence[str]) -> list[HotelResponse]:
        """Favoritlər üçün ID-lər üzrə ardıcıllığı qoruyaraq otelləri qaytarır (maks 50)."""
        hotels = await self.hotel_repo.get_by_ids(hotel_ids)
        if not hotels:
            return []

        booked_map: dict[uuid.UUID, int] = {}
        if self.booking_repo:
            today = date.today()
            booked_map = await self.booking_repo.get_booked_rooms_map(
                today, today + timedelta(days=1)
            )

        result: list[HotelResponse] = []
        for h in hotels:
            booked = booked_map.get(h.id, 0)
            rooms_left = calculate_rooms_left(h.rooms_total, booked)
            result.append(serialize_hotel_response(h, rooms_left=rooms_left))
        return result

    async def get_cities(self) -> list[CityResponse]:
        cities = await self.hotel_repo.get_active_cities()
        return [CityResponse(name=name, hotel_count=count) for name, count in cities]
