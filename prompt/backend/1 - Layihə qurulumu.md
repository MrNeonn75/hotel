Python 3.12 ilə FastAPI backend layihəsi qur (otel rezervasiya mobil tətbiqi üçün). Tətbiqin adı müvəqqəti "StayNow".

STACK: FastAPI, SQLAlchemy 2.0 (async, asyncpg), Alembic, Pydantic v2 + pydantic-settings, PostgreSQL 16, uvicorn, pytest, pytest-asyncio, httpx, ruff, cryptography.
Paket idarəetməsi: uv və ya poetry (pyproject.toml).

STRUKTUR:
app/
  main.py
  core/ (config.py, database.py, security.py, errors.py, logging.py)
  models/ (SQLAlchemy modelləri)
  schemas/ (Pydantic modelləri)
  routers/ (hotels.py, favorites.py, bookings.py, profile.py, health.py)
  services/ (biznes məntiqi: hotel_service, booking_service və s.)
  repositories/ (DB sorğuları)
  deps.py (dependency-lər)
alembic/
tests/
scripts/ (seed.py)
docker-compose.yml (api + postgres), Dockerfile, .env.example, Makefile (run, migrate, seed, test, lint).

TƏLƏBLƏR:
- Konfiqurasiya yalnız .env-dən (DATABASE_URL, SECRET_KEY, ENCRYPTION_KEY, CORS_ORIGINS, ENV).
- API prefiksi /api/v1. GET /api/v1/health endpoint-i (DB bağlantısını da yoxlasın).
- CORS konfiqurasiyası, request-id middleware, struktur loglama.
- Bütün sxemlərdə JSON açarları camelCase olsun (Pydantic alias_generator=to_camel, populate_by_name=True), DB və Python kodu snake_case qalsın.
- Vahid xəta formatı: { "error": { "code": "...", "message": "Azərbaycan dilində mesaj", "details": [...] } }. Validasiya, 404, 409 və gözlənilməz xətalar üçün global exception handler-lər yaz.
- Swagger (/docs) Azərbaycan dilində təsvirlərlə.
Nəticədə docker compose up ilə API-nin qalxdığını və /health-in işlədiyini yoxla.