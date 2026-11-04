from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import logger


class AppException(Exception):
    """Tətbiqdaxili bütün xətaların baza sinfi."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: list[Any] | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or []
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Axtarılan resurs tapılmadı", details: list[Any] | None = None):
        super().__init__(
            code="NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class ConflictError(AppException):
    def __init__(
        self,
        message: str = "Məlumat konflikt təşkil edir",
        details: list[Any] | None = None,
        code: str = "CONFLICT",
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class BadRequestError(AppException):
    def __init__(self, message: str = "Yanlış sorğu parametri", details: list[Any] | None = None):
        super().__init__(
            code="BAD_REQUEST",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class UnauthorizedError(AppException):
    def __init__(self, message: str = "E-poçt və ya şifrə yanlışdır", details: list[Any] | None = None):
        super().__init__(
            code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


class ForbiddenError(AppException):
    def __init__(self, message: str = "İcazə verilmədi", details: list[Any] | None = None):
        super().__init__(
            code="FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )


class ValidationError(AppException):
    def __init__(self, message: str = "Daxil edilən məlumatlarda uyğunsuzluq var", details: list[Any] | None = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
            details=details,
        )


def format_error_response(code: str, message: str, details: list[Any] | None = None) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        }
    }


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    logger.warning(f"AppException: [{exc.code}] {exc.message} (path: {request.url.path})")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            code=exc.code,
            message=exc.message,
            details=exc.details,
        ),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    details = []
    for err in exc.errors():
        loc = " -> ".join([str(x) for x in err.get("loc", []) if x != "body"])
        msg = err.get("msg", "Yanlış dəyər")
        details.append({
            "field": loc or "body",
            "message": msg,
            "type": err.get("type", "value_error"),
        })

    logger.warning(f"Validasiya xətası: {details} (path: {request.url.path})")
    return JSONResponse(
        status_code=422,
        content=format_error_response(
            code="VALIDATION_ERROR",
            message="Daxil edilən məlumatlarda uyğunsuzluq var",
            details=details,
        ),
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code_map = {
        400: ("BAD_REQUEST", "Yanlış sorğu"),
        401: ("UNAUTHORIZED", "İcazə verilmədi"),
        403: ("FORBIDDEN", "Giriş qadağandır"),
        404: ("NOT_FOUND", "Axtarılan səhifə və ya resurs tapılmadı"),
        405: ("METHOD_NOT_ALLOWED", "Bu metod dəstəklənmir"),
        409: ("CONFLICT", "Konflikt baş verdi"),
        429: ("TOO_MANY_REQUESTS", "Həddindən artıq çox sorğu"),
        500: ("INTERNAL_SERVER_ERROR", "Daxili server xətası baş verdi"),
        503: ("SERVICE_UNAVAILABLE", "Xidmət müvəqqəti əlçatmazdır"),
    }

    default_code, default_msg = code_map.get(exc.status_code, ("HTTP_ERROR", "Xəta baş verdi"))
    msg = str(exc.detail) if exc.detail and exc.detail != "" else default_msg

    logger.warning(f"HTTPException {exc.status_code}: {msg} (path: {request.url.path})")
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(
            code=default_code,
            message=msg,
            details=[],
        ),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Gözlənilməz server xətası: {exc} (path: {request.url.path})")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            code="INTERNAL_SERVER_ERROR",
            message="Gözlənilməz daxili server xətası baş verdi",
            details=[str(exc)] if logger.isEnabledFor(10) else [],
        ),
    )
