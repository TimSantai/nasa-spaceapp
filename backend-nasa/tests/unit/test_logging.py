from __future__ import annotations

import json
import logging

import pytest

from app.core.logging import JsonFormatter, configure_logging


@pytest.mark.unit
def test_json_formatter_emits_valid_json() -> None:
    record = logging.LogRecord("x", logging.INFO, __file__, 1, "hello %s", ("world",), None)
    out = json.loads(JsonFormatter().format(record))
    assert out["msg"] == "hello world"
    assert out["level"] == "INFO"


@pytest.mark.unit
def test_configure_logging_sets_level() -> None:
    configure_logging("WARNING", "json")
    assert logging.getLogger().level == logging.WARNING
    assert isinstance(logging.getLogger().handlers[0].formatter, JsonFormatter)
