import json
from functools import lru_cache
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    ENV: str = "development"
    DATABASE_URL: str = "postgresql+asyncpg://staynow_user:staynow_pass@localhost:5432/staynow_db"
    SECRET_KEY: str = "staynow_super_secret_development_key_change_in_production_32bytes_long"
    ENCRYPTION_KEY: str = "D7z1g0T1Z1z0L4n1g9k3E4w2Q8x7V5u9Y2t1P4r6M8k="
    CORS_ORIGINS: list[str] | str = ["*"]
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    PROJECT_NAME: str = "StayNow"
    API_V1_PREFIX: str = "/api/v1"

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    REDIS_URL: str | None = None

    # Database Connection Pool
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # Sentry Observability
    SENTRY_DSN: str | None = None
    SENTRY_ENVIRONMENT: str | None = None
    SENTRY_TRACES_SAMPLE_RATE: float = 1.0

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            return [i.strip() for i in v_stripped.split(",") if i.strip()]
        elif isinstance(v, list):
            return [str(i).strip() for i in v]
        return ["*"]

    @property
    def is_production(self) -> bool:
        return self.ENV.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENV.lower() == "development"

    @property
    def is_test(self) -> bool:
        return self.ENV.lower() == "test"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
