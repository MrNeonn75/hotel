import hashlib
from datetime import date

from fastapi import APIRouter, Depends, Query, Request, Response, status

from app.core.limiter import limiter
from app.deps import get_booking_service, get_hotel_service
from app.schemas.hotel import (
    HotelAvailabilityResponse,
    HotelFilterParams,
    HotelListResponse,
    HotelResponse,
)
from app.services.booking_service import BookingService
from app.services.hotel_service import HotelService

router = APIRouter(prefix="/hotels", tags=["Otellər"])


@router.get(
    "",
    response_model=HotelListResponse,
    summary="Otellərin siyahısı",
    description="Axtarış, filtrasiya, koordinat məsafəsi (Haversine) və səhifələmə ilə aktiv otelləri qaytarır. ETag və Cache-Control (60s) dəstəkləyir.",
)
@limiter.limit("120/minute")
async def list_hotels(
    request: Request,
    q: str | None = Query(None, description="Otel adı və ya ünvanı üzrə axtarış (ILIKE)"),
    city: str | None = Query(None, description="Şəhər üzrə filtr"),
    min_price: float | None = Query(None, ge=0, alias="minPrice", description="Minimum endirimli qiymət"),
    max_price: float | None = Query(None, ge=0, alias="maxPrice", description="Maksimum endirimli qiymət"),
    amenities: str | None = Query(None, description="Vergüllə ayrılmış xidmətlər (hamısı olmalıdır, məs. wifi,pool)"),
    min_rating: float | None = Query(None, ge=0, le=5, alias="minRating", description="Minimum reytinq"),
    has_discount: bool | None = Query(None, alias="hasDiscount", description="Yalnız endirimli otellər"),
    sort: str | None = Query("recommended", description="Sıralama: recommended, price_asc, price_desc, rating_desc, discount_desc"),
    check_in: date | None = Query(None, alias="checkIn", description="Giriş tarixi (YYYY-MM-DD)"),
    check_out: date | None = Query(None, alias="checkOut", description="Çıxış tarixi (YYYY-MM-DD)"),
    guests: int | None = Query(None, ge=1, description="Qonaq sayı"),
    lat: float | None = Query(None, description="İstifadəçinin enlik koordinatı"),
    lng: float | None = Query(None, description="İstifadəçinin uzunluq koordinatı"),
    radius_km: float | None = Query(None, ge=0, alias="radiusKm", description="Maksimum radius məsafəsi (km)"),
    page: int = Query(1, ge=1, description="Səhifə nömrəsi"),
    page_size: int = Query(20, ge=1, le=50, alias="pageSize", description="Səhifədəki element sayı (maks 50)"),
    hotel_service: HotelService = Depends(get_hotel_service),
):
    amenities_list = [a.strip() for a in amenities.split(",") if a.strip()] if amenities else None
    filters = HotelFilterParams(
        q=q,
        city=city,
        min_price=min_price,
        max_price=max_price,
        amenities=amenities_list,
        min_rating=min_rating,
        has_discount=has_discount,
        sort=sort,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        page=page,
        page_size=page_size,
    )
    result = await hotel_service.get_hotels(filters)
    json_bytes = result.model_dump_json(by_alias=True).encode("utf-8")
    etag = f'"{hashlib.md5(json_bytes).hexdigest()}"'

    if_none_match = request.headers.get("if-none-match")
    if if_none_match and if_none_match.strip() == etag:
        return Response(
            status_code=status.HTTP_304_NOT_MODIFIED,
            headers={"ETag": etag, "Cache-Control": "public, max-age=60"},
        )

    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"ETag": etag, "Cache-Control": "public, max-age=60"},
    )


@router.get(
    "/by-ids",
    response_model=list[HotelResponse],
    summary="ID siyahısı üzrə otellər",
    description="Favoritlər ekranı üçün verilmiş ID siyahısı üzrə ardıcıllığı qoruyaraq otelləri qaytarır (maksimum 50 ID).",
)
@limiter.limit("120/minute")
async def get_hotels_by_ids(
    request: Request,
    ids: str = Query(..., description="Vergüllə ayrılmış otel ID-ləri (məs: id1,id2,id3)"),
    hotel_service: HotelService = Depends(get_hotel_service),
):
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    if not id_list:
        return []
    return await hotel_service.get_hotels_by_ids(id_list)


@router.get(
    "/{hotel_id}/availability",
    response_model=HotelAvailabilityResponse,
    summary="Otel boş otaq mövcudluğu",
    description="Seçilmiş tarixlər və qonaq sayı üçün oteldə boş otaq olub-olmadığını və qalan otaq sayını yoxlayır.",
)
@limiter.limit("120/minute")
async def check_availability(
    request: Request,
    hotel_id: str,
    check_in: date = Query(..., alias="checkIn", description="Giriş tarixi (YYYY-MM-DD)"),
    check_out: date = Query(..., alias="checkOut", description="Çıxış tarixi (YYYY-MM-DD)"),
    guests: int = Query(1, ge=1, description="Qonaq sayı"),
    booking_service: BookingService = Depends(get_booking_service),
):
    is_available, rooms_left = await booking_service.get_availability(
        hotel_id=hotel_id,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
    )
    return HotelAvailabilityResponse(available=is_available, rooms_left=rooms_left)


@router.get(
    "/{hotel_id}",
    response_model=HotelResponse,
    summary="Otel detalları",
    description="Verilmiş ID üzrə otelin tam detallarını (şəkillər position sırası ilə, amenities, advantages, rules, importantInfo) qaytarır. Tapılmasa 404 xətası verir.",
)
@limiter.limit("120/minute")
async def get_hotel_details(
    request: Request,
    hotel_id: str,
    hotel_service: HotelService = Depends(get_hotel_service),
):
    return await hotel_service.get_hotel_by_id(hotel_id)
