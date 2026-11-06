from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.errors import format_error_response
from app.core.logging import logger


def get_rate_limit_key(request: Request) -> str:
    """Public endpoint-lər üçün IP əsaslı açar."""
    return get_remote_address(request)


def get_device_or_ip(request: Request) -> str:
    """Device ID varsa device üzrə, yoxdursa IP üzrə unikal açar."""
    device_id = request.headers.get("X-Device-Id")
    if device_id and device_id.strip():
        return f"device:{device_id.strip()}"
    return get_remote_address(request)


# Limiter instansiyası
limiter = Limiter(
    key_func=get_rate_limit_key,
    default_limits=["120/minute"] if settings.RATE_LIMIT_ENABLED else [],
    enabled=settings.RATE_LIMIT_ENABLED,
    storage_uri=settings.REDIS_URL or "memory://",
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """
    Rate limit aşıldıqda vahid standartda 429 TOO_MANY_REQUESTS cavabı qaytarır.
    SlowAPIMiddleware sinxron handler tələb etdiyi üçün funksiya def olaraq təyin edilmişdir.
    """
    logger.warning(
        f"RateLimitExceeded: {exc.detail} | Yol: {request.url.path} | IP: {get_remote_address(request)}"
    )
    return JSONResponse(
        status_code=429,
        content=format_error_response(
            code="TOO_MANY_REQUESTS",
            message="Həddindən artıq çox sorğu göndərildi. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.",
            details=[{"detail": str(exc.detail)}],
        ),
        headers={"Retry-After": "60"},
    )

