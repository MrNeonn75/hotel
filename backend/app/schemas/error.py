from typing import Any

from app.schemas.base import CamelModel


class ErrorDetail(CamelModel):
    field: str | None = None
    message: str
    type: str | None = None


class ErrorPayload(CamelModel):
    code: str
    message: str
    details: list[Any] = []


class ErrorResponse(CamelModel):
    error: ErrorPayload
