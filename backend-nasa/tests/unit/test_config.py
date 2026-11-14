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
