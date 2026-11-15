"""Service layer for /api/v1/fields: load field profiles and sync parcels to PostGIS."""

from __future__ import annotations

import contextlib
import logging
from decimal import Decimal
from typing import Any, cast

from geoalchemy2.elements import WKBElement, WKTElement
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rotation.catalog import SITES
from app.core.errors import InsufficientDataError, NotFoundError
from app.data.processed import ProcessedRepository
from app.db.models import Parcel, ParcelKind, ParcelSoilProperty, Region
from app.features.fields.schemas import FieldProfileOut

logger = logging.getLogger(__name__)

BE_MONTHS = (
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
)
BE_BASE_PATTERN = (0.31, 0.52, 0.74, 0.79, 0.58, 0.36, 0.23, 0.18, 0.21, 0.32, 0.47, 0.66)
BE_YEAR_ANOMALY = (0.00, -0.06, 0.04)
BE_NDVI_NOTE = (
    "HLS NDVI belum tersedia; grafik fenologi sementara memakai simulasi Dataset BE "
    "(3 tahun, pola musiman)."
)


def _phase_from_ndvi(value: float) -> str:
    if value > 0.7:
        return "Reproductive"
    if value >= 0.4:
        return "Vegetative"
    if value >= 0.25:
        return "Land Prep"
    return "Fallow (Bera)"


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _hash_seed(field_id: str) -> int:
    h = 2166136261
    for ch in field_id:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def _build_be_mock_ndvi(field_id: str) -> list[dict[str, Any]]:
    seed = _hash_seed(field_id)
    start_year = 2022
    points: list[dict[str, Any]] = []

    for year_offset, anomaly in enumerate(BE_YEAR_ANOMALY):
        for month_index, month in enumerate(BE_MONTHS):
            base = BE_BASE_PATTERN[month_index]
            field_noise = (((seed + year_offset * 29 + month_index * 13) % 9) - 4) / 100
            ndvi = round(_clamp01(base + anomaly + field_noise), 2)
            year = start_year + year_offset
            points.append(
                {
                    "month": f"{month}-{str(year)[-2:]}",
                    "ndvi": ndvi,
                    "phase": _phase_from_ndvi(ndvi),
                    "observations": 3 + ((seed + year_offset * 17 + month_index * 7) % 6),
                }
            )

    return points


def _hydrate_be_ndvi_fallback(raw_profile: object) -> object:
    if not isinstance(raw_profile, dict):
        return raw_profile

    ndvi_series = raw_profile.get("ndviTimeSeries")
    if isinstance(ndvi_series, list) and ndvi_series:
        return raw_profile

    profile = dict(raw_profile)
    field_id = str(profile.get("id") or "field")
    profile["ndviTimeSeries"] = _build_be_mock_ndvi(field_id)

    availability = profile.get("dataAvailability")
    if isinstance(availability, dict):
        availability_copy = dict(availability)
        notes = availability_copy.get("missingDataNotes")
        note_list = [str(n) for n in notes] if isinstance(notes, list) else []
        if BE_NDVI_NOTE not in note_list:
            note_list.append(BE_NDVI_NOTE)
        availability_copy["missingDataNotes"] = note_list
        profile["dataAvailability"] = availability_copy

    provenance = profile.get("provenance")
    if isinstance(provenance, dict) and not provenance.get("ndvi"):
        provenance_copy = dict(provenance)
        provenance_copy["ndvi"] = "Dataset BE (mock fallback)"
        profile["provenance"] = provenance_copy

    return profile


def load_profiles(repo: ProcessedRepository, site: str) -> list[FieldProfileOut]:
    """Load and validate harmonized field profiles for a site."""
    try:
        raw_profiles = repo.load_fields(site)
        hydrated = [_hydrate_be_ndvi_fallback(p) for p in raw_profiles]
        return [FieldProfileOut.model_validate(p) for p in hydrated]
    except ValidationError as exc:
        raise InsufficientDataError(
            f"Field profiles for '{site}' do not match the schema; rerun process_fields.py."
        ) from exc


def get_profile(repo: ProcessedRepository, site: str, field_id: str) -> FieldProfileOut:
    """Return a single field profile by ID or raise NotFoundError."""
    for p in load_profiles(repo, site):
        if p.id == field_id:
            return p
    raise NotFoundError(f"Field '{field_id}' not found for site '{site}'.")


def _make_multipolygon_wkt(lat: float, lng: float, delta: float = 0.002) -> WKBElement:
    wkt = (
        f"MULTIPOLYGON((({lng - delta:.6f} {lat - delta:.6f}, "
        f"{lng + delta:.6f} {lat - delta:.6f}, "
        f"{lng + delta:.6f} {lat + delta:.6f}, "
        f"{lng - delta:.6f} {lat + delta:.6f}, "
        f"{lng - delta:.6f} {lat - delta:.6f})))"
    )
    return cast(WKBElement, WKTElement(wkt, srid=4326))


def _make_point_wkt(lat: float, lng: float) -> WKBElement:
    return cast(WKBElement, WKTElement(f"POINT({lng:.6f} {lat:.6f})", srid=4326))


async def sync_fields_to_db(
    session: AsyncSession | None,
    site: str,
    profiles: list[FieldProfileOut],
) -> None:
    """Upsert field parcel boundaries and soil properties into PostgreSQL/PostGIS when active."""
    if session is None or not profiles:
        return

    try:
        site_cfg = SITES[site]
        is_us = site == "nevada_mason_valley"
        region = (
            await session.execute(select(Region).where(Region.code == site))
        ).scalar_one_or_none()
        if region is None:
            region = Region(
                code=site,
                name=site_cfg.name,
                country_code="US" if is_us else "ID",
                has_field_data=is_us,
                has_rotation_history=is_us,
            )
            session.add(region)
            await session.flush()

        for p in profiles:
            lat, lng = float(p.coordinates[0]), float(p.coordinates[1])
            erosion = p.soil.erosion_risk.lower()
            if erosion == "moderate":
                erosion = "medium"

            parcel = (
                await session.execute(
                    select(Parcel).where(Parcel.region_id == region.id, Parcel.external_id == p.id)
                )
            ).scalar_one_or_none()
            if parcel is None:
                parcel = Parcel(
                    region_id=region.id,
                    kind=ParcelKind.FIELD_PARCEL,
                    external_id=p.id,
                    name=p.name,
                    boundary=_make_multipolygon_wkt(lat, lng),
                    centroid=_make_point_wkt(lat, lng),
                    area_hectares=Decimal(str(p.area_hectares or 2.0)),
                    slope_mean_deg=Decimal(str(round(p.soil.slope, 2))),
                    erosion_risk=erosion,
                )
                session.add(parcel)
                await session.flush()

            soil_row = (
                await session.execute(
                    select(ParcelSoilProperty).where(ParcelSoilProperty.parcel_id == parcel.id)
                )
            ).scalar_one_or_none()
            if soil_row is None:
                session.add(
                    ParcelSoilProperty(
                        parcel_id=parcel.id,
                        texture_class=p.soil.texture,
                        awc_mm=Decimal(str(round(p.soil.awc, 2))),
                        erosion_class=erosion,
                        source="SSURGO" if is_us else "SoilGrids 250m",
                        resolution_m=30 if is_us else 250,
                    )
                )

        await session.commit()
    except (SQLAlchemyError, OSError, TimeoutError, ValueError) as exc:
        logger.warning("Failed to sync field profiles to database: %s", exc)
        with contextlib.suppress(Exception):
            await session.rollback()
