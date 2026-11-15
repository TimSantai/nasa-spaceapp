from __future__ import annotations

import pytest

from app.ai.rotation.catalog import KC_DORMANT, SITES, TEMPLATES, build_years, default_stage

NV = SITES["nevada_mason_valley"]
ID = SITES["banyumas"]


def test_every_site_has_a_baseline_and_two_alternatives() -> None:
    for site, templates in TEMPLATES.items():
        kinds = [t.kind for t in templates]
        assert kinds.count("baseline") == 1, site
        assert len(templates) >= 3, site
        for t in templates:
            for year in t.years:
                assert set(year) == set(SITES[site].seasons)


def test_perennial_is_dormant_in_cold_season() -> None:
    stage = default_stage(NV, "winter_recharge", "alfalfa")
    assert stage.kc == KC_DORMANT and stage.active_months == 5
    assert default_stage(NV, "growing", "alfalfa").kc is None


def test_winter_cereal_spans_both_seasons() -> None:
    assert default_stage(NV, "winter_recharge", "winter_wheat").kc == KC_DORMANT
    assert default_stage(NV, "growing", "winter_wheat").active_months == 3.5


def test_annual_crop_capped_by_season_length() -> None:
    assert default_stage(ID, "MT2_wet_dry", "corn").active_months == 4
    assert default_stage(ID, "MT3_dry", "soybean").active_months == 3


@pytest.mark.parametrize(
    ("season", "crop", "msg"),
    [
        ("winter_recharge", "corn", "cannot grow"),
        ("spring", "corn", "unknown season"),
        ("growing", "banana", "unknown crop"),
    ],
)
def test_invalid_stages_raise(season: str, crop: str, msg: str) -> None:
    with pytest.raises(ValueError, match=msg):
        default_stage(NV, season, crop)


def test_build_years_fills_fallow_and_rejects_unknown_season() -> None:
    years = build_years(ID, [{"MT1_wet": "rice"}])
    assert years[0]["MT3_dry"].crop == "fallow"
    with pytest.raises(ValueError, match="unknown season"):
        build_years(ID, [{"MT9": "rice"}])


def test_horticulture_crops_available_in_banyumas() -> None:
    years = build_years(ID, [{"MT1_wet": "rice", "MT2_wet_dry": "chili", "MT3_dry": "tomato"}])
    assert years[0]["MT2_wet_dry"].crop == "chili"
    assert years[0]["MT3_dry"].active_months == 4
    with pytest.raises(ValueError, match="cannot grow"):
        default_stage(NV, "winter_recharge", "tomato")
