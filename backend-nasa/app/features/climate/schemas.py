"""Schemas for /api/v1/climate: NASA data ingestion, zonal harmonization, and JSON export."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.features.rotations.schemas import EnsoPhase, PersistenceOut


class IngestRequest(BaseModel):
    """Request body to run NASA dataset ingestion and zonal harmonization for a site."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "examples": [
                {
                    "site": "banyumas",
                    "enable_satellite_flags": True,
                    "update_manifest": True,
                }
            ]
        },
    )

    site: str = Field(
        default="banyumas",
        pattern=r"^[a-z0-9_]{1,40}$",
        description="Target study site (`banyumas` or `nevada_mason_valley`)",
        examples=["banyumas", "nevada_mason_valley"],
    )
    enable_satellite_flags: bool = Field(
        default=True,
        description="Switch on AppEEARS SMAP soil moisture and HLS NDVI availability flags",
    )
    update_manifest: bool = Field(
        default=True,
        description="Append provenance record to datasets/manifest.yaml",
    )


class JsonQualityReportOut(BaseModel):
    """Diagnostic report auditing whether exported JSON is overly large and how it was optimized."""

    model_config = ConfigDict(frozen=True)

    site: str
    raw_bytes: int = Field(ge=0, description="Unoptimized JSON byte size")
    optimized_bytes: int = Field(ge=0, description="Optimized & deduplicated JSON byte size")
    reduction_pct: float = Field(description="Percentage payload size reduction")
    total_strategies: int = Field(ge=0)
    total_fields: int = Field(ge=0)
    duplicate_gaps_removed: int = Field(
        ge=0, description="Repeated site-level gap strings hoisted out of individual strategy cards"
    )
    float_precision_digits: int = Field(default=3)
    status: Literal["optimized", "raw"] = "optimized"
    recommendations: list[str]


class IngestResponseOut(BaseModel):
    """Summary returned after NASA dataset ingestion, harmonization, JSON export, and DB sync."""

    model_config = ConfigDict(frozen=True)

    site: str
    seasons_written: int = Field(ge=0, description="Number of seasonal climate rows written")
    fields_written: int = Field(ge=0, description="Number of harmonized field profiles written")
    files_generated: list[str] = Field(description="Relative paths written under PROCESSED_DIR")
    manifest_updated: bool = Field(description="True if datasets/manifest.yaml was updated")
    json_report: JsonQualityReportOut
    persistence: PersistenceOut


class SeasonIndicatorOut(BaseModel):
    """One harmonized seasonal climate record (NASA POWER + GPM IMERG + NOAA ONI/DMI)."""

    model_config = ConfigDict(frozen=True)

    season: str
    planning_year: int
    precip_mm: float
    et0_mm: float
    enso_phase: str
    iod_phase: str
    tmean_c: float | None = None


class SeasonPhaseSummaryOut(BaseModel):
    """Aggregated seasonal climate summary per ENSO phase (keeps JSON concise)."""

    model_config = ConfigDict(frozen=True)

    enso_phase: str
    sample_years: int
    mean_precip_mm: float
    mean_et0_mm: float
    mean_temp_c: float | None = None


class ClimateSiteSummaryOut(BaseModel):
    """Harmonized NASA climate, ENSO/IOD outlook, and SRTM terrain summary for a site."""

    model_config = ConfigDict(frozen=True)

    site: str
    name: str
    latest_enso_phase: str
    latest_iod_phase: str
    steep_slope_share: float = Field(description="Share of site area with SRTM slope > 10%")
    satellite_soil_moisture: bool
    satellite_vegetation: bool
    sources: list[str]
    total_seasonal_records: int
    phase_summaries: list[SeasonPhaseSummaryOut] = Field(
        description="Concise per-phase averages so consumers do not need to parse all raw rows"
    )
    records: list[SeasonIndicatorOut] = Field(
        default_factory=list,
        description="Seasonal records (omitted when compact=true to keep JSON small)",
    )


class ExportBundleOut(BaseModel):
    """Exported precomputed JSON bundle (`scores.json`) with payload quality diagnostics."""

    model_config = ConfigDict(frozen=True)

    schema_version: str = "1.1.0"
    site: str
    generated_at: str
    shared_site_gaps: list[str]
    fields_count: int
    json_report: JsonQualityReportOut
    comparisons: dict[EnsoPhase | str, dict[str, Any]]
