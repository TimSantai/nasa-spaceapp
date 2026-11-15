"""Field profile endpoints (sync handlers: file reads run in FastAPI's threadpool)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import ValidationError

from app.core.errors import InsufficientDataError, NotFoundError
from app.core.schemas import ApiResponse, ok
from app.data.processed import ProcessedRepository
from app.features.fields.schemas import FieldProfileOut
from app.features.rotations.router import get_repository

router = APIRouter(prefix="/fields", tags=["fields"])
SITE = Query(default="banyumas", pattern=r"^[a-z0-9_]{1,40}$")


def _profiles(repo: ProcessedRepository, site: str) -> list[FieldProfileOut]:
    try:
        return [FieldProfileOut.model_validate(p) for p in repo.load_fields(site)]
    except ValidationError as exc:
        raise InsufficientDataError(
            f"Field profiles for '{site}' do not match the schema; rerun process_fields.py."
        ) from exc


@router.get("", response_model=ApiResponse[list[FieldProfileOut]])
def list_fields(
    site: str = SITE, repo: ProcessedRepository = Depends(get_repository)
) -> ApiResponse[list[FieldProfileOut]]:
    return ok(_profiles(repo, site))


@router.get("/{field_id}", response_model=ApiResponse[FieldProfileOut])
def get_field(
    field_id: str, site: str = SITE, repo: ProcessedRepository = Depends(get_repository)
) -> ApiResponse[FieldProfileOut]:
    for p in _profiles(repo, site):
        if p.id == field_id:
            return ok(p)
    raise NotFoundError(f"Field '{field_id}' not found for site '{site}'.")
