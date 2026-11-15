from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.data.processed import ProcessedRepository, clear_cache
from app.features.rotations.router import get_repository
from app.main import create_app
from tests.rotation_fixtures import write_all

pytestmark = pytest.mark.anyio


@pytest.fixture
async def api(tmp_path: Path) -> AsyncIterator[AsyncClient]:
    clear_cache()
    app = create_app()
    repo = ProcessedRepository(write_all(tmp_path))
    app.dependency_overrides[get_repository] = lambda: repo
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


async def test_sites_lists_processed_sites(api: AsyncClient) -> None:
    r = await api.get("/api/v1/rotations/sites")
    body = r.json()
    assert r.status_code == 200 and body["success"]
    keys = [s["key"] for s in body["data"]]
    assert keys == ["nevada_mason_valley", "banyumas"]
    assert "alfalfa" in body["data"][0]["crops"]
    assert body["data"][0]["crop_labels"]["chili"] == "Chili pepper"


async def test_compare_returns_ranked_strategies_with_cards(api: AsyncClient) -> None:
    r = await api.post("/api/v1/rotations/compare", json={"site": "nevada_mason_valley"})
    data = r.json()["data"]
    assert r.status_code == 200
    assert len(data["strategies"]) == 3
    assert [s["rank"] for s in data["strategies"]] == [1, 2, 3]
    card = data["strategies"][0]["card"]
    assert {"why", "evidence", "benefits", "gaps", "risks_for_local_review"} <= set(card)
    assert data["disclaimer"]


async def test_compare_with_farmer_baseline(api: AsyncClient) -> None:
    payload = {
        "site": "banyumas",
        "priorities": {"water": 1, "soil_health": 0, "erosion": 0, "pest_break": 0},
        "risk_aversion": 1,
        "enso_phase": "la_nina",
        "baseline": [{"MT1_wet": "rice", "MT2_wet_dry": "rice", "MT3_dry": "rice"}],
    }
    r = await api.post("/api/v1/rotations/compare", json=payload)
    data = r.json()["data"]
    assert r.status_code == 200
    assert data["analogs"]["phase"].startswith("la_nina")
    assert "farmer_baseline" in [s["key"] for s in data["strategies"]]


@pytest.mark.parametrize(
    ("payload", "status", "code"),
    [
        (
            {"site": "nevada_mason_valley", "baseline": [{"winter_recharge": "corn"}]},
            400,
            "bad_request",
        ),
        ({"site": "mars"}, 404, "not_found"),
        ({"site": "banyumas", "risk_aversion": 2}, 422, "validation_error"),
        (
            {
                "site": "banyumas",
                "priorities": {"water": 0, "soil_health": 0, "erosion": 0, "pest_break": 0},
            },
            400,
            "bad_request",
        ),
        ({"site": "Bad Site!"}, 422, "validation_error"),
    ],
)
async def test_compare_errors(
    api: AsyncClient, payload: dict[str, object], status: int, code: str
) -> None:
    r = await api.post("/api/v1/rotations/compare", json=payload)
    assert r.status_code == status
    assert r.json()["error"]["code"] == code


async def test_default_repository_uses_settings(tmp_path: Path) -> None:
    repo = get_repository()
    assert repo.base.name == "processed"


async def test_compare_with_field_and_scenario(tmp_path: Path) -> None:
    from tests.rotation_fixtures import write_fields

    clear_cache()
    base = write_all(tmp_path)
    write_fields(base)
    app = create_app()
    app.dependency_overrides[get_repository] = lambda: ProcessedRepository(base)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        payload = {
            "site": "banyumas",
            "field_id": "banyumas-karangrau-01",
            "scenario": {"rain_anomaly_pct": -20, "temp_delta_c": 1.5},
        }
        r = await c.post("/api/v1/rotations/compare", json=payload)
        data = r.json()["data"]
        assert r.status_code == 200
        assert data["field_ctx"]["slope_pct"] == 3.0
        assert data["scenario"]["temp_delta_c"] == 1.5
        r = await c.post("/api/v1/rotations/compare", json={"site": "banyumas", "field_id": "nope"})
        assert r.status_code == 404
        bad = {"site": "banyumas", "scenario": {"rain_anomaly_pct": -90}}
        r = await c.post("/api/v1/rotations/compare", json=bad)
        assert r.status_code == 422
    app.dependency_overrides.clear()


async def test_field_without_soil_values_is_rejected(tmp_path: Path) -> None:
    from tests.rotation_fixtures import field_profile, write_fields

    clear_cache()
    base = write_all(tmp_path)
    broken = field_profile()
    broken["soil"] = {}
    write_fields(base, content=[broken])
    app = create_app()
    app.dependency_overrides[get_repository] = lambda: ProcessedRepository(base)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        r = await c.post(
            "/api/v1/rotations/compare",
            json={"site": "banyumas", "field_id": "banyumas-karangrau-01"},
        )
        assert r.status_code == 400 and "slope or AWC" in r.json()["error"]["message"]
    app.dependency_overrides.clear()
