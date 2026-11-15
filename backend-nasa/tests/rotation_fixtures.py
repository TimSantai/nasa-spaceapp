"""Synthetic processed-data folders for rotation tests (no real downloads needed)."""

from __future__ import annotations

import csv
import json
from pathlib import Path

PHASES = ["el_nino", "la_nina", "neutral"]


def write_site(
    base: Path,
    site: str,
    seasons: dict[str, tuple[float, float]],
    years: int = 18,
    rotation: bool = False,
) -> Path:
    """seasons: name -> (precip_mm, et0_mm). Phases cycle so every phase gets years // 3 years;
    precipitation drops by 20 % in el_nino years."""
    root = base / site
    (root / "climate").mkdir(parents=True, exist_ok=True)
    with (root / "climate" / "season_indicators.csv").open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["season", "planning_year", "precip_mm", "et0_mm", "enso_phase", "iod_phase"])
        for i in range(years):
            phase = PHASES[i % 3]
            for name, (p, et0) in seasons.items():
                factor = 0.8 if phase == "el_nino" else 1.0
                iod = "negative" if i % 2 else "neutral"
                w.writerow([name, 2000 + i, p * factor, et0, phase, iod])
        # one unlabelled row must be ignored
        w.writerow([next(iter(seasons)), 1990, 1, 1, "", ""])
    (root / "climate" / "outlook.json").write_text(
        json.dumps({"enso_phase": "el_nino", "iod_phase": "negative"})
    )
    (root / "terrain").mkdir(exist_ok=True)
    (root / "terrain" / "summary.json").write_text(
        json.dumps({"slope_class_share": {"0-2%": 0.5, "10-15%": 0.1, "15-30%": 0.1, ">30%": 0.05}})
    )
    if rotation:
        (root / "rotation").mkdir(exist_ok=True)
        with (root / "rotation" / "transitions.csv").open("w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["from_code", "to_code", "p_next_given_from"])
            w.writerow(["36", "49", "0.03"])
            w.writerow(["36", "36", "0.8"])
    return root


def write_all(base: Path) -> Path:
    write_site(
        base,
        "nevada_mason_valley",
        {"winter_recharge": (160, 120), "growing": (70, 940)},
        rotation=True,
    )
    write_site(
        base, "banyumas", {"MT1_wet": (1200, 460), "MT2_wet_dry": (800, 400), "MT3_dry": (380, 500)}
    )
    return base


def field_profile(field_id: str = "banyumas-karangrau-01") -> dict[str, object]:
    """One field profile in the camelCase shape written by process_fields.py."""
    return {
        "id": field_id,
        "name": "Plot Karangrau Block 4B",
        "regency": "Banyumas",
        "district": "Banyumas",
        "village": "Karangrau",
        "coordinates": [-7.5186, 109.2942],
        "elevationMeters": 26,
        "areaHectares": 2.4,
        "currentRotation": ["Paddy (Wet Season)", "Paddy (Dry Season 1)", "Fallow"],
        "soil": {
            "type": "SoilGrids 250 m estimate",
            "texture": "Clay Loam",
            "organicMatter": "10.8% (from SOC 63 g/kg)",
            "awc": 142.0,
            "slope": 3.0,
            "erosionRisk": "Low",
        },
        "climateHistory": [
            {
                "month": "Jan",
                "rainfall": 320.0,
                "tempMin": 22.8,
                "tempMax": 28.4,
                "soilMoisture": 0.88,
            }
        ],
        "ndviTimeSeries": [
            {"month": "Jan", "ndvi": 0.75, "phase": "Vegetative", "observations": 4}
        ],
        "dataAvailability": {
            "hasObservedRotation": False,
            "hasFieldSoilSurvey": False,
            "hasSatelliteNdvi": True,
            "hasDailyPrecipitation": True,
            "overallConfidence": "MODERATE",
            "missingDataNotes": ["Current rotation is the team's assumption."],
        },
        "provenance": {
            "elevationSlope": "SRTM",
            "soil": "SoilGrids",
            "climate": "POWER",
            "ndvi": "HLS",
        },
    }


def write_fields(base: Path, site: str = "banyumas", content: object | None = None) -> Path:
    folder = base / site / "fields"
    folder.mkdir(parents=True, exist_ok=True)
    data = [field_profile(), field_profile("banyumas-rawalo-03")] if content is None else content
    (folder / "fields.json").write_text(json.dumps(data))
    return folder
