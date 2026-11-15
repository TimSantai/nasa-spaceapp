"""Field profile endpoints with camelCase serialization and PostGIS parcel sync."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi import Path as PathParam
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.schemas import ApiResponse, ok
from app.data.processed import ProcessedRepository
from app.db.session import get_optional_db_session
from app.features.fields import service
from app.features.fields.schemas import FieldProfileOut
from app.features.rotations.router import get_repository

router = APIRouter(prefix="/fields", tags=["fields"])
SITE = Query(
    default="banyumas",
    pattern=r"^[a-z0-9_]{1,40}$",
    description="Study site identifier (`banyumas` or `nevada_mason_valley`)",
)


@router.get(
    "",
    response_model=ApiResponse[list[FieldProfileOut]],
    summary="List agricultural field profiles for a study site",
    description=(
        "Returns all harmonized agricultural field profiles (`fields.json`) for the given "
        "study site, serialized in `camelCase` to match `FieldProfile` in the React frontend. "
        "Includes SRTM elevation/slope, SoilGrids/SSURGO soil properties, 12-month NASA POWER "
        "climate normals, HLS 30m NDVI phenology time-series, and explicit data-availability "
        "confidence disclosure. Automatically syncs parcel geometries to PostGIS when active."
    ),
    response_description="List of field profiles in camelCase",
    responses={
        404: {"description": "Unknown study site key"},
        422: {"description": "Missing or invalid field profile dataset"},
    },
)
async def list_fields(
    site: str = SITE,
    repo: ProcessedRepository = Depends(get_repository),
    db: AsyncSession | None = Depends(get_optional_db_session),
) -> ApiResponse[list[FieldProfileOut]]:
    profiles = service.load_profiles(repo, site)
    await service.sync_fields_to_db(db, site, profiles)
    return ok(profiles)


@router.get(
    "/{field_id}",
    response_model=ApiResponse[FieldProfileOut],
    summary="Get a single agricultural field profile by ID",
    description=(
        "Returns one harmonized field profile (`FieldProfileOut`) by its unique `field_id` "
        "(e.g., `banyumas-karangrau-01`, `banyumas-sumbang-02`, `banyumas-rawalo-03`) "
        "and syncs its parcel boundary and soil record to PostGIS when active."
    ),
    response_description="Single field profile in camelCase",
    responses={
        404: {"description": "Site or field_id was not found"},
        422: {"description": "Missing or invalid field profile dataset"},
    },
)
async def get_field(
    field_id: str = PathParam(
        description="Unique field identifier (e.g. `banyumas-karangrau-01`)",
        examples=["banyumas-karangrau-01"],
    ),
    site: str = SITE,
    repo: ProcessedRepository = Depends(get_repository),
    db: AsyncSession | None = Depends(get_optional_db_session),
) -> ApiResponse[FieldProfileOut]:
    profile = service.get_profile(repo, site, field_id)
    await service.sync_fields_to_db(db, site, [profile])
    return ok(profile)
