from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.data.processed import ProcessedRepository, clear_cache
from app.features.rotations.router import get_repository
from app.main import create_app

pytestmark = pytest.mark.anyio


@pytest.fixture
async def api(tmp_path: Path) -> AsyncIterator[AsyncClient]:
    clear_cache()
    app = create_app()
    repo = ProcessedRepository(tmp_path)
    app.dependency_overrides[get_repository] = lambda: repo
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


async def test_ingest_harmonizes_nasa_data_and_exports_json(api: AsyncClient) -> None:
    r = await api.post(
        "/api/v1/climate/ingest",
        json={"site": "banyumas", "enable_satellite_flags": True, "update_manifest": False},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    data = body["data"]
    assert data["site"] == "banyumas"
    assert data["seasons_written"] > 50
    assert data["fields_written"] == 3
    assert data["json_report"]["status"] == "optimized"
    assert data["json_report"]["duplicate_gaps_removed"] > 0
    assert data["json_report"]["optimized_bytes"] < data["json_report"]["raw_bytes"]
    assert data["persistence"]["status"] == "skipped_no_db"

    # Now verify climate summary endpoint (compact=True by default)
    r_clim = await api.get("/api/v1/climate/banyumas")
    assert r_clim.status_code == 200
    clim_data = r_clim.json()["data"]
    assert clim_data["site"] == "banyumas"
    assert len(clim_data["phase_summaries"]) == 3
    assert clim_data["records"] == []  # compact mode omits raw rows

    # Verify full records when compact=False and filtered by phase
    r_full = await api.get("/api/v1/climate/banyumas?compact=false&enso_phase=el_nino")
    assert r_full.status_code == 200
    full_data = r_full.json()["data"]
    assert len(full_data["records"]) > 0
    assert all(rec["enso_phase"] == "el_nino" for rec in full_data["records"])

    # Verify JSON export endpoint
    r_exp = await api.get("/api/v1/climate/banyumas/export")
    assert r_exp.status_code == 200
    exp_data = r_exp.json()["data"]
    assert exp_data["site"] == "banyumas"
    assert len(exp_data["shared_site_gaps"]) > 0
    assert set(exp_data["comparisons"].keys()) == {"el_nino", "neutral", "la_nina"}


async def test_ingest_nevada_includes_cdl_transitions(api: AsyncClient) -> None:
    r = await api.post(
        "/api/v1/climate/ingest",
        json={"site": "nevada_mason_valley", "update_manifest": False},
    )
    assert r.status_code == 200
    files = r.json()["data"]["files_generated"]
    assert any("transitions.csv" in f for f in files)


async def test_ingest_unknown_site_returns_404(api: AsyncClient) -> None:
    r = await api.post(
        "/api/v1/climate/ingest",
        json={"site": "mars", "update_manifest": False},
    )
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "not_found"
