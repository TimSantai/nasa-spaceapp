from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.data.processed import ProcessedRepository, clear_cache
from app.features.rotations.router import get_repository
from app.main import create_app
from tests.rotation_fixtures import write_fields

pytestmark = pytest.mark.anyio


@pytest.fixture
def base(tmp_path: Path) -> Path:
    clear_cache()
    return tmp_path


async def _client(base: Path) -> AsyncIterator[AsyncClient]:
    app = create_app()
    repo = ProcessedRepository(base)
    app.dependency_overrides[get_repository] = lambda: repo
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
async def api(base: Path) -> AsyncIterator[AsyncClient]:
    write_fields(base)
    async for c in _client(base):
        yield c


async def test_list_fields_camel_case(api: AsyncClient) -> None:
    r = await api.get("/api/v1/fields")
    body = r.json()
    assert r.status_code == 200 and body["success"]
    first = body["data"][0]
    assert first["elevationMeters"] == 26
    assert first["soil"]["erosionRisk"] == "Low"
    assert first["dataAvailability"]["hasSatelliteNdvi"] is True
    assert first["provenance"]["elevationSlope"] == "SRTM"


async def test_get_one_field_and_missing(api: AsyncClient) -> None:
    r = await api.get("/api/v1/fields/banyumas-rawalo-03")
    assert r.status_code == 200 and r.json()["data"]["id"] == "banyumas-rawalo-03"
    r = await api.get("/api/v1/fields/nope")
    assert r.status_code == 404 and r.json()["error"]["code"] == "not_found"


@pytest.mark.parametrize(
    ("query", "status", "code"),
    [
        ("?site=mars", 404, "not_found"),
        ("?site=nevada_mason_valley", 422, "insufficient_data"),
        ("?site=Bad!", 422, "validation_error"),
    ],
)
async def test_list_fields_errors(api: AsyncClient, query: str, status: int, code: str) -> None:
    r = await api.get(f"/api/v1/fields{query}")
    assert r.status_code == status and r.json()["error"]["code"] == code


@pytest.mark.parametrize("content", [{"not": "a list"}, [{"id": "broken"}]])
async def test_bad_field_files_are_reported(base: Path, content: object) -> None:
    write_fields(base, content=content)
    async for c in _client(base):
        r = await c.get("/api/v1/fields")
        assert r.status_code == 422 and r.json()["error"]["code"] == "insufficient_data"
