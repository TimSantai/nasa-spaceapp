from __future__ import annotations

from pathlib import Path

import pytest

from app.core.errors import InsufficientDataError, NotFoundError
from app.data.processed import ProcessedRepository, clear_cache
from tests.rotation_fixtures import write_all, write_site


@pytest.fixture(autouse=True)
def _fresh_cache() -> None:
    clear_cache()


def test_load_reads_climate_terrain_and_rotation(tmp_path: Path) -> None:
    repo = ProcessedRepository(write_all(tmp_path))
    assert repo.available_sites() == ["nevada_mason_valley", "banyumas"]
    nv = repo.load("nevada_mason_valley")
    assert nv.latest_enso == "el_nino" and nv.latest_iod == "negative"
    assert nv.steep_share == pytest.approx(0.25)
    assert nv.rotation_evidence == {"p_alfalfa_stays": 0.8}
    assert all(r.planning_year >= 2000 for r in nv.records)  # unlabelled row skipped
    assert not nv.satellite_soil_moisture
    bn = repo.load("banyumas")
    assert bn.rotation_evidence is None


def test_satellite_flags_follow_folders(tmp_path: Path) -> None:
    root = write_site(
        tmp_path, "banyumas", {"MT1_wet": (1, 1), "MT2_wet_dry": (1, 1), "MT3_dry": (1, 1)}
    )
    (root / "appeears" / "smap").mkdir(parents=True)
    data = ProcessedRepository(tmp_path).load("banyumas")
    assert data.satellite_soil_moisture and not data.satellite_vegetation


def test_unknown_site_and_missing_data(tmp_path: Path) -> None:
    repo = ProcessedRepository(tmp_path)
    with pytest.raises(NotFoundError):
        repo.load("mars")
    with pytest.raises(InsufficientDataError):
        repo.load("banyumas")


def test_table_without_labels_is_insufficient(tmp_path: Path) -> None:
    climate = tmp_path / "banyumas" / "climate"
    climate.mkdir(parents=True)
    (climate / "season_indicators.csv").write_text(
        "season,planning_year,precip_mm,et0_mm,enso_phase,iod_phase\nMT1_wet,2000,1,1,,\n"
    )
    with pytest.raises(InsufficientDataError, match="no labelled seasons"):
        ProcessedRepository(tmp_path).load("banyumas")


def test_outlook_is_optional(tmp_path: Path) -> None:
    root = write_site(
        tmp_path, "banyumas", {"MT1_wet": (1, 1), "MT2_wet_dry": (1, 1), "MT3_dry": (1, 1)}
    )
    (root / "climate" / "outlook.json").unlink()
    (root / "terrain" / "summary.json").unlink()
    data = ProcessedRepository(tmp_path).load("banyumas")
    assert data.steep_share == 0.0
    assert data.latest_enso in {"el_nino", "la_nina", "neutral"}
