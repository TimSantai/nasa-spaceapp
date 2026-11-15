"""Async SQLAlchemy engine construction for PostgreSQL."""

from __future__ import annotations

from typing import Final

from pydantic import SecretStr
from sqlalchemy import URL, make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.db.config import DatabaseConfig

_ASYNCPG_DRIVER: Final = "postgresql+asyncpg"
_POSTGRESQL_DIALECTS: Final = frozenset({"postgres", "postgresql"})
_SUPPORTED_ASYNCPG_SSL_MODES: Final = frozenset(
    {"disable", "allow", "prefer", "require", "verify-ca", "verify-full"}
)


class _DatabaseAsyncEngine(AsyncEngine):
    """Expose security-relevant sync-engine configuration on the async wrapper."""

    @property
    def hide_parameters(self) -> bool:
        return bool(self.sync_engine.hide_parameters)


def build_async_database_url(database_url: SecretStr) -> URL:
    """Return a validated PostgreSQL URL configured for SQLAlchemy asyncpg."""
    try:
        url = make_url(database_url.get_secret_value())
    except ArgumentError as error:
        raise ValueError("DATABASE_URL must be a valid PostgreSQL URL") from error

    dialect, separator, driver = url.drivername.lower().partition("+")
    if dialect not in _POSTGRESQL_DIALECTS:
        raise ValueError("DATABASE_URL must use PostgreSQL")
    if separator and driver != "asyncpg":
        raise ValueError("DATABASE_URL uses an unsupported PostgreSQL driver")

    return url.set(drivername=_ASYNCPG_DRIVER)


def create_database_engine(config: DatabaseConfig | SecretStr) -> AsyncEngine:
    """Create a conservatively pooled async PostgreSQL engine.

    ``SecretStr`` remains accepted for callers using the original API. Runtime
    application code should pass ``DatabaseConfig`` so all engine behavior is
    sourced from the canonical database configuration.
    """
    database_config = config if isinstance(config, DatabaseConfig) else DatabaseConfig(url=config)
    url = build_async_database_url(database_config.url)
    engine_url, ssl_connect_args = _prepare_asyncpg_ssl(url)
    connect_args = {
        **ssl_connect_args,
        "timeout": database_config.connect_timeout,
    }

    engine = create_async_engine(
        engine_url,
        connect_args=connect_args,
        hide_parameters=True,
        pool_pre_ping=True,
        pool_size=database_config.pool_size,
        max_overflow=database_config.max_overflow,
        pool_timeout=database_config.pool_timeout,
        pool_recycle=database_config.pool_recycle,
    )
    return _DatabaseAsyncEngine(engine.sync_engine)


def _prepare_asyncpg_ssl(url: URL) -> tuple[URL, dict[str, object]]:
    """Translate libpq's sslmode query option to asyncpg's ssl argument."""
    sslmode = url.query.get("sslmode")
    if sslmode is None:
        return url, {}
    if not isinstance(sslmode, str) or sslmode not in _SUPPORTED_ASYNCPG_SSL_MODES:
        raise ValueError("DATABASE_URL contains an unsupported PostgreSQL sslmode")
    if "ssl" in url.query:
        raise ValueError("DATABASE_URL must not specify both ssl and sslmode")

    return url.difference_update_query(["sslmode"]), {"ssl": sslmode}
