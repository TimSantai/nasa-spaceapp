"""Climate & NASA data pipeline endpoints (ingestion, zonal harmonization, and JSON export)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi import Path as PathParam
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.schemas import ApiResponse, ok
from app.data.processed import ProcessedRepository
from app.db.session import get_optional_db_session
from app.features.climate import service
from app.features.climate.schemas import (
    ClimateSiteSummaryOut,
    ExportBundleOut,
    IngestRequest,
    IngestResponseOut,
)
from app.features.rotations.router import get_repository
from app.features.rotations.schemas import EnsoPhase

router = APIRouter(prefix="/climate", tags=["climate"])

SITE_PARAM = PathParam(
    pattern=r"^[a-z0-9_]{1,40}$",
    description="Study site key (`banyumas` or `nevada_mason_valley`)",
    examples=["banyumas", "nevada_mason_valley"],
)


@router.post(
    "/ingest",
    response_model=ApiResponse[IngestResponseOut],
    summary="Ingest & harmonize NASA datasets, export JSON, and sync to PostGIS",
    description=(
        "Runs the A2 NASA data ingestion and zonal harmonization pipeline for the requested "
        "site (`banyumas` or `nevada_mason_valley`). Generates harmonized seasonal climate "
        "indicators (`NASA POWER`, `GPM IMERG`, `NOAA ONI/DMI`), SRTM terrain slope shares, "
        "field profiles (`SoilGrids 250m` / `SSURGO` + `HLS 30m NDVI`), and precomputed "
        "`scores.json` with duplicate site-level gaps hoisted out. Also updates "
        "`datasets/manifest.yaml` and pushes `Region`, `DataSource`, and `ClimateYearLabel` "
        "records to PostgreSQL/PostGIS when `DATABASE_URL` is configured."
    ),
    response_description="Ingestion summary, JSON optimization report, and database sync status",
    responses={
        404: {"description": "Unknown study site key"},
        422: {"description": "Request validation failed"},
    },
)
async def ingest_nasa_data(
    req: IngestRequest,
    repo: ProcessedRepository = Depends(get_repository),
    db: AsyncSession | None = Depends(get_optional_db_session),
) -> ApiResponse[IngestResponseOut]:
    settings = get_settings()
    manifest_path = settings.resolve(settings.data_dir) / "manifest.yaml"
    result = await service.run_ingestion(req, repo.base, manifest_path, db)
    return ok(result)


@router.get(
    "/{site}",
    response_model=ApiResponse[ClimateSiteSummaryOut],
    summary="Get harmonized NASA climate indicators and ENSO/IOD summary",
    description=(
        "Returns the harmonized NASA POWER / IMERG seasonal climate indicators, latest "
        "ENSO/IOD phase outlook, SRTM steep-slope share, and per-phase climate averages for "
        "the specified study site. By default `compact=true` omits the raw 1991-2024 row list "
        "so the JSON response stays concise and fast; pass `compact=false` to include every "
        "historical seasonal record."
    ),
    response_description="Harmonized climate summary and optional seasonal time-series records",
    responses={
        404: {"description": "Unknown study site key"},
        422: {"description": "Processed climate data missing for this site"},
    },
)
def get_climate_summary(
    site: str = SITE_PARAM,
    enso_phase: EnsoPhase | None = Query(
        default=None, description="Optional filter by historical ENSO phase"
    ),
    compact: bool = Query(
        default=True,
        description=(
            "If true (default), returns concise phase averages without dumping raw seasonal rows"
        ),
    ),
    repo: ProcessedRepository = Depends(get_repository),
) -> ApiResponse[ClimateSiteSummaryOut]:
    return ok(service.get_site_climate(repo, site, enso_phase=enso_phase, compact=compact))


@router.get(
    "/{site}/export",
    response_model=ApiResponse[ExportBundleOut],
    summary="Export optimized precomputed JSON bundle and payload audit report",
    description=(
        "Generates and returns the optimized JSON export bundle (`scores.json` contract) "
        "across all ENSO phases (`el_nino`, `neutral`, `la_nina`), along with a "
        "`JsonQualityReportOut` showing raw vs optimized byte size, percentage reduction, "
        "and how repeated site-level data gaps were hoisted into `shared_site_gaps`."
    ),
    response_description="Optimized JSON bundle and payload size audit report",
    responses={
        404: {"description": "Unknown study site key"},
        422: {"description": "Processed dataset missing for this site"},
    },
)
def export_climate_and_scores_json(
    site: str = SITE_PARAM,
    repo: ProcessedRepository = Depends(get_repository),
) -> ApiResponse[ExportBundleOut]:
    return ok(service.export_site_bundle(repo, site))
