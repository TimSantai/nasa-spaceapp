"""Domain types for the rotation engine (immutable dataclasses)."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class CropProfile:
    key: str
    name: str
    family: str
    kc_mid: float  # FAO-56 Table 12 mid-season crop coefficient
    legume: bool
    perennial: bool
    default_months: float  # typical months of living crop within one season slot


@dataclass(frozen=True)
class Stage:
    """What occupies one season slot in one rotation year."""

    crop: str  # key in CROPS, or "fallow"
    active_months: float
    kc: float | None = None  # override, e.g. dormant alfalfa in winter
    cover_crop: str | None = None  # living cover after the main crop
    cover_months: float = 0.0


@dataclass(frozen=True)
class StrategyTemplate:
    key: str
    name: str
    kind: str  # "baseline" | "alternative"
    years: tuple[dict[str, Stage], ...]
    rationale: str
    evidence_basis: str
    risks: tuple[str, ...]
    gaps: tuple[str, ...]


@dataclass(frozen=True)
class SeasonRecord:
    """Observed climate of one season in one planning year (from NASA POWER)."""

    season: str
    planning_year: int
    precip_mm: float
    et0_mm: float
    enso_phase: str
    iod_phase: str
    tmean_c: float | None = None  # season mean air temperature (for ET0 scenario scaling)


@dataclass(frozen=True)
class Scenario:
    """What-if shift for every analog year: rainfall x (1 + pct/100), temperature + delta."""

    rain_anomaly_pct: float = 0.0
    temp_delta_c: float = 0.0


@dataclass(frozen=True)
class FieldContext:
    """Field-level soil and terrain that change the water balance and erosion exposure."""

    field_id: str
    slope_pct: float
    awc_mm_per_m: float


@dataclass(frozen=True)
class SiteConfig:
    key: str
    name: str
    seasons: dict[str, int]  # season -> length in months
    cold_seasons: frozenset[str]  # seasons where only winter-hardy/perennial crops grow
    use_iod: bool  # IOD matters for Indonesia, not for the US Great Basin


@dataclass(frozen=True)
class SiteData:
    config: SiteConfig
    records: tuple[SeasonRecord, ...]
    latest_enso: str
    latest_iod: str
    steep_share: float  # share of the area with slope > 10 %
    rotation_evidence: dict[str, object] | None  # observed CDL summary (US only)
    sources: tuple[str, ...]
    satellite_soil_moisture: bool = False
    satellite_vegetation: bool = False


@dataclass(frozen=True)
class Analogs:
    grouping: str  # "enso+iod" | "enso" | "iod" | "all"
    phase: str
    years: tuple[int, ...]


@dataclass(frozen=True)
class Metrics:
    irrigation_mean_mm: float  # per rotation year, mean over analog years
    irrigation_cvar_mm: float  # mean of the worst 20 % analog years
    cover_share: float  # months with living cover / all months
    legume_share: float  # legume months / living-crop months
    families: int
    pest_break_share: float  # share of season slots where the dominant family changes (cyclic)
    erosion_index: float  # bare-month share x season rainfall x slope factor, per year
    soil_health: float  # 0-1 heuristic: mean of cover, legume, diversity components


@dataclass(frozen=True)
class EvidenceCard:
    why: str
    evidence: tuple[str, ...]
    benefits: tuple[str, ...]
    gaps: tuple[str, ...]
    risks_for_local_review: tuple[str, ...]
    confidence: str
    confidence_reasons: tuple[str, ...]


@dataclass(frozen=True)
class StrategyResult:
    key: str
    name: str
    kind: str
    sequence: tuple[dict[str, str], ...]
    metrics: Metrics
    utilities: dict[str, float]
    score: float
    rank: int
    pareto_optimal: bool
    card: EvidenceCard


@dataclass(frozen=True)
class Comparison:
    site: str
    analogs: Analogs
    weights: dict[str, float]
    risk_aversion: float
    strategies: tuple[StrategyResult, ...]
    field_ctx: FieldContext | None = None
    scenario: Scenario = field(default_factory=Scenario)
    disclaimer: str = field(
        default=(
            "Decision support only. Results come from historical climate analogs and simple "
            "water and soil indicators; they do not replace farmer judgement or local "
            "agronomic advice."
        )
    )
