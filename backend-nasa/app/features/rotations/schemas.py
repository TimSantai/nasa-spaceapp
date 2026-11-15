"""Request and response schemas for /api/v1/rotations."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EnsoPhase = Literal["el_nino", "la_nina", "neutral"]
IodPhase = Literal["positive", "negative", "neutral"]
ParetoStatus = Literal["Optimal", "Tradeoff", "Dominated"]


class Priorities(BaseModel):
    """Farmer priority weights (0.0 to 1.0) across the four sustainability objectives."""

    model_config = ConfigDict(extra="forbid")

    water: float = Field(default=1.0, ge=0, le=1, description="Weight for low irrigation need")
    soil_health: float = Field(
        default=1.0, ge=0, le=1, description="Weight for cover, legume share, and crop diversity"
    )
    erosion: float = Field(default=1.0, ge=0, le=1, description="Weight for low erosion exposure")
    pest_break: float = Field(
        default=0.5, ge=0, le=1, description="Weight for breaking continuous crop family cycles"
    )


class ScenarioIn(BaseModel):
    """What-if climate perturbation applied on top of historical analog years."""

    model_config = ConfigDict(extra="forbid")

    rain_anomaly_pct: float = Field(default=0, ge=-50, le=50, description="Rainfall change, %")
    temp_delta_c: float = Field(default=0, ge=-2, le=4, description="Air temperature change, C")


class CompareRequest(BaseModel):
    """Request payload for comparing crop rotation strategies under climate-conditioned analogs."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "examples": [
                {
                    "site": "banyumas",
                    "field_id": "banyumas-karangrau-01",
                    "enso_phase": "el_nino",
                    "risk_aversion": 0.5,
                    "priorities": {
                        "water": 1.0,
                        "soil_health": 1.0,
                        "erosion": 1.0,
                        "pest_break": 0.5,
                    },
                    "scenario": {"rain_anomaly_pct": 0, "temp_delta_c": 0},
                    "compact": False,
                }
            ]
        },
    )

    site: str = Field(
        pattern=r"^[a-z0-9_]{1,40}$",
        description="Study site identifier (`banyumas` or `nevada_mason_valley`)",
        examples=["banyumas", "nevada_mason_valley"],
    )
    priorities: Priorities = Field(default_factory=Priorities)
    risk_aversion: float = Field(
        default=0.5, ge=0, le=1, description="0 = average years only, 1 = worst 20 % only"
    )
    enso_phase: EnsoPhase | None = Field(default=None, description="Default: latest observed")
    iod_phase: IodPhase | None = Field(default=None, description="Default: latest observed")
    field_id: str | None = Field(
        default=None,
        pattern=r"^[a-z0-9_-]{1,64}$",
        description="Use this field's slope and soil water capacity (from /api/v1/fields)",
    )
    scenario: ScenarioIn = Field(default_factory=ScenarioIn)
    baseline: list[dict[str, str]] | None = Field(
        default=None,
        min_length=1,
        max_length=10,
        description="Farmer's current rotation: one {season: crop} object per year; "
        "seasons left out are fallow. Replaces the default baseline.",
    )
    compact: bool = Field(
        default=False,
        description=(
            "If true, deduplicates shared site-level data gaps from individual strategy cards."
        ),
    )


class SiteInfo(BaseModel):
    """Metadata and available seasons/crops for a harmonized study site."""

    key: str = Field(description="Unique site key")
    name: str = Field(description="Human-readable site name")
    seasons: dict[str, int] = Field(description="Season slot names mapped to duration in months")
    crops: list[str] = Field(description="Supported crop keys in the catalog")
    crop_labels: dict[str, str] = Field(description="Crop keys mapped to display names")
    latest_enso_phase: str = Field(description="Latest observed or outlook ENSO phase")
    latest_iod_phase: str = Field(description="Latest observed or outlook IOD phase")
    sources: list[str] = Field(description="NASA and partner datasets harmonized for this site")


class AnalogsOut(BaseModel):
    """Historical climate analog years selected for evaluation."""

    grouping: str = Field(description="Phase grouping strategy (`enso+iod`, `enso`, `iod`, `all`)")
    phase: str = Field(description="Conditioned climate phase label")
    years: list[int] = Field(description="Historical planning years matching the phase")


class MetricsOut(BaseModel):
    """Physical agronomic and water-balance indicators per rotation year."""

    irrigation_mean_mm: float = Field(description="Mean annual irrigation water demand (mm/yr)")
    irrigation_cvar_mm: float = Field(
        description="CVaR20 irrigation demand in the driest 20% of analog years (mm/yr)"
    )
    cover_share: float = Field(description="Fraction of the year with living crop cover (0-1)")
    legume_share: float = Field(description="Fraction of active crop months with N-fixing legumes")
    families: int = Field(description="Number of distinct botanical crop families in the rotation")
    pest_break_share: float = Field(
        description="Fraction of season transitions where the dominant crop family changes"
    )
    erosion_index: float = Field(
        description="Bare-soil rainfall exposure weighted by RUSLE slope factor S"
    )
    soil_health: float = Field(
        description="Composite soil health heuristic (0-1) from cover, legumes, and diversity"
    )


class ScoreBreakdown100Out(BaseModel):
    """Normalized 0-100 score breakdown ready for UI rendering."""

    water_efficiency: int = Field(
        ge=0, le=100, description="Relative water efficiency score (0-100)"
    )
    soil_health: int = Field(ge=0, le=100, description="Soil health index scaled 0-100")
    cover_days: int = Field(ge=0, le=100, description="Living ground cover percentage (0-100)")
    erosion_control: int = Field(ge=0, le=100, description="Relative erosion control score (0-100)")
    pest_break: int = Field(ge=0, le=100, description="Pest cycle interruption percentage (0-100)")
    overall: int = Field(ge=0, le=100, description="Priority-weighted overall score (0-100)")


class StrategyScores100Out(BaseModel):
    """Mean and worst-case (CVaR20) 0-100 score sets for a strategy."""

    mean: ScoreBreakdown100Out
    worst_case: ScoreBreakdown100Out


class EvidenceCardOut(BaseModel):
    """Transparent decision-support evidence card with NASA provenance and data gaps."""

    why: str = Field(description="Agronomic rationale for this rotation strategy")
    evidence: list[str] = Field(
        description="Quantitative evidence from NASA climate & terrain data"
    )
    benefits: list[str] = Field(description="Improvements relative to the baseline rotation")
    gaps: list[str] = Field(description="Explicitly disclosed information and modeling gaps")
    risks_for_local_review: list[str] = Field(
        description="Checklist items that farmers and local extension officers (PPL) must verify"
    )
    confidence: Literal["low", "medium", "high"] = Field(
        description="Data-availability-aware confidence level"
    )
    confidence_reasons: list[str] = Field(description="Reasons explaining the confidence rating")


class StrategyOut(BaseModel):
    """Evaluated crop rotation strategy with physical metrics, 0-100 scores, and evidence card."""

    key: str = Field(description="Strategy template identifier")
    name: str = Field(description="Human-readable strategy name")
    kind: Literal["baseline", "alternative"] = Field(description="Baseline vs alternative option")
    sequence: list[dict[str, str]] = Field(description="Season-by-season crop sequence per year")
    metrics: MetricsOut
    utilities: dict[str, float] = Field(
        description="Min-max normalized utility per objective (0-1)"
    )
    score: float = Field(description="Weighted multi-objective utility score (0-1)")
    rank: int = Field(ge=1, description="Rank among compared strategies (1 = best)")
    pareto_optimal: bool = Field(description="True if non-dominated on the Pareto frontier")
    pareto_status: ParetoStatus = Field(
        default="Tradeoff",
        description="UI-friendly Pareto classification (`Optimal`, `Tradeoff`, or `Dominated`)",
    )
    scores_100: StrategyScores100Out | None = Field(
        default=None,
        description="Pre-normalized 0-100 scores for mean and worst-case (CVaR20) conditions",
    )
    card: EvidenceCardOut


class FieldContextOut(BaseModel):
    """Field-specific terrain and soil parameters used in the water balance and RUSLE S-factor."""

    field_id: str
    slope_pct: float
    awc_mm_per_m: float


class ScenarioOut(BaseModel):
    """Applied what-if climate anomaly parameters."""

    rain_anomaly_pct: float
    temp_delta_c: float


class ComparisonSummaryOut(BaseModel):
    """Concise executive summary of the rotation comparison for quick inspection."""

    recommended_strategy_key: str = Field(description="Top-ranked strategy key")
    recommended_strategy_name: str = Field(description="Top-ranked strategy name")
    pareto_optimal_count: int = Field(description="Number of non-dominated strategies")
    analog_years_count: int = Field(description="Number of historical climate analog years used")
    water_saved_vs_baseline_mm: float = Field(
        description="Mean irrigation water saved by the top strategy vs baseline (mm/yr)"
    )
    cvar_water_saved_mm: float = Field(
        description=(
            "Worst-case (CVaR20) irrigation water saved by top strategy vs baseline (mm/yr)"
        )
    )
    overall_confidence: Literal["low", "medium", "high"] = Field(
        description="Confidence rating of the top-ranked strategy"
    )


class PersistenceOut(BaseModel):
    """Audit status showing whether the AI comparison was pushed to PostgreSQL/PostGIS."""

    pushed: bool = Field(description="True if records were committed to PostgreSQL/PostGIS")
    status: str = Field(description="Persistence status code (`persisted`, `skipped_no_db`, etc.)")
    records_synced: int = Field(ge=0, description="Number of database rows inserted/updated")
    persisted_at: str | None = Field(
        default=None, description="ISO-8601 UTC timestamp of DB commit"
    )
    detail: str | None = Field(default=None, description="Human-readable persistence diagnostic")


class ComparisonOut(BaseModel):
    """Complete rotation comparison response with ranked strategies, summary, and DB sync status."""

    site: str
    analogs: AnalogsOut
    weights: dict[str, float]
    risk_aversion: float
    strategies: list[StrategyOut]
    field_ctx: FieldContextOut | None = None
    scenario: ScenarioOut
    summary: ComparisonSummaryOut | None = None
    shared_site_gaps: list[str] = Field(
        default_factory=list,
        description="Common site-level data gaps shared across all strategies",
    )
    persistence: PersistenceOut | None = None
    disclaimer: str
