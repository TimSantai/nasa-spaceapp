"""Canonical runtime configuration for database infrastructure."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

from pydantic import SecretStr

from app.core.config import Settings, get_settings

_DEFAULT_POOL_SIZE: Final = 5
_DEFAULT_MAX_OVERFLOW: Final = 5
_DEFAULT_POOL_TIMEOUT_SECONDS: Final = 30.0
_DEFAULT_POOL_RECYCLE_SECONDS: Final = 1_800
_DEFAULT_CONNECT_TIMEOUT_SECONDS: Final = 10.0


@dataclass(frozen=True, slots=True)
class DatabaseConfig:
    """Validated, immutable database settings used at runtime."""

    url: SecretStr
    pool_size: int = _DEFAULT_POOL_SIZE
    max_overflow: int = _DEFAULT_MAX_OVERFLOW
    pool_timeout: float = _DEFAULT_POOL_TIMEOUT_SECONDS
    pool_recycle: int = _DEFAULT_POOL_RECYCLE_SECONDS
    connect_timeout: float = _DEFAULT_CONNECT_TIMEOUT_SECONDS

    def __post_init__(self) -> None:
        if self.pool_size < 1:
            raise ValueError("database pool_size must be at least 1")
        if self.max_overflow < 0:
            raise ValueError("database max_overflow must not be negative")
        if self.pool_timeout <= 0:
            raise ValueError("database pool_timeout must be positive")
        if self.pool_recycle <= 0:
            raise ValueError("database pool_recycle must be positive")
        if self.connect_timeout <= 0:
            raise ValueError("database connect_timeout must be positive")

    @property
    def database_url(self) -> SecretStr:
        """Return the secret URL under the core settings field name."""
        return self.url

    @classmethod
    def from_settings(cls, settings: Settings) -> DatabaseConfig:
        """Adapt core application settings into database runtime settings."""
        if settings.database_url is None:
            raise ValueError("DATABASE_URL must be configured for database access")

        return cls(
            url=settings.database_url,
            pool_size=getattr(settings, "database_pool_size", _DEFAULT_POOL_SIZE),
            max_overflow=getattr(settings, "database_max_overflow", _DEFAULT_MAX_OVERFLOW),
            pool_timeout=getattr(
                settings,
                "database_pool_timeout_seconds",
                _DEFAULT_POOL_TIMEOUT_SECONDS,
            ),
            pool_recycle=getattr(
                settings,
                "database_pool_recycle_seconds",
                _DEFAULT_POOL_RECYCLE_SECONDS,
            ),
            connect_timeout=getattr(
                settings,
                "database_connect_timeout_seconds",
                _DEFAULT_CONNECT_TIMEOUT_SECONDS,
            ),
        )


def get_database_config(settings: Settings | None = None) -> DatabaseConfig:
    """Return canonical database configuration from core application settings."""
    return DatabaseConfig.from_settings(settings or get_settings())
