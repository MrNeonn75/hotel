from datetime import UTC, datetime

from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import check_db_connection
from app.core.limiter import limiter
from app.schemas.health import LivenessResponse, ReadinessResponse

router = APIRouter(tags=["Sistem Sağlamlığı (Health)"])


@router.get(
    "/health",
    response_model=LivenessResponse,
    summary="Liveness yoxlanışı (Sistem aktivliyi)",
    description="Tətbiq prosesinin aktiv və sorğuları qəbul etməyə hazır olduğunu yoxlayır (DB yoxlanışı etmir).",
)
@limiter.exempt
async def liveness_check(request: Request):
    return LivenessResponse(
        status="healthy",
        environment=settings.ENV,
        timestamp=datetime.now(UTC),
        version="1.0.0",
    )


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    summary="Readiness yoxlanışı (Verilənlər bazası bağlantısı)",
    description="Tətbiqin PostgreSQL verilənlər bazası ilə aktiv bağlantısını yoxlayır.",
    responses={
        200: {"description": "Verilənlər bazası bağlantısı aktivdir və xidmət hazırdır."},
        503: {"description": "Verilənlər bazası ilə əlaqə kəsilib, xidmət hazır deyil."},
    },
)
@limiter.exempt
async def readiness_check(request: Request):
    is_db_connected = await check_db_connection()
    current_time = datetime.now(UTC)

    if not is_db_connected:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "environment": settings.ENV,
                "timestamp": current_time.isoformat(),
                "version": "1.0.0",
            },
        )

    return ReadinessResponse(
        status="healthy",
        database="connected",
        environment=settings.ENV,
        timestamp=current_time,
        version="1.0.0",
    )
