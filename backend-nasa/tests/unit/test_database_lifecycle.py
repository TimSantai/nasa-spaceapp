from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import SecretStr
from sqlalchemy.ext.asyncio import AsyncEngine

from app.core.config import Settings
from app.db.config import DatabaseConfig
from app.main import create_app


@pytest.mark.unit
@pytest.mark.anyio
async def test_app_lifespan_initializes_and_disposes_database(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    config = DatabaseConfig(
        url=SecretStr("postgresql://user:password@db.example.test:5432/postgres")
    )
    engine = MagicMock(spec=AsyncEngine)
    engine.dispose = AsyncMock()
    session_factory = MagicMock()
    monkeypatch.setattr("app.main.get_database_config", MagicMock(return_value=config))
    monkeypatch.setattr("app.main.create_database_engine", MagicMock(return_value=engine))
    monkeypatch.setattr("app.main.create_session_factory", MagicMock(return_value=session_factory))
    monkeypatch.setattr("app.main.is_database_healthy", AsyncMock(return_value=True))
    app = create_app(Settings(database_url=config.url))

    async with app.router.lifespan_context(app):
        assert app.state.db_engine is engine
        assert app.state.db_session_factory is session_factory

    engine.dispose.assert_awaited_once_with()


@pytest.mark.unit
@pytest.mark.anyio
async def test_app_lifespan_continues_when_database_is_unhealthy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    config = DatabaseConfig(url=SecretStr("postgresql://user:password@invalid.test:5432/postgres"))
    engine = MagicMock(spec=AsyncEngine)
    engine.dispose = AsyncMock()
    monkeypatch.setattr("app.main.get_database_config", MagicMock(return_value=config))
    monkeypatch.setattr("app.main.create_database_engine", MagicMock(return_value=engine))
    monkeypatch.setattr("app.main.create_session_factory", MagicMock(return_value=MagicMock()))
    monkeypatch.setattr("app.main.is_database_healthy", AsyncMock(return_value=False))
    app = create_app(Settings(database_url=config.url))

    async with app.router.lifespan_context(app):
        pass

    engine.dispose.assert_awaited_once_with()


@pytest.mark.unit
@pytest.mark.anyio
async def test_app_lifespan_skips_database_without_url(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    create_engine = MagicMock()
    monkeypatch.setattr("app.main.create_database_engine", create_engine)
    app = create_app(Settings(database_url=None))

    async with app.router.lifespan_context(app):
        pass

    create_engine.assert_not_called()
