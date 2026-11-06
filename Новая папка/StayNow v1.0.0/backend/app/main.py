import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.errors import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.core.limiter import limiter, rate_limit_exceeded_handler
from app.core.logging import logger, set_request_id, setup_logging
from app.routers import api_router
from app.routers.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Başlanğıc (Startup)
    setup_logging(level="DEBUG" if settings.is_development else "INFO")
    logger.info(f"StayNow API başladılır... Mühit: {settings.ENV}")

    # Sentry inteqrasiyası (əgər DSN konfiqurasiya edilibsə)
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=settings.SENTRY_ENVIRONMENT or settings.ENV,
                traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
                integrations=[
                    FastApiIntegration(),
                    SqlalchemyIntegration(),
                ],
                send_default_pii=False,
            )
            logger.info("Sentry inteqrasiyası aktivləşdirildi.")
        except Exception as exc:
            logger.warning(f"Sentry inisializasiya xətası: {exc}")

    yield
    # Bağlanış (Shutdown)
    logger.info("StayNow API dayandırılır...")


tags_metadata = [
    {
        "name": "Sistem Sağlamlığı (Health)",
        "description": "API və PostgreSQL verilənlər bazası bağlantısını yoxlayan sistem endpoint-ləri.",
    },
    {
        "name": "Otellər",
        "description": "Bakı şəhərindəki otellərin siyahısı, axtarışı, filtrlənməsi və ətraflı detalları.",
    },
    {
        "name": "Favoritlər",
        "description": "İstifadəçinin bəyəndiyi favorit otellərin idarə edilməsi (əlavə et/sil/siyahı).",
    },
    {
        "name": "Rezervasiyalar",
        "description": "Otel rezervasiyalarının yaradılması, detallarına baxış və ləğv edilməsi.",
    },
    {
        "name": "Profil və Ayarlar",
        "description": "İstifadəçinin şəxsi məlumatları, dil və tema seçimlərinin idarə edilməsi.",
    },
]

app = FastAPI(
    title="StayNow API",
    description="""
# StayNow — Otel Rezervasiya Mobil Tətbiqi üçün Rəsmi Backend API

Bu REST API mobil tətbiq (React Native / Expo) üçün nəzərdə tutulmuşdur:
* **Asinxron memarlıq:** FastAPI + SQLAlchemy 2.0 (asyncpg) + PostgreSQL 16
* **Avtomatik formatlaşdırma:** JSON cavabları mobil tətbiq üçün standart **camelCase** formatındadır
* **Vahid xəta standartı:** Bütün xətalar vahid strukturlu Azərbaycan dilində mesajlarla qaytarılır
* **Təhlükəsizlik:** Həssas sənəd nömrələri bazada AES/Fernet ilə şifrələnir, loglarda maskalanır
* **Rate limiting:** Public endpoint-lər üçün 120 sorğu/dəqiqə/IP, rezervasiyalar üçün 10 sorğu/dəqiqə/device
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# Rate Limiter qeydiyyatı
app.state.limiter = limiter

# 1. GZip Middleware (Böyük JSON cavablarını sıxışdırmaq üçün)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 2. SlowAPI Rate Limiting Middleware
app.add_middleware(SlowAPIMiddleware)

# 3. Request-ID və Performans Loglama Middleware
@app.middleware("http")
async def request_id_and_logging_middleware(request: Request, call_next):
    # Request-ID oxu və ya yarat
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    set_request_id(request_id)

    start_time = time.perf_counter()
    logger.info(f"--> {request.method} {request.url.path}")

    try:
        response = await call_next(request)
        process_time_ms = (time.perf_counter() - start_time) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time_ms:.2f}ms"

        logger.info(
            f"<-- {request.method} {request.url.path} | Status: {response.status_code} | Vaxt: {process_time_ms:.2f}ms"
        )
        return response
    except Exception as exc:
        process_time_ms = (time.perf_counter() - start_time) * 1000
        logger.error(
            f"<-- {request.method} {request.url.path} | XƏTA: {exc} | Vaxt: {process_time_ms:.2f}ms"
        )
        raise exc


# 4. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Global Exception Handler-lər
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)


# 6. Əsas kök səhifə -> Swagger sənədləşməsinə yönləndirmə
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


# 7. Kök səviyyəsində /health və /health/ready marşrutları (K8s/monitoring üçün)
app.include_router(health_router, include_in_schema=False)

# 8. API v1 Marşrutları (/api/v1/...)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
