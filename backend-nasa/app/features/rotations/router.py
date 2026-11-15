"""Rotation comparison endpoints with AI engine evaluation and automatic database persistence."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.schemas import ApiResponse, ok
from app.data.processed import ProcessedRepository
from app.db.session import get_optional_db_session
from app.features.rotations import service
from app.features.rotations.schemas import CompareRequest, ComparisonOut, SiteInfo

router = APIRouter(prefix="/rotations", tags=["rotations"])


def get_repository() -> ProcessedRepository:
    settings = get_settings()
    return ProcessedRepository(settings.resolve(settings.processed_dir))


@router.get(
    "/sites",
    response_model=ApiResponse[list[SiteInfo]],
    summary="List harmonized study sites and available crops",
    description=(
        "Returns all study sites (`banyumas`, `nevada_mason_valley`) that have harmonized "
        "NASA climate and terrain datasets ready in `PROCESSED_DIR`, including season slots, "
        "crop catalog keys, latest observed ENSO/IOD phases, and provenance sources."
    ),
    response_description="List of harmonized study sites wrapped in ApiResponse",
)
def sites(repo: ProcessedRepository = Depends(get_repository)) -> ApiResponse[list[SiteInfo]]:
    return ok(service.list_sites(repo))


@router.post(
    "/compare",
    response_model=ApiResponse[ComparisonOut],
    summary="Compare crop rotation strategies and persist AI results to PostGIS",
    description=(
        "Evaluates at least three crop rotation strategies (including the baseline rotation) "
        "against historical climate analog years matching the requested ENSO/IOD phase. "
        "Computes mean and worst-20% (CVaR20) irrigation demand, soil health heuristics, "
        "RUSLE slope-adjusted erosion exposure, Pareto dominance, and normalized 0-100 scores. "
        "Whenever a PostgreSQL/PostGIS database session is configured, the AI comparison output "
        "(strategies, sequence items, scenario outcomes, evidence cards, and data gaps) is "
        "automatically upserted into the database."
    ),
    response_description="Ranked crop rotation strategies, executive summary, and DB sync status",
    responses={
        400: {"description": "Invalid domain parameters (e.g., all zero weights or invalid crop)"},
        404: {"description": "Requested site or field_id was not found"},
        422: {"description": "Validation error or missing processed dataset files"},
    },
)
async def compare_rotations(
    req: CompareRequest,
    repo: ProcessedRepository = Depends(get_repository),
    db: AsyncSession | None = Depends(get_optional_db_session),
) -> ApiResponse[ComparisonOut]:
    return ok(await service.run_comparison_and_persist(req, repo, db))
