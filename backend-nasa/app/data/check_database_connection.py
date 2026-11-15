"""Database connectivity check used during application startup."""

from __future__ import annotations

import logging

import asyncpg
from pydantic import SecretStr

logger = logging.getLogger(__name__)


async def check_database_connection(
    database_url: SecretStr,
    *,
    timeout_seconds: int = 5,
) -> bool:
    """Return whether PostgreSQL accepts a connection and a trivial query."""
    try:
        connection = await asyncpg.connect(
            database_url.get_secret_value(),
            timeout=timeout_seconds,
        )
        try:
            await connection.execute("SELECT 1")
        finally:
            await connection.close()
    except (OSError, TimeoutError, asyncpg.PostgresError) as error:
        logger.error("database connection check failed: %s", error)
        return False

    return True
