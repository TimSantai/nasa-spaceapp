from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.config import Settings


@pytest.mark.unit
def test_cors_origins_split_into_list() -> None:
    s = Settings(cors_origins="http://a.test, http://b.test")
    assert s.cors_origin_list == ["http://a.test", "http://b.test"]


@pytest.mark.unit
def test_wildcard_cors_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(cors_origins="*")


@pytest.mark.unit
def test_database_pool_settings_are_validated() -> None:
    settings = Settings(
        database_pool_size=8,
        database_max_overflow=4,
        database_pool_timeout_seconds=12.5,
        database_pool_recycle_seconds=900,
        database_connect_timeout_seconds=7.5,
    )

    assert settings.database_pool_size == 8
    assert settings.database_max_overflow == 4
    assert settings.database_pool_timeout_seconds == 12.5
    assert settings.database_pool_recycle_seconds == 900
    assert settings.database_connect_timeout_seconds == 7.5


@pytest.mark.unit
def test_database_pool_size_must_be_positive() -> None:
    with pytest.raises(ValidationError):
        Settings(database_pool_size=0)
