"""Crop profiles, site definitions and strategy templates.

Crop coefficients are FAO-56 (Allen et al., 1998, Table 12) mid-season values. Triticale has
no FAO-56 entry and uses the small-grain value; chili uses the FAO-56 sweet-pepper value.
Season months are coarse planning values, not phenology models.
"""

from __future__ import annotations

from app.ai.rotation.models import CropProfile, SiteConfig, Stage, StrategyTemplate

KC_BARE = 0.30  # bare-soil evaporation proxy for fallow months
KC_DORMANT = 0.40  # dormant perennial / overwintering cereal (FAO-56 Kc_ini order)

CROPS: dict[str, CropProfile] = {
    c.key: c
    for c in (
        CropProfile("alfalfa", "Alfalfa", "legume_forage", 0.95, True, True, 12),
        CropProfile("winter_wheat", "Winter wheat", "small_grain", 1.15, False, False, 3.5),
        CropProfile("triticale", "Triticale", "small_grain", 1.15, False, False, 3.5),
        CropProfile("corn", "Corn (maize)", "maize", 1.20, False, False, 5),
        CropProfile("onion", "Onion (dry)", "allium", 1.05, False, False, 5),
        CropProfile("clover", "Clover cover crop", "legume_forage", 0.90, True, False, 4),
        CropProfile("rice", "Rice (paddy)", "rice", 1.20, False, False, 4),
        CropProfile("soybean", "Soybean", "legume_grain", 1.15, True, False, 3),
        CropProfile("groundnut", "Groundnut", "legume_grain", 1.15, True, False, 3.5),
        CropProfile("maize", "Maize", "maize", 1.20, False, False, 4),
        CropProfile("chili", "Chili pepper", "solanaceae", 1.05, False, False, 4),
        CropProfile("tomato", "Tomato", "solanaceae", 1.15, False, False, 4),
    )
}
WINTER_CEREALS = frozenset({"winter_wheat", "triticale"})

SITES: dict[str, SiteConfig] = {
    "nevada_mason_valley": SiteConfig(
        key="nevada_mason_valley",
        name="Mason Valley, Lyon County, Nevada (US pilot)",
        seasons={"winter_recharge": 5, "growing": 6},
        cold_seasons=frozenset({"winter_recharge"}),
        use_iod=False,
    ),
    "banyumas": SiteConfig(
        key="banyumas",
        name="Banyumas, Central Java (Indonesia demo)",
        seasons={"MT1_wet": 4, "MT2_wet_dry": 4, "MT3_dry": 4},
        cold_seasons=frozenset(),
        use_iod=True,
    ),
}


def default_stage(site: SiteConfig, season: str, crop: str) -> Stage:
    """Stage for `crop` in `season` using catalogue defaults; raises ValueError if impossible."""
    if season not in site.seasons:
        raise ValueError(f"unknown season '{season}' for {site.key}")
    months = site.seasons[season]
    if crop == "fallow":
        return Stage("fallow", 0.0)
    if crop not in CROPS:
        raise ValueError(f"unknown crop '{crop}'")
    profile = CROPS[crop]
    cold = season in site.cold_seasons
    if profile.perennial:
        return Stage(crop, float(months), kc=KC_DORMANT if cold else None)
    if crop in WINTER_CEREALS and site.cold_seasons:
        return Stage(crop, float(months), kc=KC_DORMANT) if cold else Stage(crop, 3.5)
    if cold:
        raise ValueError(f"{profile.name} cannot grow in the cold season '{season}'")
    return Stage(crop, float(min(months, profile.default_months)))


def build_years(site: SiteConfig, plan: list[dict[str, str]]) -> tuple[dict[str, Stage], ...]:
    """Turn [{season: crop}, ...] into stages; seasons left out are fallow."""
    years = []
    for year in plan:
        unknown = set(year) - set(site.seasons)
        if unknown:
            raise ValueError(f"unknown season(s) {sorted(unknown)} for {site.key}")
        years.append({s: default_stage(site, s, year.get(s, "fallow")) for s in site.seasons})
    return tuple(years)


def _nv(plan: list[dict[str, str]]) -> tuple[dict[str, Stage], ...]:
    return build_years(SITES["nevada_mason_valley"], plan)


def _id(plan: list[dict[str, str]]) -> tuple[dict[str, Stage], ...]:
    return build_years(SITES["banyumas"], plan)


ALF = {"winter_recharge": "alfalfa", "growing": "alfalfa"}
WHEAT = {"winter_recharge": "winter_wheat", "growing": "winter_wheat"}
TRIT = {"winter_recharge": "triticale", "growing": "triticale"}

_wheat_then_clover = dict(_nv([WHEAT])[0])
_wheat_then_clover["growing"] = Stage("winter_wheat", 3.5, cover_crop="clover", cover_months=2.5)

TEMPLATES: dict[str, tuple[StrategyTemplate, ...]] = {
    "nevada_mason_valley": (
        StrategyTemplate(
            key="nv_baseline_alfalfa",
            name="Current: long alfalfa stand with an onion break",
            kind="baseline",
            years=_nv([ALF] * 5 + [{"growing": "onion"}]),
            rationale=(
                "Approximates the rotation observed in USDA CDL 2016-2023: alfalfa stays "
                "alfalfa most years and is broken by onions, hay, corn or small grains."
            ),
            evidence_basis="cdl",
            risks=("Onion break is the highest-water year of the cycle.",),
            gaps=("Field-level stand ages are approximated from pixel transitions.",),
        ),
        StrategyTemplate(
            key="nv_short_stand_small_grains",
            name="Shorter alfalfa stand + winter small grains (water saver)",
            kind="alternative",
            years=_nv([ALF] * 3 + [WHEAT, TRIT]),
            rationale=(
                "Winter wheat and triticale grow mostly on winter moisture and are harvested by "
                "mid-July, cutting late-summer irrigation compared with alfalfa or onions."
            ),
            evidence_basis="climate",
            risks=(
                "Lower forage revenue than alfalfa; check local hay and grain prices.",
                "Needs equipment and timing for fall seeding.",
            ),
            gaps=("Yield response to deficit irrigation is not modelled.",),
        ),
        StrategyTemplate(
            key="nv_alfalfa_wheat_clover",
            name="Alfalfa + winter wheat with clover cover (soil health)",
            kind="alternative",
            years=(*_nv([ALF] * 4), _wheat_then_clover),
            rationale=(
                "Keeps living roots after the wheat harvest with a legume cover, adding nitrogen "
                "and protecting soil before alfalfa is re-seeded."
            ),
            evidence_basis="climate",
            risks=(
                "Cover crop uses irrigation water in late summer.",
                "Clover establishment after harvest depends on water availability.",
            ),
            gaps=("Nitrogen credit and organic-matter gain are not quantified.",),
        ),
    ),
    "banyumas": (
        StrategyTemplate(
            key="id_baseline_rice_rice_fallow",
            name="Assumed current: rice - rice - dry-season fallow",
            kind="baseline",
            years=_id([{"MT1_wet": "rice", "MT2_wet_dry": "rice"}]),
            rationale=(
                "Common irrigated-lowland pattern used as a placeholder; replace it with the "
                "farmer's own rotation (no satellite crop map is used for Indonesia)."
            ),
            evidence_basis="assumed",
            risks=("Bare dry season leaves soil exposed and earns no income.",),
            gaps=("Baseline is an assumption until the farmer enters the actual rotation.",),
        ),
        StrategyTemplate(
            key="id_rice_rice_soybean",
            name="Rice - rice - soybean in the dry season",
            kind="alternative",
            years=_id([{"MT1_wet": "rice", "MT2_wet_dry": "rice", "MT3_dry": "soybean"}]),
            rationale=(
                "A short legume in the dry season adds cover, nitrogen and income, and breaks "
                "the rice pest cycle."
            ),
            evidence_basis="climate",
            risks=("Dry-season water may not be enough in dry analog years.",),
            gaps=("Paddy percolation and puddling are not modelled.",),
        ),
        StrategyTemplate(
            key="id_rice_maize_groundnut",
            name="Rice - maize - groundnut (diversified)",
            kind="alternative",
            years=_id([{"MT1_wet": "rice", "MT2_wet_dry": "maize", "MT3_dry": "groundnut"}]),
            rationale=(
                "Replaces the second rice crop with maize and adds groundnut, lowering paddy "
                "water use and diversifying crop families."
            ),
            evidence_basis="climate",
            risks=(
                "Maize and groundnut need well-drained fields; check drainage locally.",
                "Market access for maize and groundnut must be confirmed.",
            ),
            gaps=("Soil drainage class is not available for Banyumas at field scale.",),
        ),
    ),
}
