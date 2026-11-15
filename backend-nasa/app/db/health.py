"""Database health probing."""

from __future__ import annotations

import asyncio
from typing import Final

import asyncpg
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine

_DEFAULT_TIMEOUT_SECONDS: Final = 5.0


async def is_database_healthy(
    engine: AsyncEngine,
    *,
    timeout_seconds: float = _DEFAULT_TIMEOUT_SECONDS,
) -> bool:
    """Return whether the database answers a bounded ``SELECT 1`` probe."""
    try:
        async with asyncio.timeout(timeout_seconds):
            async with engine.connect() as connection:
                result = await connection.scalar(text("SELECT 1"))
    except (OSError, TimeoutError, asyncpg.PostgresError, SQLAlchemyError):
        return False

    return bool(result == 1)
