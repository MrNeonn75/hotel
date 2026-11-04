from fastapi import APIRouter, Depends

from app.deps import get_collection_service
from app.schemas.collection import CollectionResponse
from app.schemas.hotel import HotelListItem
from app.services.collection_service import CollectionService

router = APIRouter(prefix="/collections", tags=["Kolleksiyalar"])


@router.get(
    "",
    response_model=list[CollectionResponse],
    summary="Aktiv kolleksiyaların siyahısı",
    description="Ana səhifə və kəşf tabı üçün xüsusi seçilmiş otel kolleksiyalarını qaytarır.",
)
async def list_collections(
    collection_service: CollectionService = Depends(get_collection_service),
):
    return await collection_service.get_collections()


@router.get(
    "/{collection_id}",
    response_model=CollectionResponse,
    summary="Kolleksiya detalları",
    description="ID və ya slug üzrə kolleksiya detallarını qaytarır.",
)
async def get_collection(
    collection_id: str,
    collection_service: CollectionService = Depends(get_collection_service),
):
    return await collection_service.get_collection_by_id(collection_id)


@router.get(
    "/{collection_id}/hotels",
    response_model=list[HotelListItem],
    summary="Kolleksiyaya daxil olan otellər",
    description="Verilmiş kolleksiyaya daxil olan bütün otellərin siyahısını qaytarır.",
)
async def get_collection_hotels(
    collection_id: str,
    collection_service: CollectionService = Depends(get_collection_service),
):
    return await collection_service.get_hotels_by_collection(collection_id)

