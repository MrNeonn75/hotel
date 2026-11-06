from fastapi import APIRouter, Depends, Response, status

from app.deps import get_current_guest, get_favorite_service
from app.models.guest import Guest
from app.schemas.favorite import (
    FavoriteActionResponse,
    FavoriteSyncRequest,
    FavoriteToggleRequest,
    FavoriteToggleResponse,
)
from app.schemas.hotel import HotelListItem
from app.services.favorite_service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["Favoritlər"])


@router.get(
    "",
    response_model=list[HotelListItem],
    summary="Favorit otellərin tam siyahısı",
    description="Cari qonağın favorit otellərini (HotelListItem) ən son əlavə olunan birinci olmaqla qaytarır.",
)
async def get_favorites(
    guest: Guest = Depends(get_current_guest),
    favorite_service: FavoriteService = Depends(get_favorite_service),
):
    return await favorite_service.get_favorite_hotels(guest.id)


@router.get(
    "/ids",
    response_model=list[str],
    summary="Favorit otellərin yalnız ID-ləri",
    description="UI-da favorit düymələrini (ürəkləri) tez doldurmaq üçün yalnız otel ID-lərinin siyahısını qaytarır.",
)
async def get_favorite_ids(
    guest: Guest = Depends(get_current_guest),
    favorite_service: FavoriteService = Depends(get_favorite_service),
):
    return await favorite_service.get_favorite_ids(guest.id)


@router.put(
    "/{hotel_id}",
    response_model=FavoriteActionResponse,
    summary="Oteli favoritlərə əlavə et",
    description="Oteli favoritlərə əlavə edir. İdempotent: artıq varsa 200, yeni əlavə edildikdə 201; otel tapılmadıqda 404 qaytarır.",
)
async def add_favorite(
    hotel_id: str,
    response: Response,
    guest: Guest = Depends(get_current_guest),
    favorite_service: FavoriteService = Depends(get_favorite_service),
):
    _, is_new = await favorite_service.add_favorite(guest.id, hotel_id)
    response.status_code = status.HTTP_201_CREATED if is_new else status.HTTP_200_OK
    return FavoriteActionResponse(
        hotel_id=hotel_id,
        is_favorite=True,
        message="Otel favoritlərə əlavə olundu" if is_new else "Otel artıq favoritlərdədir",
    )


@router.delete(
    "/{hotel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Oteli favoritlərdən sil",
    description="Oteli favoritlərdən silir. İdempotent: otel artıq silinibsə belə həmişə 204 No Content qaytarır.",
)
async def remove_favorite(
    hotel_id: str,
    guest: Guest = Depends(get_current_guest),
    favorite_service: FavoriteService = Depends(get_favorite_service),
):
    await favorite_service.remove_favorite(guest.id, hotel_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/sync",
    response_model=list[str],
    summary="Lokal favoritləri serverlə birləşdir",
    description="Telefonda lokal saxlanılan favoritləri serverlə birləşdirir (union) və yekun ID siyahısını qaytarır.",
)
async def sync_favorites(
    payload: FavoriteSyncRequest,
    guest: Guest = Depends(get_current_guest),
    favorite_service: FavoriteService = Depends(get_favorite_service),
):
    return await favorite_service.sync_favorites(guest.id, payload.hotel_ids)


# Geriye uyğunluq üçün /toggle
@router.post(
    "/toggle",
    response_model=FavoriteToggleResponse,
    summary="Oteli favoritə əlavə et və ya çıxar (Köhnə metod)",
    description="Köhnə klientlər üçün uyğunluq metodu.",
)
async def toggle_favorite(
    payload: FavoriteToggleRequest,
    favorite_service: FavoriteService = Depends(get_favorite_service),
):
    identifier = payload.device_id or payload.user_id or "default-device"
    is_fav, msg = await favorite_service.toggle_favorite(
        identifier=identifier,
        hotel_id=payload.hotel_id,
    )
    return FavoriteToggleResponse(
        hotel_id=payload.hotel_id,
        is_favorite=is_fav,
        message=msg,
    )
