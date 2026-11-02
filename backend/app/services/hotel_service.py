import math
import uuid
from collections.abc import Sequence

from app.core.errors import NotFoundError, ValidationError
from app.models.hotel import Hotel
from app.repositories.booking_repo import BookingRepository
from app.repositories.hotel_repo import HotelRepository
from app.schemas.hotel import (
    HotelFilterParams,
    HotelListItem,
    HotelListResponse,
    HotelResponse,
)


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


def serialize_hotel_response(hotel: Hotel, distance_km: float | None = None) -> HotelResponse:
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
        address=hotel.address,
        latitude=hotel.latitude,
        longitude=hotel.longitude,
        images=images,
        rating=float(hotel.rating),
        review_count=hotel.review_count,
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
        distance_km=distance_km,
        is_active=hotel.is_active,
    )


def serialize_hotel_list_item(hotel: Hotel, distance_km: float | None = None) -> HotelListItem:
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
        address=hotel.address,
        latitude=hotel.latitude,
        longitude=hotel.longitude,
        images=images,
        rating=float(hotel.rating),
        review_count=hotel.review_count,
        standard_price=float(hotel.standard_price),
        discounted_price=float(hotel.discounted_price),
        discount_percent=hotel.discount_percent,
        currency=hotel.currency,
        amenities=amenities,
        advantages=hotel.advantages or [],
        check_in_time=hotel.check_in_time,
        check_out_time=hotel.check_out_time,
        distance_km=distance_km,
        is_active=hotel.is_active,
    )


serialize_hotel = serialize_hotel_response


class HotelService:
    def __init__(self, hotel_repo: HotelRepository, booking_repo: BookingRepository | None = None):
        self.hotel_repo = hotel_repo
        self.booking_repo = booking_repo

    async def get_hotels(self, filters: HotelFilterParams) -> HotelListResponse:
        # Tarix yoxlanışı
        booked_map: dict[uuid.UUID, int] = {}
        if filters.check_in and filters.check_out:
            if filters.check_out <= filters.check_in:
                raise ValidationError("Çıxış tarixi giriş tarixindən sonra olmalıdır")
            if self.booking_repo:
                booked_map = await self.booking_repo.get_booked_rooms_map(
                    filters.check_in, filters.check_out
                )

        # Otelləri bazadan çək
        hotels = await self.hotel_repo.get_hotels(
            q=filters.q,
            city=filters.city,
            min_price=filters.min_price,
            max_price=filters.max_price,
            amenities=filters.amenities,
            min_rating=filters.min_rating,
            has_discount=filters.has_discount,
            sort=filters.sort,
        )

        filtered_items: list[HotelListItem] = []

        for hotel in hotels:
            # 1. Boş otaq mövcudluğu (availability) filtri
            if filters.check_in and filters.check_out:
                booked_count = booked_map.get(hotel.id, 0)
                rooms_left = max(0, hotel.rooms_total - booked_count)
                if rooms_left <= 0:
                    continue

            # 2. Koordinat və Radius filtri (Haversine)
            distance_km = None
            if filters.lat is not None and filters.lng is not None:
                distance_km = haversine_distance(
                    filters.lat, filters.lng, hotel.latitude, hotel.longitude
                )
                if filters.radius_km is not None and distance_km > filters.radius_km:
                    continue

            item = serialize_hotel_list_item(hotel, distance_km=distance_km)
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

    async def get_hotel_by_id(self, hotel_id: str) -> HotelResponse:
        hotel = await self.hotel_repo.get_by_id(hotel_id)
        if not hotel or not hotel.is_active:
            raise NotFoundError(f"'{hotel_id}' identifikatorlu otel tapılmadı")
        return serialize_hotel_response(hotel)

    async def get_hotels_by_ids(self, hotel_ids: Sequence[str]) -> list[HotelResponse]:
        """Favoritlər üçün ID-lər üzrə ardıcıllığı qoruyaraq otelləri qaytarır (maks 50)."""
        hotels = await self.hotel_repo.get_by_ids(hotel_ids)
        return [serialize_hotel_response(h) for h in hotels]
