"""Application settings loaded from environment variables (see .env.example)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", frozen=True)

    app_env: str = Field(default="development", pattern="^(development|test|production)$")
    app_port: int = Field(default=8000, ge=1, le=65535)
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    data_dir: Path = Path("datasets")
    # Derived products from fieldshift-data-kit (data/processed/<site>/{climate,terrain,rotation})
    processed_dir: Path = Path("datasets/processed")
    models_dir: Path = Path("models")
    log_level: str = Field(default="INFO", pattern="^(DEBUG|INFO|WARNING|ERROR)$")
    log_format: str = Field(default="text", pattern="^(text|json)$")
    rate_limit_default: str = "120/minute"

    # Infrastructure (optional until a module uses it). SecretStr keeps passwords out of logs.
    database_url: SecretStr | None = None
    database_pool_size: int = Field(default=5, ge=1)
    database_max_overflow: int = Field(default=5, ge=0)
    database_pool_timeout_seconds: float = Field(default=30.0, gt=0)
    database_pool_recycle_seconds: int = Field(default=1_800, ge=1)
    database_connect_timeout_seconds: float = Field(default=10.0, gt=0)
    redis_url: SecretStr | None = None

    @field_validator("cors_origins")
    @classmethod
    def no_wildcard(cls, value: str) -> str:
        if "*" in value:
            raise ValueError("CORS_ORIGINS must list explicit origins, not '*'")
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def resolve(self, path: Path) -> Path:
        return path if path.is_absolute() else BACKEND_ROOT / path


@lru_cache
def get_settings() -> Settings:
    return Settings()
