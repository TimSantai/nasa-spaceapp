from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.config import Settings
from app.db.config import get_database_config
from app.db.connection import build_async_database_url, create_database_engine
from app.db.health import is_database_healthy
from app.db.session import create_session_factory


def test_database_config_uses_core_settings() -> None:
    settings = Settings(
        database_url=SecretStr("postgresql://user:password@db.example.test:5432/postgres"),
        database_pool_size=9,
        database_max_overflow=3,
    )

    config = get_database_config(settings)

    assert config.url == settings.database_url
    assert config.pool_size == 9
    assert config.max_overflow == 3


def test_build_async_database_url_normalizes_postgresql_driver() -> None:
    url = build_async_database_url(
        SecretStr("postgresql://user:password@db.example.test:5432/postgres?sslmode=require")
    )

    assert url.drivername == "postgresql+asyncpg"
    assert url.host == "db.example.test"
    assert url.query["sslmode"] == "require"


def test_build_async_database_url_rejects_non_postgresql_driver() -> None:
    with pytest.raises(ValueError, match="PostgreSQL"):
        build_async_database_url(SecretStr("sqlite:///local.db"))


def test_create_database_engine_hides_parameters() -> None:
    engine = create_database_engine(
        SecretStr("postgresql://user:password@db.example.test:5432/postgres")
    )

    assert isinstance(engine, AsyncEngine)
    assert engine.hide_parameters is True


@pytest.mark.anyio
async def test_database_health_uses_engine_connection() -> None:
    connection = MagicMock()
    connection.scalar = AsyncMock(return_value=1)
    connection_context = MagicMock()
    connection_context.__aenter__ = AsyncMock(return_value=connection)
    connection_context.__aexit__ = AsyncMock(return_value=None)
    engine = MagicMock(spec=AsyncEngine)
    engine.connect.return_value = connection_context

    assert await is_database_healthy(engine) is True
    connection.scalar.assert_awaited_once()


def test_session_factory_disables_expiration_after_commit() -> None:
    engine = MagicMock(spec=AsyncEngine)
    factory = create_session_factory(engine)

    assert factory.kw["expire_on_commit"] is False
    assert factory.kw["autoflush"] is False
