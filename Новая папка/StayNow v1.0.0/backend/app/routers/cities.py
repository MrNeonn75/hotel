from fastapi import APIRouter, Depends, Request

from app.core.limiter import limiter
from app.deps import get_hotel_service
from app.schemas.hotel import CityResponse
from app.services.hotel_service import HotelService

router = APIRouter(prefix="/cities", tags=["Şəhərlər"])


@router.get(
    "",
    response_model=list[CityResponse],
    summary="Aktiv şəhərlərin siyahısı",
    description="Aktiv otellərin yerləşdiyi şəhərləri və hər şəhərdəki aktiv otel sayını azalan sıra ilə qaytarır.",
)
@limiter.limit("120/minute")
async def list_cities(
    request: Request,
    hotel_service: HotelService = Depends(get_hotel_service),
) -> list[CityResponse]:
    return await hotel_service.get_cities()

