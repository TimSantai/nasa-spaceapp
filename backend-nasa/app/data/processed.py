"""Read-only access to derived products written by fieldshift-data-kit (data/processed/<site>).

Files used per site:
  climate/season_indicators.csv  climate/outlook.json  terrain/summary.json
  rotation/summary.json + rotation/transitions.csv (US site only)
  fields/fields.json (demo field profiles, written by process_fields.py)
Folders appeears/smap and appeears/ndvi (when added) switch on the satellite flags.
"""

from __future__ import annotations

import csv
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.ai.rotation.catalog import SITES
from app.ai.rotation.models import SeasonRecord, SiteData
from app.core.errors import InsufficientDataError, NotFoundError

STEEP_CLASSES = ("10-15%", "15-30%", ">30%")
ALFALFA = "36"


class ProcessedRepository:
    def __init__(self, base: Path) -> None:
        self.base = base

    def available_sites(self) -> list[str]:
        return [k for k in SITES if (self.base / k / "climate" / "season_indicators.csv").is_file()]

    def load_fields(self, site: str) -> list[dict[str, Any]]:
        """Raw field-profile dicts for a site (validated by the API schema)."""
        if site not in SITES:
            raise NotFoundError(f"Unknown site '{site}'.")
        path = self.base / site / "fields" / "fields.json"
        if not path.is_file():
            raise InsufficientDataError(
                f"No field profiles for '{site}'. Run process_fields.py in the data kit."
            )
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise InsufficientDataError(f"Field profile file for '{site}' is not a list.")
        return data

    def load(self, site: str) -> SiteData:
        if site not in SITES:
            raise NotFoundError(f"Unknown site '{site}'.")
        return _load_cached(str(self.base), site)


@lru_cache(maxsize=16)
def _load_cached(base: str, site: str) -> SiteData:
    root = Path(base) / site
    climate = root / "climate" / "season_indicators.csv"
    if not climate.is_file():
        raise InsufficientDataError(
            f"No processed climate data for '{site}'. Run process_climate.py in the data kit."
        )
    records = []
    with climate.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if not row.get("enso_phase"):
                continue
            records.append(
                SeasonRecord(
                    season=row["season"],
                    planning_year=int(row["planning_year"]),
                    precip_mm=float(row["precip_mm"]),
                    et0_mm=float(row["et0_mm"]),
                    enso_phase=row["enso_phase"],
                    iod_phase=row["iod_phase"],
                    tmean_c=float(row["tmean_c"]) if row.get("tmean_c") else None,
                )
            )
    if not records:
        raise InsufficientDataError(f"Climate table for '{site}' has no labelled seasons.")
    latest_year = max(r.planning_year for r in records)
    latest = next(r for r in records if r.planning_year == latest_year)
    enso, iod = latest.enso_phase, latest.iod_phase
    outlook = root / "climate" / "outlook.json"
    if outlook.is_file():
        o = json.loads(outlook.read_text(encoding="utf-8"))
        enso, iod = str(o.get("enso_phase", enso)), str(o.get("iod_phase", iod))

    steep = 0.0
    terrain = root / "terrain" / "summary.json"
    sources = ["NASA POWER daily (1991-2025)", "NOAA ONI / DMI"]
    if terrain.is_file():
        shares = json.loads(terrain.read_text(encoding="utf-8")).get("slope_class_share", {})
        steep = float(sum(float(shares.get(k, 0.0)) for k in STEEP_CLASSES))
        sources.append("SRTM 1 arc-second")

    rotation: dict[str, object] | None = None
    trans = root / "rotation" / "transitions.csv"
    if trans.is_file():
        with trans.open(newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["from_code"] == ALFALFA and row["to_code"] == ALFALFA:
                    rotation = {"p_alfalfa_stays": float(row["p_next_given_from"])}
                    break
        sources.append("USDA CDL 2016-2023")

    return SiteData(
        config=SITES[site],
        records=tuple(records),
        latest_enso=enso,
        latest_iod=iod,
        steep_share=round(steep, 4),
        rotation_evidence=rotation,
        sources=tuple(sources),
        satellite_soil_moisture=(root / "appeears" / "smap").is_dir(),
        satellite_vegetation=(root / "appeears" / "ndvi").is_dir(),
    )


def clear_cache() -> None:
    _load_cached.cache_clear()
