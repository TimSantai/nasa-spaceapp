from __future__ import annotations

from pathlib import Path

import pytest

from app.ai.rotation import engine
from app.ai.rotation.catalog import SITES, TEMPLATES, build_years
from app.ai.rotation.models import FieldContext, Scenario, StrategyTemplate
from app.data.processed import ProcessedRepository, clear_cache
from tests.rotation_fixtures import write_all, write_site

W = {"water": 1.0, "soil_health": 1.0, "erosion": 1.0, "pest_break": 0.5}


@pytest.fixture
def repo(tmp_path: Path) -> ProcessedRepository:
    clear_cache()
    return ProcessedRepository(write_all(tmp_path))


def test_analogs_prefer_phase_specific_years(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    a = engine.select_analogs(nv, None, None)
    assert a.grouping == "enso" and a.phase == "el_nino" and len(a.years) == 6
    # 18 fixture years give only 3 neutral|negative years: falls back to ENSO alone
    bn = repo.load("banyumas")
    fallback = engine.select_analogs(bn, "neutral", "negative")
    assert fallback.grouping == "enso" and len(fallback.years) == 6


def test_joint_enso_iod_used_when_enough_years(tmp_path: Path) -> None:
    clear_cache()
    write_site(
        tmp_path,
        "banyumas",
        {"MT1_wet": (1200, 460), "MT2_wet_dry": (800, 400), "MT3_dry": (380, 500)},
        years=30,
    )
    bn = ProcessedRepository(tmp_path).load("banyumas")
    joint = engine.select_analogs(bn, "neutral", "negative")
    assert joint.grouping == "enso+iod" and len(joint.years) >= engine.MIN_ANALOG_N


def test_analogs_fall_back_to_all_years(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    few = type(nv)(**{**nv.__dict__, "records": nv.records[:8]})
    a = engine.select_analogs(few, None, None)
    assert a.grouping == "all"


def test_drier_phase_needs_more_irrigation(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    base = TEMPLATES["nevada_mason_valley"][0]
    dry = engine.evaluate(base, nv, engine.select_analogs(nv, "el_nino", None))
    wet = engine.evaluate(base, nv, engine.select_analogs(nv, "la_nina", None))
    assert dry.irrigation_mean_mm > wet.irrigation_mean_mm
    assert dry.irrigation_cvar_mm >= dry.irrigation_mean_mm


def test_fallow_increases_erosion_and_lowers_cover(repo: ProcessedRepository) -> None:
    bn = repo.load("banyumas")
    a = engine.select_analogs(bn, None, None)
    fallow, soybean = TEMPLATES["banyumas"][0], TEMPLATES["banyumas"][1]
    mf, ms = engine.evaluate(fallow, bn, a), engine.evaluate(soybean, bn, a)
    assert mf.erosion_index > ms.erosion_index
    assert mf.cover_share < ms.cover_share
    assert ms.legume_share > 0 and mf.legume_share == 0


def test_compare_ranks_and_cards(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    res = engine.compare(nv, TEMPLATES["nevada_mason_valley"], W, risk_aversion=0.5)
    assert [s.rank for s in res.strategies] == [1, 2, 3]
    assert res.strategies[0].score >= res.strategies[-1].score
    base = next(s for s in res.strategies if s.kind == "baseline")
    assert any("CDL" in e for e in base.card.evidence)
    assert all(s.card.gaps and s.card.risks_for_local_review for s in res.strategies)
    assert any(s.pareto_optimal for s in res.strategies)
    for s in res.strategies:
        assert all(0.0 <= u <= 1.0 for u in s.utilities.values())


def test_water_only_weight_prefers_lowest_water(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    res = engine.compare(nv, TEMPLATES["nevada_mason_valley"], {"water": 1.0}, risk_aversion=1.0)
    lowest = min(res.strategies, key=lambda s: s.metrics.irrigation_cvar_mm)
    assert res.strategies[0].key == lowest.key


def test_identical_strategies_get_equal_utilities(repo: ProcessedRepository) -> None:
    bn = repo.load("banyumas")
    t = TEMPLATES["banyumas"][1]
    twin = StrategyTemplate(**{**t.__dict__, "key": "twin", "kind": "baseline"})
    res = engine.compare(bn, [twin, t], W, risk_aversion=0.0)
    assert res.strategies[0].score == res.strategies[1].score
    assert all(s.pareto_optimal for s in res.strategies)
    alt = next(s for s in res.strategies if s.kind == "alternative")
    assert "No indicator improves" in alt.card.benefits[0]


def test_assumed_baseline_has_low_confidence(repo: ProcessedRepository) -> None:
    bn = repo.load("banyumas")
    res = engine.compare(bn, TEMPLATES["banyumas"], W, risk_aversion=0.5)
    base = next(s for s in res.strategies if s.kind == "baseline")
    assert base.card.confidence == "low"
    assert any("assumption" in r for r in base.card.confidence_reasons)


@pytest.mark.parametrize(
    ("templates", "weights", "lam", "msg"),
    [
        (1, W, 0.5, "at least two"),
        (3, W, 1.5, "risk_aversion"),
        (3, {"water": 0.0}, 0.5, "priority weight"),
    ],
)
def test_compare_validates_inputs(
    repo: ProcessedRepository, templates: int, weights: dict[str, float], lam: float, msg: str
) -> None:
    nv = repo.load("nevada_mason_valley")
    with pytest.raises(ValueError, match=msg):
        engine.compare(nv, TEMPLATES["nevada_mason_valley"][:templates], weights, lam)


def test_cover_crop_counts_as_living_cover(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    a = engine.select_analogs(nv, None, None)
    clover = TEMPLATES["nevada_mason_valley"][2]
    plain = StrategyTemplate(
        **{
            **clover.__dict__,
            "years": build_years(
                SITES["nevada_mason_valley"],
                [{"winter_recharge": "alfalfa", "growing": "alfalfa"}] * 4
                + [{"winter_recharge": "winter_wheat", "growing": "winter_wheat"}],
            ),
        }
    )
    assert engine.evaluate(clover, nv, a).cover_share > engine.evaluate(plain, nv, a).cover_share


def test_rusle_slope_factor_increases_with_slope() -> None:
    assert engine.rusle_s_factor(2) < engine.rusle_s_factor(8) < engine.rusle_s_factor(12)
    assert engine.rusle_s_factor(0) == pytest.approx(0.03)


def test_soil_storage_reduces_irrigation(repo: ProcessedRepository) -> None:
    bn = repo.load("banyumas")
    a = engine.select_analogs(bn, None, None)
    t = TEMPLATES["banyumas"][1]  # dry-season soybean benefits from carried-over water
    none = engine.evaluate(t, bn, a)
    small = engine.evaluate(t, bn, a, FieldContext("f", 3.0, 50.0))
    large = engine.evaluate(t, bn, a, FieldContext("f", 3.0, 200.0))
    assert large.irrigation_mean_mm < small.irrigation_mean_mm <= none.irrigation_mean_mm


def test_field_slope_scales_erosion(repo: ProcessedRepository) -> None:
    bn = repo.load("banyumas")
    a = engine.select_analogs(bn, None, None)
    t = TEMPLATES["banyumas"][0]
    flat = engine.evaluate(t, bn, a, FieldContext("f", 2.0, 100.0))
    steep = engine.evaluate(t, bn, a, FieldContext("f", 15.0, 100.0))
    assert steep.erosion_index > flat.erosion_index


def test_scenario_drier_and_warmer_needs_more_water(repo: ProcessedRepository) -> None:
    nv = repo.load("nevada_mason_valley")
    a = engine.select_analogs(nv, None, None)
    t = TEMPLATES["nevada_mason_valley"][0]
    base = engine.evaluate(t, nv, a)
    dry = engine.evaluate(t, nv, a, scenario=Scenario(-30, 0))
    hot = engine.evaluate(t, nv, a, scenario=Scenario(0, 2))
    assert dry.irrigation_mean_mm > base.irrigation_mean_mm
    assert hot.irrigation_mean_mm > base.irrigation_mean_mm


def test_compare_reports_field_and_scenario_in_cards(repo: ProcessedRepository) -> None:
    bn = repo.load("banyumas")
    res = engine.compare(
        bn,
        TEMPLATES["banyumas"],
        W,
        0.5,
        field=FieldContext("plot-1", 12.0, 110.0),
        scenario=Scenario(-20, 1.0),
    )
    assert res.field_ctx is not None and res.scenario.rain_anomaly_pct == -20
    text = " ".join(res.strategies[0].card.evidence)
    assert "plot-1" in text and "What-if scenario" in text
