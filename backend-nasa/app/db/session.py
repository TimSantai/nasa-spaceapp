"""Request-scoped async database sessions."""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import cast

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

AsyncSessionFactory = async_sessionmaker[AsyncSession]
SessionFactory = AsyncSessionFactory


def create_session_factory(engine: AsyncEngine) -> SessionFactory:
    """Create the application's async session factory."""
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


async def get_db_session(request: Request) -> AsyncIterator[AsyncSession]:
    """Yield one request-scoped session and roll it back when handling fails."""
    session_factory = cast(AsyncSessionFactory, request.app.state.db_session_factory)

    async with session_factory() as session:
        try:
            yield session
        except BaseException:
            await session.rollback()
            raise


async def get_optional_db_session(request: Request) -> AsyncIterator[AsyncSession | None]:
    """Yield an AsyncSession if the database is configured on app.state, else None."""
    session_factory = getattr(request.app.state, "db_session_factory", None)
    if session_factory is None:
        yield None
        return

    factory = cast(AsyncSessionFactory, session_factory)
    async with factory() as session:
        try:
            yield session
        except BaseException:
            await session.rollback()
            raise
