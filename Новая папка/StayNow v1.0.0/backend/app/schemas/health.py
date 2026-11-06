from datetime import datetime

from app.schemas.base import CamelModel


class LivenessResponse(CamelModel):
    status: str
    environment: str
    timestamp: datetime
    version: str


class ReadinessResponse(CamelModel):
    status: str
    database: str
    environment: str
    timestamp: datetime
    version: str


# Geriyə uyğunluq üçün alias
HealthCheckResponse = ReadinessResponse
