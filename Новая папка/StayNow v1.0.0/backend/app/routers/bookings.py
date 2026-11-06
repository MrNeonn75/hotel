from fastapi import APIRouter, Depends, Header, Query, Request, Response, status

from app.core.limiter import get_device_or_ip, limiter
from app.deps import get_booking_service, get_current_guest
from app.models.enums import BookingStatus
from app.models.guest import Guest
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
)
from app.services.booking_service import BookingService

router = APIRouter(tags=["Rezervasiyalar"])


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yeni rezervasiya yarat",
    description="Oteli rezervasiya edir. Header: Idempotency-Key və X-Device-Id məcburidir. Eyni açarla təkrar sorğu yeni rezervasiya yaratmır, əvvəlkini qaytarır. Rate limit: 10 sorğu/dəqiqə/device.",
)
@limiter.limit("10/minute", key_func=get_device_or_ip)
async def create_booking(
    request: Request,
    data: BookingCreate,
    response: Response,
    idempotency_key: str = Header(..., alias="Idempotency-Key", description="Məcburi idempotentlik açarı"),
    guest: Guest = Depends(get_current_guest),
    booking_service: BookingService = Depends(get_booking_service),
):
    booking_resp, is_new = await booking_service.create_booking(
        data=data,
        guest_id=guest.id,
        idempotency_key=idempotency_key.strip(),
    )
    response.status_code = status.HTTP_201_CREATED if is_new else status.HTTP_200_OK
    return booking_resp


@router.get(
    "",
    response_model=list[BookingResponse],
    summary="İstifadəçinin rezervasiya tarixçəsi",
    description="Cari qonağın bütün keçmiş və cari rezervasiyalarını ən yenisi üstdə olmaqla qaytarır. ?status= filtri və səhifələmə dəstəklənir. X-Device-Id tələb olunur.",
)
async def list_bookings(
    status_filter: BookingStatus | None = Query(None, alias="status", description="Status üzrə filtr (confirmed, cancelled, completed)"),
    page: int = Query(1, ge=1, description="Səhifə nömrəsi"),
    limit: int = Query(20, ge=1, le=100, description="Hər səhifədəki element sayı"),
    guest: Guest = Depends(get_current_guest),
    booking_service: BookingService = Depends(get_booking_service),
):
    return await booking_service.get_user_bookings_by_guest_id(
        guest_id=guest.id,
        status_filter=status_filter,
        page=page,
        limit=limit,
    )


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
    summary="Rezervasiya detalları",
    description="Rezervasiya ID-si və ya arayış kodu (reference) üzrə tam detalları qaytarır. Başqa qonağın rezervasiyası sorğulandıqda 404 qaytarır.",
)
async def get_booking(
    booking_id: str,
    guest: Guest = Depends(get_current_guest),
    booking_service: BookingService = Depends(get_booking_service),
):
    return await booking_service.get_booking_by_id_and_guest(booking_id, guest.id)


@router.post(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
    summary="Rezervasiyanı ləğv et",
    description="Yalnız confirmed və checkIn-dən ən azı 24 saat əvvəl ləğv edilə bilər; əks halda 409 (CANCELLATION_NOT_ALLOWED). Artıq ləğv olunubsa idempotent olaraq 200 qaytarır.",
)
@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
    include_in_schema=False,
)
async def cancel_booking(
    booking_id: str,
    guest: Guest = Depends(get_current_guest),
    booking_service: BookingService = Depends(get_booking_service),
):
    return await booking_service.cancel_booking_for_guest(booking_id, guest.id)
