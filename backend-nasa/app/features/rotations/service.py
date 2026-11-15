"""Glue between the API schemas, the processed-data repository and the rotation engine."""

from __future__ import annotations

from dataclasses import asdict, replace

from app.ai.rotation.catalog import CROPS, SITES, TEMPLATES, build_years
from app.ai.rotation.engine import compare
from app.ai.rotation.models import FieldContext, Scenario
from app.core.errors import DomainError, NotFoundError
from app.data.processed import ProcessedRepository
from app.features.rotations.schemas import CompareRequest, ComparisonOut, SiteInfo


def list_sites(repo: ProcessedRepository) -> list[SiteInfo]:
    out = []
    for key in repo.available_sites():
        data = repo.load(key)
        out.append(
            SiteInfo(
                key=key,
                name=SITES[key].name,
                seasons=dict(SITES[key].seasons),
                crops=sorted(CROPS),
                latest_enso_phase=data.latest_enso,
                latest_iod_phase=data.latest_iod,
                sources=list(data.sources),
            )
        )
    return out


def run_comparison(req: CompareRequest, repo: ProcessedRepository) -> ComparisonOut:
    site = repo.load(req.site)
    templates = list(TEMPLATES[req.site])
    if req.baseline is not None:
        try:
            years = build_years(SITES[req.site], req.baseline)
        except ValueError as exc:
            raise DomainError(str(exc)) from exc
        templates[0] = replace(
            templates[0],
            key="farmer_baseline",
            name="Current rotation (entered by the farmer)",
            years=years,
            rationale="The rotation the farmer reports using now.",
            evidence_basis="farmer",
            gaps=("Rotation entered by the farmer; not checked against satellite data.",),
        )
    field = _field_context(repo, req.site, req.field_id) if req.field_id else None
    scenario = Scenario(req.scenario.rain_anomaly_pct, req.scenario.temp_delta_c)
    try:
        result = compare(
            site,
            templates,
            weights=req.priorities.model_dump(),
            risk_aversion=req.risk_aversion,
            enso=req.enso_phase,
            iod=req.iod_phase,
            field=field,
            scenario=scenario,
        )
    except ValueError as exc:
        raise DomainError(str(exc)) from exc
    return ComparisonOut.model_validate(asdict(result))


def _field_context(repo: ProcessedRepository, site: str, field_id: str) -> FieldContext:
    for f in repo.load_fields(site):
        if f.get("id") == field_id:
            soil = f.get("soil") or {}
            try:
                return FieldContext(field_id, float(soil["slope"]), float(soil["awc"]))
            except (KeyError, TypeError, ValueError) as exc:
                raise DomainError(f"Field '{field_id}' lacks slope or AWC.") from exc
    raise NotFoundError(f"Field '{field_id}' not found for site '{site}'.")
