"""Rotation comparison engine.

For each strategy and each analog year (historical years in the same ENSO/IOD phase), the
rotation is run as if every year had that year's seasonal climate, season by season:

    supply = PE_FACTOR * P + stored soil water
    irrigation need (mm) = max(0, ET0 * Kc_eff - supply)
    stored soil water = min(capacity, max(0, supply - ET0 * Kc_eff))   carried to the next season
    Kc_eff = (active * Kc + cover * Kc_cover + bare * KC_BARE) / season months

Without a field, capacity is 0 (no carry-over). With a field, capacity = AWC (mm/m) x
ROOT_DEPTH_M. A scenario scales rainfall by (1 + pct/100) and adjusts ET0 for warmer air with
the Hargreaves-Samani temperature term: ET0' = ET0 * (T + dT + 17.8) / (T + 17.8).
Erosion exposure uses the RUSLE slope-steepness factor S (McCool et al., 1987) of the field's
slope, or (1 + share of steep land) at site level.

The per-rotation-year mean over analog years gives the expected need, and CVaR20 (mean of the
worst 20 % of analog years) the tail risk. The water objective blends them:
J = (1 - lambda) * mean + lambda * CVaR. Soil indicators are transparent heuristics.
Every objective is min-max normalised across the compared strategies (1 = best), weighted
by the farmer's priorities, and Pareto dominance is reported alongside the weighted rank.
"""

from __future__ import annotations

import math
from collections.abc import Mapping, Sequence

from app.ai.rotation.catalog import CROPS, KC_BARE
from app.ai.rotation.models import (
    Analogs,
    Comparison,
    EvidenceCard,
    FieldContext,
    Metrics,
    Scenario,
    SeasonRecord,
    SiteData,
    Stage,
    StrategyResult,
    StrategyTemplate,
)

PE_FACTOR = 0.8  # share of season rainfall assumed effective (simple, documented assumption)
ROOT_DEPTH_M = 0.6  # effective rooting depth for soil-water storage (planning assumption)
DEFAULT_TMEAN_C = 25.0  # used for ET0 scenario scaling when a season has no temperature
CVAR_ALPHA = 0.2
MIN_ANALOG_N = 5
OBJECTIVES = ("water", "soil_health", "erosion", "pest_break")


def select_analogs(site: SiteData, enso: str | None, iod: str | None) -> Analogs:
    """Most specific phase grouping with at least MIN_ANALOG_N complete years."""
    enso = enso or site.latest_enso
    iod = iod or site.latest_iod
    complete = _complete_years(site)
    by_year = {r.planning_year: r for r in site.records}
    options: list[tuple[str, str, list[int]]] = []
    if site.config.use_iod:
        options.append(
            (
                "enso+iod",
                f"{enso}|{iod}",
                [
                    y
                    for y in complete
                    if by_year[y].enso_phase == enso and by_year[y].iod_phase == iod
                ],
            )
        )
    options.append(("enso", enso, [y for y in complete if by_year[y].enso_phase == enso]))
    if site.config.use_iod:
        options.append(("iod", iod, [y for y in complete if by_year[y].iod_phase == iod]))
    options.append(("all", "all", list(complete)))
    for grouping, phase, years in options:
        if len(years) >= MIN_ANALOG_N:
            return Analogs(grouping, phase, tuple(years))
    grouping, phase, years = options[-1]
    return Analogs(grouping, phase, tuple(years))


def _complete_years(site: SiteData) -> list[int]:
    seasons = set(site.config.seasons)
    have: dict[int, set[str]] = {}
    for r in site.records:
        have.setdefault(r.planning_year, set()).add(r.season)
    return sorted(y for y, s in have.items() if s >= seasons)


def _kc_eff(stage: Stage, months: int) -> tuple[float, float]:
    """(effective Kc over the slot, bare months)."""
    if stage.crop == "fallow":
        return KC_BARE, float(months)
    kc = stage.kc if stage.kc is not None else CROPS[stage.crop].kc_mid
    cover_kc = CROPS[stage.cover_crop].kc_mid if stage.cover_crop else 0.0
    bare = max(0.0, months - stage.active_months - stage.cover_months)
    eff = (stage.active_months * kc + stage.cover_months * cover_kc + bare * KC_BARE) / months
    return eff, bare


def rusle_s_factor(slope_pct: float) -> float:
    """RUSLE slope-steepness factor S (McCool et al., 1987)."""
    sin_t = math.sin(math.atan(max(slope_pct, 0.0) / 100))
    return 10.8 * sin_t + 0.03 if slope_pct < 9 else 16.8 * sin_t - 0.50


def _climate(rec: SeasonRecord, scenario: Scenario) -> tuple[float, float]:
    """(rainfall, ET0) for a season after the what-if scenario."""
    precip = rec.precip_mm * max(0.0, 1 + scenario.rain_anomaly_pct / 100)
    t = rec.tmean_c if rec.tmean_c is not None else DEFAULT_TMEAN_C
    et0 = rec.et0_mm * max(0.0, (t + scenario.temp_delta_c + 17.8) / (t + 17.8))
    return precip, et0


def _cvar_high(values: Sequence[float]) -> float:
    k = max(1, math.ceil(CVAR_ALPHA * len(values)))
    return sum(sorted(values, reverse=True)[:k]) / k


def evaluate(
    template: StrategyTemplate,
    site: SiteData,
    analogs: Analogs,
    field: FieldContext | None = None,
    scenario: Scenario | None = None,
) -> Metrics:
    scenario = scenario or Scenario()
    months = site.config.seasons
    clim: dict[tuple[int, str], SeasonRecord] = {
        (r.planning_year, r.season): r for r in site.records
    }
    n_years = len(template.years)
    capacity = field.awc_mm_per_m * ROOT_DEPTH_M if field else 0.0
    slope_factor = rusle_s_factor(field.slope_pct) if field else 1 + site.steep_share

    per_analog = []
    for y in analogs.years:
        total = stored = 0.0
        for year in template.years:
            for season, stage in year.items():
                precip, et0 = _climate(clim[(y, season)], scenario)
                kc, _ = _kc_eff(stage, months[season])
                demand = et0 * kc
                supply = PE_FACTOR * precip + stored
                total += max(0.0, demand - supply)
                stored = min(capacity, max(0.0, supply - demand))
        per_analog.append(total / n_years)

    mean_p = {
        s: sum(_climate(clim[(y, s)], scenario)[0] for y in analogs.years) / len(analogs.years)
        for s in months
    }
    all_months = n_years * sum(months.values())
    living = legume = erosion = 0.0
    families: set[str] = set()
    slots: list[str] = []  # dominant family per season slot, in rotation order
    for year in template.years:
        for season, stage in year.items():
            fam_months: dict[str, float] = {}
            _, bare = _kc_eff(stage, months[season])
            erosion += bare / months[season] * mean_p[season] * slope_factor
            parts = ((stage.crop, stage.active_months), (stage.cover_crop, stage.cover_months))
            for crop, m in parts:
                if crop is None or crop == "fallow" or m <= 0:
                    continue
                profile = CROPS[crop]
                living += m
                legume += m if profile.legume else 0.0
                families.add(profile.family)
                fam_months[profile.family] = fam_months.get(profile.family, 0.0) + m
            slots.append(max(fam_months, key=fam_months.__getitem__) if fam_months else "fallow")
    # cyclic: the rotation repeats, so the last slot is followed by the first
    changes = sum(a != b for a, b in zip(slots, slots[1:] + slots[:1], strict=True))
    pest_break = changes / len(slots)
    cover_share = living / all_months
    legume_share = legume / living if living else 0.0
    soil = (cover_share + legume_share + min(len(families) / 3, 1.0)) / 3

    return Metrics(
        irrigation_mean_mm=round(sum(per_analog) / len(per_analog), 1),
        irrigation_cvar_mm=round(_cvar_high(per_analog), 1),
        cover_share=round(min(cover_share, 1.0), 3),
        legume_share=round(legume_share, 3),
        families=len(families),
        pest_break_share=round(pest_break, 3),
        erosion_index=round(erosion / n_years, 1),
        soil_health=round(soil, 3),
    )


def _objective_values(m: Metrics, risk_aversion: float) -> dict[str, tuple[float, bool]]:
    """objective -> (value, higher_is_better)."""
    water = (1 - risk_aversion) * m.irrigation_mean_mm + risk_aversion * m.irrigation_cvar_mm
    return {
        "water": (water, False),
        "soil_health": (m.soil_health, True),
        "erosion": (m.erosion_index, False),
        "pest_break": (m.pest_break_share, True),
    }


def _utilities(values: Sequence[dict[str, tuple[float, bool]]]) -> list[dict[str, float]]:
    out: list[dict[str, float]] = [{} for _ in values]
    for obj in OBJECTIVES:
        xs = [v[obj][0] for v in values]
        lo, hi = min(xs), max(xs)
        higher = values[0][obj][1]
        for i, x in enumerate(xs):
            if math.isclose(hi, lo):
                out[i][obj] = 1.0
            else:
                u = (x - lo) / (hi - lo)
                out[i][obj] = round(u if higher else 1 - u, 3)
    return out


def _pareto(utils: Sequence[Mapping[str, float]]) -> list[bool]:
    flags = []
    for i, u in enumerate(utils):
        dominated = any(
            all(v[k] >= u[k] for k in OBJECTIVES) and any(v[k] > u[k] for k in OBJECTIVES)
            for j, v in enumerate(utils)
            if j != i
        )
        flags.append(not dominated)
    return flags


def compare(
    site: SiteData,
    templates: Sequence[StrategyTemplate],
    weights: Mapping[str, float],
    risk_aversion: float,
    enso: str | None = None,
    iod: str | None = None,
    field: FieldContext | None = None,
    scenario: Scenario | None = None,
) -> Comparison:
    if len(templates) < 2:
        raise ValueError("need at least two strategies to compare")
    if not 0 <= risk_aversion <= 1:
        raise ValueError("risk_aversion must be within 0..1")
    w = {k: max(0.0, float(weights.get(k, 0.0))) for k in OBJECTIVES}
    if sum(w.values()) <= 0:
        raise ValueError("at least one priority weight must be positive")
    analogs = select_analogs(site, enso, iod)
    if not analogs.years:
        raise ValueError("no complete climate years available for this site")

    scenario = scenario or Scenario()
    metrics = [evaluate(t, site, analogs, field, scenario) for t in templates]
    utils = _utilities([_objective_values(m, risk_aversion) for m in metrics])
    total_w = sum(w.values())
    scores = [round(sum(w[k] * u[k] for k in OBJECTIVES) / total_w, 3) for u in utils]
    pareto = _pareto(utils)
    order = sorted(range(len(templates)), key=lambda i: -scores[i])
    rank = {i: r + 1 for r, i in enumerate(order)}
    baseline = next((i for i, t in enumerate(templates) if t.kind == "baseline"), 0)

    results = [
        StrategyResult(
            key=t.key,
            name=t.name,
            kind=t.kind,
            sequence=tuple({s: _describe(st) for s, st in year.items()} for year in t.years),
            metrics=metrics[i],
            utilities=utils[i],
            score=scores[i],
            rank=rank[i],
            pareto_optimal=pareto[i],
            card=build_card(
                t, metrics[i], metrics[baseline], site, analogs, i == baseline, field, scenario
            ),
        )
        for i, t in enumerate(templates)
    ]
    return Comparison(
        site=site.config.key,
        analogs=analogs,
        weights=w,
        risk_aversion=risk_aversion,
        strategies=tuple(sorted(results, key=lambda r: r.rank)),
        field_ctx=field,
        scenario=scenario,
    )


def _describe(stage: Stage) -> str:
    if stage.crop == "fallow":
        return "fallow"
    text = CROPS[stage.crop].name
    if stage.kc is not None and CROPS[stage.crop].perennial:
        text += " (dormant)"
    if stage.cover_crop:
        text += f" + {CROPS[stage.cover_crop].name}"
    return text


def build_card(
    t: StrategyTemplate,
    m: Metrics,
    base: Metrics,
    site: SiteData,
    analogs: Analogs,
    is_baseline: bool,
    field: FieldContext | None = None,
    scenario: Scenario | None = None,
) -> EvidenceCard:
    yrs = ", ".join(map(str, analogs.years))
    evidence = [
        f"Climate analogs ({analogs.grouping} = {analogs.phase}, n={len(analogs.years)}): {yrs}. "
        "Seasonal rainfall and ET0 from NASA POWER daily data (1991-2025).",
        f"Irrigation need {m.irrigation_mean_mm:.0f} mm per rotation year on average; "
        f"{m.irrigation_cvar_mm:.0f} mm in the worst 20 % of analog years.",
        f"{site.steep_share:.0%} of the site area has slopes above 10 % (SRTM).",
    ]
    if field:
        evidence.append(
            f"Field {field.field_id}: slope {field.slope_pct:.1f} % (RUSLE S = "
            f"{rusle_s_factor(field.slope_pct):.2f}), AWC {field.awc_mm_per_m:.0f} mm/m, so up to "
            f"{field.awc_mm_per_m * ROOT_DEPTH_M:.0f} mm of surplus rain carries over."
        )
    if scenario and (scenario.rain_anomaly_pct or scenario.temp_delta_c):
        evidence.append(
            f"What-if scenario: rainfall {scenario.rain_anomaly_pct:+.0f} %, air temperature "
            f"{scenario.temp_delta_c:+.1f} C applied to every analog year."
        )
    if t.evidence_basis == "cdl" and site.rotation_evidence:
        p = site.rotation_evidence.get("p_alfalfa_stays")
        if isinstance(p, float):
            evidence.append(
                f"USDA CDL 2016-2023: an alfalfa pixel stays alfalfa the next year with "
                f"probability {p:.2f} (about {1 / (1 - p):.0f}-year stands)."
            )

    benefits: list[str] = []
    if not is_baseline:
        saved = base.irrigation_mean_mm - m.irrigation_mean_mm
        saved_tail = base.irrigation_cvar_mm - m.irrigation_cvar_mm
        if saved > 0:
            benefits.append(
                f"About {saved:.0f} mm less irrigation per year than the current rotation "
                f"({saved_tail:.0f} mm less in dry analog years)."
            )
        if m.cover_share > base.cover_share:
            benefits.append(
                f"Living cover {m.cover_share:.0%} of the year vs {base.cover_share:.0%} now."
            )
        if m.legume_share > base.legume_share:
            benefits.append("More legume months, which add biological nitrogen.")
        if m.erosion_index < base.erosion_index:
            benefits.append("Less rain falling on bare soil, lowering erosion exposure.")
        if m.pest_break_share > base.pest_break_share:
            benefits.append("More changes of crop family, which can interrupt pest cycles.")
        if not benefits:
            benefits.append("No indicator improves on the current rotation under these analogs.")
    else:
        benefits.append("Reference point: other strategies are compared against this rotation.")

    gaps = list(t.gaps)
    gaps.append("Rainfall and soil wetness come from NASA POWER (reanalysis-based, ~0.5 degree).")
    if not site.satellite_soil_moisture:
        gaps.append("SMAP satellite soil moisture not yet included.")
    if not site.satellite_vegetation:
        gaps.append("MODIS NDVI (bare-field timing, crop stress) not yet included.")
    gaps.append(
        "ET0 uses Hargreaves-Samani from temperature; months outside the modelled seasons "
        "are not counted."
    )
    gaps.append("Crop prices, yields and labour are not modelled.")

    reasons: list[str] = []
    level = 2  # 1 low, 2 medium
    if len(analogs.years) < MIN_ANALOG_N:
        level = 1
        reasons.append(f"Only {len(analogs.years)} analog years.")
    if analogs.grouping == "all":
        reasons.append("No phase-specific analogs; using all years.")
    if t.evidence_basis == "assumed":
        level = 1
        reasons.append("Rotation is an assumption, not observed.")
    if not site.satellite_soil_moisture:
        reasons.append("No satellite soil moisture yet.")
    if not reasons:
        reasons.append("Phase-specific analogs with adequate sample size.")

    return EvidenceCard(
        why=t.rationale,
        evidence=tuple(evidence),
        benefits=tuple(benefits),
        gaps=tuple(gaps),
        risks_for_local_review=t.risks,
        confidence="low" if level == 1 else "medium",
        confidence_reasons=tuple(reasons),
    )
