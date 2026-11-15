from __future__ import annotations

from uuid import UUID

from sqlalchemy import ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Declarative base for the application ORM models."""


class UUIDPrimaryKeyMixin:
    """Provide a PostgreSQL-generated UUID primary key."""

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )


def immediate_foreign_key(target: str) -> ForeignKey:
    """Create a deferrable foreign key matching the canonical NASA schema."""

    return ForeignKey(target, deferrable=True, initially="IMMEDIATE")
