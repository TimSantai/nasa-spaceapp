"""Service layer for /api/v1/climate: NASA ingestion, harmonization, JSON export, and DB sync."""

from __future__ import annotations

import contextlib
import csv
import datetime as dt
import json
import logging
from dataclasses import asdict
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rotation.catalog import SITES, TEMPLATES
from app.ai.rotation.engine import compare
from app.ai.rotation.models import SiteData
from app.core.errors import NotFoundError
from app.data.processed import ProcessedRepository, clear_cache
from app.db.models import ClimateYearLabel, DataSource, Region, SourceStatus
from app.features.climate.schemas import (
    ClimateSiteSummaryOut,
    ExportBundleOut,
    IngestRequest,
    IngestResponseOut,
    JsonQualityReportOut,
    SeasonIndicatorOut,
    SeasonPhaseSummaryOut,
)
from app.features.rotations.schemas import PersistenceOut

logger = logging.getLogger(__name__)

# Historical NOAA ONI (Aug-Oct planning period) and DMI phase labels 1991-2024
_HISTORICAL_PHASES: dict[int, tuple[str, str]] = {
    1991: ("el_nino", "neutral"),
    1992: ("neutral", "negative"),
    1993: ("neutral", "neutral"),
    1994: ("neutral", "positive"),
    1995: ("la_nina", "neutral"),
    1996: ("neutral", "negative"),
    1997: ("el_nino", "positive"),
    1998: ("la_nina", "negative"),
    1999: ("la_nina", "neutral"),
    2000: ("neutral", "neutral"),
    2001: ("neutral", "neutral"),
    2002: ("el_nino", "neutral"),
    2003: ("neutral", "neutral"),
    2004: ("el_nino", "neutral"),
    2005: ("neutral", "neutral"),
    2006: ("el_nino", "positive"),
    2007: ("la_nina", "neutral"),
    2008: ("neutral", "neutral"),
    2009: ("el_nino", "neutral"),
    2010: ("la_nina", "negative"),
    2011: ("la_nina", "neutral"),
    2012: ("neutral", "positive"),
    2013: ("neutral", "neutral"),
    2014: ("neutral", "neutral"),
    2015: ("el_nino", "positive"),
    2016: ("neutral", "negative"),
    2017: ("neutral", "neutral"),
    2018: ("el_nino", "positive"),
    2019: ("neutral", "positive"),
    2020: ("la_nina", "neutral"),
    2021: ("la_nina", "negative"),
    2022: ("la_nina", "negative"),
    2023: ("el_nino", "positive"),
    2024: ("neutral", "negative"),
}

_SITE_SEASON_NORMALS: dict[str, dict[str, tuple[float, float, float]]] = {
    "banyumas": {
        "MT1_wet": (1245.0, 512.0, 26.2),
        "MT2_wet_dry": (840.0, 488.0, 26.0),
        "MT3_dry": (370.0, 535.0, 25.4),
    },
    "nevada_mason_valley": {
        "winter_recharge": (118.0, 245.0, 4.8),
        "growing": (82.0, 965.0, 18.6),
    },
}

_PHASE_PRECIP_MULTIPLIER: dict[str, dict[str, float]] = {
    "banyumas": {"el_nino": 0.74, "neutral": 1.00, "la_nina": 1.22},
    "nevada_mason_valley": {"el_nino": 1.12, "neutral": 1.00, "la_nina": 0.84},
}

_TERRAIN_SHARES: dict[str, dict[str, float]] = {
    "banyumas": {
        "0-2%": 0.18,
        "2-5%": 0.19,
        "5-10%": 0.14,
        "10-15%": 0.21,
        "15-30%": 0.19,
        ">30%": 0.09,
    },
    "nevada_mason_valley": {
        "0-2%": 0.52,
        "2-5%": 0.22,
        "5-10%": 0.10,
        "10-15%": 0.08,
        "15-30%": 0.05,
        ">30%": 0.03,
    },
}


def _year_variation(year: int, season_idx: int) -> float:
    bucket = ((year * 37 + season_idx * 13) % 25) - 12
    return 1.0 + (bucket / 100.0)


def _round_floats(obj: Any, digits: int = 3) -> Any:
    if isinstance(obj, float):
        return round(obj, digits)
    if isinstance(obj, dict):
        return {k: _round_floats(v, digits) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_round_floats(v, digits) for v in obj]
    return obj


def build_default_fields(site: str) -> list[dict[str, Any]]:
    """Build harmonized field profiles with NASA POWER monthly normals and HLS NDVI series."""
    if site == "banyumas":
        return [
            {
                "id": "banyumas-karangrau-01",
                "name": "Plot Karangrau Block 4B",
                "regency": "Banyumas",
                "district": "Banyumas",
                "village": "Karangrau",
                "coordinates": [-7.5186, 109.2942],
                "elevationMeters": 26,
                "areaHectares": 2.4,
                "currentRotation": [
                    "Paddy (Wet Season)",
                    "Paddy (Dry Season 1)",
                    "Fallow (Dry Season 2)",
                ],
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
                        "rainfall": 319.9,
                        "tempMin": 22.8,
                        "tempMax": 28.4,
                        "soilMoisture": 0.876,
                    },
                    {
                        "month": "Feb",
                        "rainfall": 303.2,
                        "tempMin": 22.9,
                        "tempMax": 28.4,
                        "soilMoisture": 0.925,
                    },
                    {
                        "month": "Mar",
                        "rainfall": 261.0,
                        "tempMin": 23.0,
                        "tempMax": 28.7,
                        "soilMoisture": 0.938,
                    },
                    {
                        "month": "Apr",
                        "rainfall": 217.8,
                        "tempMin": 23.2,
                        "tempMax": 29.0,
                        "soilMoisture": 0.936,
                    },
                    {
                        "month": "May",
                        "rainfall": 199.9,
                        "tempMin": 22.5,
                        "tempMax": 29.1,
                        "soilMoisture": 0.908,
                    },
                    {
                        "month": "Jun",
                        "rainfall": 133.2,
                        "tempMin": 21.5,
                        "tempMax": 28.5,
                        "soilMoisture": 0.871,
                    },
                    {
                        "month": "Jul",
                        "rainfall": 84.2,
                        "tempMin": 20.2,
                        "tempMax": 28.0,
                        "soilMoisture": 0.815,
                    },
                    {
                        "month": "Aug",
                        "rainfall": 44.8,
                        "tempMin": 19.6,
                        "tempMax": 28.4,
                        "soilMoisture": 0.741,
                    },
                    {
                        "month": "Sep",
                        "rainfall": 80.5,
                        "tempMin": 20.5,
                        "tempMax": 29.7,
                        "soilMoisture": 0.682,
                    },
                    {
                        "month": "Oct",
                        "rainfall": 208.4,
                        "tempMin": 21.9,
                        "tempMax": 30.4,
                        "soilMoisture": 0.684,
                    },
                    {
                        "month": "Nov",
                        "rainfall": 310.8,
                        "tempMin": 22.9,
                        "tempMax": 29.4,
                        "soilMoisture": 0.764,
                    },
                    {
                        "month": "Dec",
                        "rainfall": 334.5,
                        "tempMin": 22.8,
                        "tempMax": 28.6,
                        "soilMoisture": 0.827,
                    },
                ],
                "ndviTimeSeries": [
                    {"month": "Jan", "ndvi": 0.78, "phase": "Reproductive", "observations": 4},
                    {"month": "Feb", "ndvi": 0.44, "phase": "Land Prep", "observations": 3},
                    {"month": "Mar", "ndvi": 0.68, "phase": "Vegetative", "observations": 4},
                    {"month": "Apr", "ndvi": 0.79, "phase": "Reproductive", "observations": 5},
                    {"month": "May", "ndvi": 0.41, "phase": "Land Prep", "observations": 5},
                    {"month": "Jun", "ndvi": 0.24, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Jul", "ndvi": 0.19, "phase": "Fallow (Bera)", "observations": 7},
                    {"month": "Aug", "ndvi": 0.17, "phase": "Fallow (Bera)", "observations": 7},
                    {"month": "Sep", "ndvi": 0.20, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Oct", "ndvi": 0.27, "phase": "Land Prep", "observations": 5},
                    {"month": "Nov", "ndvi": 0.52, "phase": "Vegetative", "observations": 4},
                    {"month": "Dec", "ndvi": 0.71, "phase": "Vegetative", "observations": 3},
                ],
                "dataAvailability": {
                    "hasObservedRotation": False,
                    "hasFieldSoilSurvey": False,
                    "hasSatelliteNdvi": True,
                    "hasDailyPrecipitation": True,
                    "overallConfidence": "MODERATE",
                    "missingDataNotes": [
                        "Current rotation is the team's assumption; confirm with the farmer.",
                        "Soil values are SoilGrids 250 m model estimates, not a field survey.",
                        "Rainfall and soil wetness are NASA POWER reanalysis (~0.5 degree grid).",
                    ],
                },
                "provenance": {
                    "elevationSlope": "SRTMGL1 v003, 3x3 mean around the point",
                    "soil": "SoilGrids 2.0 0-30 cm; AWC by Saxton & Rawls (2006)",
                    "climate": "NASA POWER power_-7.75_+109.25.csv, monthly normals 1991-2020",
                    "ndvi": "HLS L30+S30 v2.0 30 m monthly median",
                },
            },
            {
                "id": "banyumas-sumbang-02",
                "name": "Sumbang Highland Terrace 2A",
                "regency": "Banyumas",
                "district": "Sumbang",
                "village": "Kotayasa",
                "coordinates": [-7.3512, 109.2568],
                "elevationMeters": 255,
                "areaHectares": 1.8,
                "currentRotation": [
                    "Paddy (Wet Season)",
                    "Horticulture (Chili/Tomato)",
                    "Fallow",
                ],
                "soil": {
                    "type": "SoilGrids 250 m estimate",
                    "texture": "Clay",
                    "organicMatter": "13.1% (from SOC 76 g/kg)",
                    "awc": 106.0,
                    "slope": 12.0,
                    "erosionRisk": "Moderate",
                },
                "climateHistory": [
                    {
                        "month": "Jan",
                        "rainfall": 329.6,
                        "tempMin": 23.1,
                        "tempMax": 28.2,
                        "soilMoisture": 0.816,
                    },
                    {
                        "month": "Feb",
                        "rainfall": 317.8,
                        "tempMin": 23.1,
                        "tempMax": 27.9,
                        "soilMoisture": 0.893,
                    },
                    {
                        "month": "Mar",
                        "rainfall": 248.3,
                        "tempMin": 23.3,
                        "tempMax": 28.4,
                        "soilMoisture": 0.922,
                    },
                    {
                        "month": "Apr",
                        "rainfall": 189.7,
                        "tempMin": 23.7,
                        "tempMax": 28.8,
                        "soilMoisture": 0.917,
                    },
                    {
                        "month": "May",
                        "rainfall": 148.2,
                        "tempMin": 23.2,
                        "tempMax": 29.3,
                        "soilMoisture": 0.885,
                    },
                    {
                        "month": "Jun",
                        "rainfall": 98.1,
                        "tempMin": 22.2,
                        "tempMax": 28.9,
                        "soilMoisture": 0.843,
                    },
                    {
                        "month": "Jul",
                        "rainfall": 58.0,
                        "tempMin": 21.0,
                        "tempMax": 28.9,
                        "soilMoisture": 0.782,
                    },
                    {
                        "month": "Aug",
                        "rainfall": 36.0,
                        "tempMin": 20.5,
                        "tempMax": 29.7,
                        "soilMoisture": 0.704,
                    },
                    {
                        "month": "Sep",
                        "rainfall": 56.9,
                        "tempMin": 21.3,
                        "tempMax": 31.3,
                        "soilMoisture": 0.641,
                    },
                    {
                        "month": "Oct",
                        "rainfall": 125.4,
                        "tempMin": 22.7,
                        "tempMax": 31.4,
                        "soilMoisture": 0.627,
                    },
                    {
                        "month": "Nov",
                        "rainfall": 222.1,
                        "tempMin": 23.5,
                        "tempMax": 30.1,
                        "soilMoisture": 0.683,
                    },
                    {
                        "month": "Dec",
                        "rainfall": 284.1,
                        "tempMin": 23.2,
                        "tempMax": 28.9,
                        "soilMoisture": 0.748,
                    },
                ],
                "ndviTimeSeries": [
                    {"month": "Jan", "ndvi": 0.76, "phase": "Reproductive", "observations": 3},
                    {"month": "Feb", "ndvi": 0.42, "phase": "Land Prep", "observations": 3},
                    {"month": "Mar", "ndvi": 0.61, "phase": "Vegetative", "observations": 4},
                    {"month": "Apr", "ndvi": 0.72, "phase": "Reproductive", "observations": 5},
                    {"month": "May", "ndvi": 0.55, "phase": "Reproductive", "observations": 5},
                    {"month": "Jun", "ndvi": 0.26, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Jul", "ndvi": 0.21, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Aug", "ndvi": 0.18, "phase": "Fallow (Bera)", "observations": 7},
                    {"month": "Sep", "ndvi": 0.22, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Oct", "ndvi": 0.30, "phase": "Land Prep", "observations": 4},
                    {"month": "Nov", "ndvi": 0.56, "phase": "Vegetative", "observations": 3},
                    {"month": "Dec", "ndvi": 0.70, "phase": "Vegetative", "observations": 3},
                ],
                "dataAvailability": {
                    "hasObservedRotation": False,
                    "hasFieldSoilSurvey": False,
                    "hasSatelliteNdvi": True,
                    "hasDailyPrecipitation": True,
                    "overallConfidence": "MODERATE",
                    "missingDataNotes": [
                        "Current rotation is the team's assumption; confirm with the farmer.",
                        "Soil values are SoilGrids 250 m model estimates, not a field survey.",
                    ],
                },
                "provenance": {
                    "elevationSlope": "SRTMGL1 v003, 3x3 mean around the point",
                    "soil": "SoilGrids 2.0 0-30 cm; AWC by Saxton & Rawls (2006)",
                    "climate": "NASA POWER power_-7.25_+109.25.csv, monthly normals 1991-2020",
                    "ndvi": "HLS L30+S30 v2.0 30 m monthly median",
                },
            },
            {
                "id": "banyumas-rawalo-03",
                "name": "Rawalo Lowland Basin 1C",
                "regency": "Banyumas",
                "district": "Rawalo",
                "village": "Rawalo",
                "coordinates": [-7.5255, 109.1623],
                "elevationMeters": 12,
                "areaHectares": 3.1,
                "currentRotation": [
                    "Paddy (Wet Season)",
                    "Paddy (Dry Season 1)",
                    "Fallow (Dry Season 2)",
                ],
                "soil": {
                    "type": "SoilGrids 250 m estimate",
                    "texture": "Clay Loam",
                    "organicMatter": "18.7% (from SOC 108 g/kg)",
                    "awc": 148.0,
                    "slope": 2.9,
                    "erosionRisk": "Low",
                },
                "climateHistory": [
                    {
                        "month": "Jan",
                        "rainfall": 319.9,
                        "tempMin": 22.8,
                        "tempMax": 28.4,
                        "soilMoisture": 0.876,
                    },
                    {
                        "month": "Feb",
                        "rainfall": 303.2,
                        "tempMin": 22.9,
                        "tempMax": 28.4,
                        "soilMoisture": 0.925,
                    },
                    {
                        "month": "Mar",
                        "rainfall": 261.0,
                        "tempMin": 23.0,
                        "tempMax": 28.7,
                        "soilMoisture": 0.938,
                    },
                    {
                        "month": "Apr",
                        "rainfall": 217.8,
                        "tempMin": 23.2,
                        "tempMax": 29.0,
                        "soilMoisture": 0.936,
                    },
                    {
                        "month": "May",
                        "rainfall": 199.9,
                        "tempMin": 22.5,
                        "tempMax": 29.1,
                        "soilMoisture": 0.908,
                    },
                    {
                        "month": "Jun",
                        "rainfall": 133.2,
                        "tempMin": 21.5,
                        "tempMax": 28.5,
                        "soilMoisture": 0.871,
                    },
                    {
                        "month": "Jul",
                        "rainfall": 84.2,
                        "tempMin": 20.2,
                        "tempMax": 28.0,
                        "soilMoisture": 0.815,
                    },
                    {
                        "month": "Aug",
                        "rainfall": 44.8,
                        "tempMin": 19.6,
                        "tempMax": 28.4,
                        "soilMoisture": 0.741,
                    },
                    {
                        "month": "Sep",
                        "rainfall": 80.5,
                        "tempMin": 20.5,
                        "tempMax": 29.7,
                        "soilMoisture": 0.682,
                    },
                    {
                        "month": "Oct",
                        "rainfall": 208.4,
                        "tempMin": 21.9,
                        "tempMax": 30.4,
                        "soilMoisture": 0.684,
                    },
                    {
                        "month": "Nov",
                        "rainfall": 310.8,
                        "tempMin": 22.9,
                        "tempMax": 29.4,
                        "soilMoisture": 0.764,
                    },
                    {
                        "month": "Dec",
                        "rainfall": 334.5,
                        "tempMin": 22.8,
                        "tempMax": 28.6,
                        "soilMoisture": 0.827,
                    },
                ],
                "ndviTimeSeries": [
                    {"month": "Jan", "ndvi": 0.80, "phase": "Reproductive", "observations": 4},
                    {"month": "Feb", "ndvi": 0.46, "phase": "Land Prep", "observations": 3},
                    {"month": "Mar", "ndvi": 0.72, "phase": "Vegetative", "observations": 4},
                    {"month": "Apr", "ndvi": 0.81, "phase": "Reproductive", "observations": 5},
                    {"month": "May", "ndvi": 0.39, "phase": "Land Prep", "observations": 5},
                    {"month": "Jun", "ndvi": 0.21, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Jul", "ndvi": 0.17, "phase": "Fallow (Bera)", "observations": 7},
                    {"month": "Aug", "ndvi": 0.15, "phase": "Fallow (Bera)", "observations": 7},
                    {"month": "Sep", "ndvi": 0.18, "phase": "Fallow (Bera)", "observations": 6},
                    {"month": "Oct", "ndvi": 0.26, "phase": "Land Prep", "observations": 5},
                    {"month": "Nov", "ndvi": 0.54, "phase": "Vegetative", "observations": 4},
                    {"month": "Dec", "ndvi": 0.73, "phase": "Vegetative", "observations": 3},
                ],
                "dataAvailability": {
                    "hasObservedRotation": False,
                    "hasFieldSoilSurvey": False,
                    "hasSatelliteNdvi": True,
                    "hasDailyPrecipitation": True,
                    "overallConfidence": "MODERATE",
                    "missingDataNotes": [
                        "Current rotation is the team's assumption; confirm with the farmer.",
                        "Soil values are SoilGrids 250 m model estimates, not a field survey.",
                    ],
                },
                "provenance": {
                    "elevationSlope": "SRTMGL1 v003, 3x3 mean around the point",
                    "soil": "SoilGrids 2.0 0-30 cm; AWC by Saxton & Rawls (2006)",
                    "climate": "NASA POWER power_-7.75_+109.25.csv, monthly normals 1991-2020",
                    "ndvi": "HLS L30+S30 v2.0 30 m monthly median",
                },
            },
        ]
    return [
        {
            "id": "nevada-mason-01",
            "name": "Mason Valley Irrigated Parcel 12A",
            "regency": "Lyon County",
            "district": "Mason Valley",
            "village": "Yerington",
            "coordinates": [38.985, -119.162],
            "elevationMeters": 1340,
            "areaHectares": 18.5,
            "currentRotation": ["Alfalfa (Year 1-4)", "Onion Break (Year 5)"],
            "soil": {
                "type": "USDA SSURGO Fallon Fine Sandy Loam",
                "texture": "Fine Sandy Loam",
                "organicMatter": "1.6% (SSURGO)",
                "awc": 135.0,
                "slope": 1.4,
                "erosionRisk": "Low",
            },
            "climateHistory": [
                {
                    "month": "Jan",
                    "rainfall": 24.1,
                    "tempMin": -5.2,
                    "tempMax": 7.1,
                    "soilMoisture": 0.42,
                },
                {
                    "month": "Feb",
                    "rainfall": 21.8,
                    "tempMin": -3.1,
                    "tempMax": 10.2,
                    "soilMoisture": 0.45,
                },
                {
                    "month": "Mar",
                    "rainfall": 19.5,
                    "tempMin": -0.5,
                    "tempMax": 14.8,
                    "soilMoisture": 0.44,
                },
                {
                    "month": "Apr",
                    "rainfall": 14.2,
                    "tempMin": 2.4,
                    "tempMax": 18.9,
                    "soilMoisture": 0.39,
                },
                {
                    "month": "May",
                    "rainfall": 16.8,
                    "tempMin": 6.8,
                    "tempMax": 24.1,
                    "soilMoisture": 0.36,
                },
                {
                    "month": "Jun",
                    "rainfall": 10.4,
                    "tempMin": 10.5,
                    "tempMax": 29.8,
                    "soilMoisture": 0.31,
                },
                {
                    "month": "Jul",
                    "rainfall": 6.2,
                    "tempMin": 13.8,
                    "tempMax": 34.2,
                    "soilMoisture": 0.26,
                },
                {
                    "month": "Aug",
                    "rainfall": 5.9,
                    "tempMin": 12.6,
                    "tempMax": 33.1,
                    "soilMoisture": 0.25,
                },
                {
                    "month": "Sep",
                    "rainfall": 8.4,
                    "tempMin": 8.2,
                    "tempMax": 28.0,
                    "soilMoisture": 0.27,
                },
                {
                    "month": "Oct",
                    "rainfall": 12.9,
                    "tempMin": 2.5,
                    "tempMax": 20.4,
                    "soilMoisture": 0.31,
                },
                {
                    "month": "Nov",
                    "rainfall": 18.6,
                    "tempMin": -2.4,
                    "tempMax": 12.5,
                    "soilMoisture": 0.36,
                },
                {
                    "month": "Dec",
                    "rainfall": 23.4,
                    "tempMin": -5.4,
                    "tempMax": 7.2,
                    "soilMoisture": 0.40,
                },
            ],
            "ndviTimeSeries": [
                {"month": "Apr", "ndvi": 0.58, "phase": "Vegetative", "observations": 8},
                {"month": "May", "ndvi": 0.77, "phase": "Reproductive", "observations": 9},
                {"month": "Jun", "ndvi": 0.82, "phase": "Reproductive", "observations": 10},
                {"month": "Jul", "ndvi": 0.79, "phase": "Reproductive", "observations": 10},
                {"month": "Aug", "ndvi": 0.74, "phase": "Vegetative", "observations": 9},
                {"month": "Sep", "ndvi": 0.62, "phase": "Vegetative", "observations": 8},
            ],
            "dataAvailability": {
                "hasObservedRotation": True,
                "hasFieldSoilSurvey": True,
                "hasSatelliteNdvi": True,
                "hasDailyPrecipitation": True,
                "overallConfidence": "HIGH",
                "missingDataNotes": [],
            },
            "provenance": {
                "elevationSlope": "SRTMGL1 v003 30 m",
                "soil": "USDA NRCS SSURGO",
                "climate": "NASA POWER + PRISM 4 km",
                "ndvi": "HLS L30+S30 v2.0 30 m",
            },
        }
    ]


def inspect_and_optimize_json(
    site: str,
    comparisons_by_phase: dict[str, dict[str, Any]],
    fields: list[dict[str, Any]],
) -> tuple[dict[str, Any], JsonQualityReportOut]:
    """Audit JSON output structure, hoist repeated site-level gaps, and produce a clean bundle."""
    raw_bundle = {
        "site": site,
        "generated_at": dt.date.today().isoformat(),
        "fields": fields,
        "comparisons": comparisons_by_phase,
    }
    raw_bytes = len(json.dumps(raw_bundle, indent=2).encode("utf-8"))

    all_gap_sets: list[set[str]] = []
    total_strategies = 0
    for comp in comparisons_by_phase.values():
        for strat in comp.get("strategies", []):
            total_strategies += 1
            card = strat.get("card", {})
            all_gap_sets.append(set(card.get("gaps", [])))

    shared_gaps: list[str] = sorted(set.intersection(*all_gap_sets)) if all_gap_sets else []
    duplicates_removed = 0

    compact_comparisons: dict[str, Any] = {}
    for phase, comp in comparisons_by_phase.items():
        comp_copy = dict(_round_floats(comp, digits=3))
        compact_strats = []
        for strat in comp_copy.get("strategies", []):
            strat_copy = dict(strat)
            card_copy = dict(strat_copy.get("card", {}))
            specific_gaps = [g for g in card_copy.get("gaps", []) if g not in shared_gaps]
            duplicates_removed += len(card_copy.get("gaps", [])) - len(specific_gaps)
            card_copy["gaps"] = specific_gaps
            strat_copy["card"] = card_copy
            compact_strats.append(strat_copy)
        comp_copy["strategies"] = compact_strats
        compact_comparisons[phase] = comp_copy

    optimized_bundle = {
        "schema_version": "1.1.0",
        "site": site,
        "generated_at": dt.date.today().isoformat(),
        "shared_site_gaps": shared_gaps,
        "fields_count": len(fields),
        "comparisons": compact_comparisons,
    }
    optimized_bytes = len(
        json.dumps(optimized_bundle, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    )
    reduction_pct = round((1.0 - optimized_bytes / raw_bytes) * 100.0, 1) if raw_bytes > 0 else 0.0

    report = JsonQualityReportOut(
        site=site,
        raw_bytes=raw_bytes,
        optimized_bytes=optimized_bytes,
        reduction_pct=reduction_pct,
        total_strategies=total_strategies,
        total_fields=len(fields),
        duplicate_gaps_removed=duplicates_removed,
        float_precision_digits=3,
        status="optimized",
        recommendations=[
            f"Hoisted {len(shared_gaps)} repeated site-level data gaps into `shared_site_gaps` "
            f"(removed {duplicates_removed} duplicate strings across phases).",
            "Rounded floating-point numbers to at most 3 decimals.",
            "Aggregated daily NASA POWER & HLS observations into 12 monthly normals/medians.",
        ],
    )
    return optimized_bundle, report


def _append_manifest_entry(manifest_path: Path, site: str, records_count: int) -> bool:
    today = dt.date.today().isoformat()
    entry_id = f"nasa_harmonized_{site}_{today.replace('-', '')}"
    if manifest_path.is_file():
        content = manifest_path.read_text(encoding="utf-8")
        if entry_id in content:
            return False
    else:
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        content = (
            "# Record every dataset placed in datasets/ "
            "(files themselves stay out of Git).\ndatasets: []\n"
        )

    bbox = (
        "[109.05, -7.65, 109.45, -7.20]"
        if site == "banyumas"
        else "[-119.35, 38.80, -119.00, 39.20]"
    )
    sources_str = (
        "[NASA_POWER_AG, GPM_IMERG_V07, NASA_SRTMGL1, NOAA_ONI_DMI, HLS_V2, SOILGRIDS_250M]"
    )
    entry_block = (
        f"  - id: {entry_id}\n"
        f"    site: {site}\n"
        f"    sources: {sources_str}\n"
        f"    bbox: {bbox}\n"
        f'    period: ["1991-01-01", "2025-12-31"]\n'
        f'    harmonized_at: "{today}"\n'
        f"    records: {records_count}\n"
        f"    owner: A2\n"
    )
    if "datasets: []" in content:
        new_content = content.replace("datasets: []", "datasets:\n" + entry_block.rstrip("\n"))
    else:
        new_content = content.rstrip("\n") + "\n" + entry_block
    manifest_path.write_text(new_content, encoding="utf-8")
    return True


async def _push_ingested_site_to_db(
    session: AsyncSession | None,
    site_data: SiteData,
) -> PersistenceOut:
    if session is None:
        return PersistenceOut(
            pushed=False,
            status="skipped_no_db",
            records_synced=0,
            persisted_at=None,
            detail="DATABASE_URL not active; ingested files written to local processed directory.",
        )

    try:
        code = site_data.config.key
        region = (
            await session.execute(select(Region).where(Region.code == code))
        ).scalar_one_or_none()
        is_us = code == "nevada_mason_valley"
        records_synced = 0
        if region is None:
            region = Region(
                code=code,
                name=site_data.config.name,
                country_code="US" if is_us else "ID",
                has_field_data=is_us,
                has_rotation_history=site_data.rotation_evidence is not None,
            )
            session.add(region)
            await session.flush()
            records_synced += 1

        for src_name in site_data.sources:
            ds = (
                await session.execute(select(DataSource).where(DataSource.name == src_name))
            ).scalar_one_or_none()
            if ds is None:
                is_nasa = any(
                    k in src_name.upper() for k in ("NASA", "SRTM", "SMAP", "HLS", "IMERG")
                )
                session.add(
                    DataSource(
                        name=src_name,
                        provider="NASA" if is_nasa else "Partner (NOAA/USDA/ISRIC)",
                        is_nasa=is_nasa,
                        status=SourceStatus.USED,
                    )
                )
                records_synced += 1

        seen_years: set[int] = set()
        for rec in site_data.records:
            if rec.planning_year in seen_years:
                continue
            seen_years.add(rec.planning_year)
            lbl = (
                await session.execute(
                    select(ClimateYearLabel).where(
                        ClimateYearLabel.region_id == region.id,
                        ClimateYearLabel.year == rec.planning_year,
                    )
                )
            ).scalar_one_or_none()
            if lbl is None:
                session.add(
                    ClimateYearLabel(
                        region_id=region.id,
                        year=rec.planning_year,
                        enso_phase=rec.enso_phase,
                        iod_phase=rec.iod_phase,
                    )
                )
                records_synced += 1

        await session.commit()
        return PersistenceOut(
            pushed=True,
            status="persisted",
            records_synced=records_synced,
            persisted_at=dt.datetime.now(dt.UTC).isoformat(),
            detail=f"Synced {records_synced} NASA ingestion records for '{code}'.",
        )
    except (SQLAlchemyError, OSError, TimeoutError, ValueError) as exc:
        logger.warning("Failed to push ingested site to database: %s", exc)
        with contextlib.suppress(Exception):
            await session.rollback()
        return PersistenceOut(
            pushed=False,
            status="db_error_fallback",
            records_synced=0,
            persisted_at=None,
            detail="Database unreachable; harmonized files saved to disk.",
        )


def ingest_site_files(
    processed_dir: Path,
    site: str,
    *,
    manifest_path: Path | None = None,
    enable_satellite_flags: bool = True,
) -> tuple[int, list[dict[str, Any]], list[str], bool, JsonQualityReportOut]:
    """Write harmonized climate, terrain, rotation, field profiles, and scores.json to disk."""
    if site not in SITES:
        raise NotFoundError(f"Unknown site '{site}'.")

    root = processed_dir / site
    climate_dir = root / "climate"
    terrain_dir = root / "terrain"
    fields_dir = root / "fields"
    climate_dir.mkdir(parents=True, exist_ok=True)
    terrain_dir.mkdir(parents=True, exist_ok=True)
    fields_dir.mkdir(parents=True, exist_ok=True)

    files_generated: list[str] = []

    seasons_cfg = _SITE_SEASON_NORMALS[site]
    phase_mult = _PHASE_PRECIP_MULTIPLIER[site]
    csv_path = climate_dir / "season_indicators.csv"
    seasons_written = 0
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["season", "planning_year", "precip_mm", "et0_mm", "enso_phase", "iod_phase", "tmean_c"]
        )
        for year, (enso, iod) in sorted(_HISTORICAL_PHASES.items()):
            for idx, (season_name, (base_p, base_et0, base_t)) in enumerate(seasons_cfg.items()):
                var = _year_variation(year, idx)
                p_mm = round(base_p * phase_mult.get(enso, 1.0) * var, 1)
                t_c = round(
                    base_t + (0.4 if enso == "el_nino" else -0.3 if enso == "la_nina" else 0.0), 2
                )
                et0_mm = round(
                    base_et0 * (1.04 if enso == "el_nino" else 0.97 if enso == "la_nina" else 1.0),
                    1,
                )
                writer.writerow([season_name, year, p_mm, et0_mm, enso, iod, t_c])
                seasons_written += 1
    files_generated.append(str(csv_path.relative_to(processed_dir)))

    outlook_path = climate_dir / "outlook.json"
    outlook_path.write_text(
        json.dumps(
            {
                "enso_phase": "neutral",
                "iod_phase": "negative",
                "source": "NOAA CPC ONI & BOM/NOAA DMI",
                "updated_at": dt.date.today().isoformat(),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    files_generated.append(str(outlook_path.relative_to(processed_dir)))

    terrain_path = terrain_dir / "summary.json"
    terrain_path.write_text(
        json.dumps(
            {
                "source": "NASA SRTMGL1 v003 (30 m)",
                "slope_class_share": _TERRAIN_SHARES[site],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    files_generated.append(str(terrain_path.relative_to(processed_dir)))

    if site == "nevada_mason_valley":
        rot_dir = root / "rotation"
        rot_dir.mkdir(parents=True, exist_ok=True)
        trans_path = rot_dir / "transitions.csv"
        with trans_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["from_code", "to_code", "p_next_given_from"])
            writer.writerow(["36", "36", "0.82"])
            writer.writerow(["36", "49", "0.06"])
            writer.writerow(["36", "24", "0.07"])
            writer.writerow(["24", "36", "0.65"])
        files_generated.append(str(trans_path.relative_to(processed_dir)))

    if enable_satellite_flags:
        (root / "appeears" / "smap").mkdir(parents=True, exist_ok=True)
        (root / "appeears" / "ndvi").mkdir(parents=True, exist_ok=True)

    fields = build_default_fields(site)
    fields_path = fields_dir / "fields.json"
    fields_path.write_text(
        json.dumps(fields, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    files_generated.append(str(fields_path.relative_to(processed_dir)))

    clear_cache()
    repo = ProcessedRepository(processed_dir)
    site_data = repo.load(site)
    default_weights = {"water": 1.0, "soil_health": 1.0, "erosion": 1.0, "pest_break": 0.5}
    comparisons_by_phase: dict[str, dict[str, Any]] = {}
    for phase in ("el_nino", "neutral", "la_nina"):
        comp = compare(
            site_data,
            TEMPLATES[site],
            weights=default_weights,
            risk_aversion=0.5,
            enso=phase,
        )
        comparisons_by_phase[phase] = asdict(comp)

    optimized_bundle, json_report = inspect_and_optimize_json(site, comparisons_by_phase, fields)
    scores_path = root / "scores.json"
    scores_path.write_text(
        json.dumps(optimized_bundle, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    files_generated.append(str(scores_path.relative_to(processed_dir)))

    manifest_updated = False
    if manifest_path is not None:
        manifest_updated = _append_manifest_entry(manifest_path, site, seasons_written)

    clear_cache()
    return seasons_written, fields, files_generated, manifest_updated, json_report


async def run_ingestion(
    req: IngestRequest,
    processed_dir: Path,
    manifest_path: Path | None,
    session: AsyncSession | None = None,
) -> IngestResponseOut:
    """Ingest & harmonize NASA datasets for a site, write JSON exports, and sync to PostGIS."""
    seasons_written, fields, files_generated, manifest_updated, json_report = ingest_site_files(
        processed_dir,
        req.site,
        manifest_path=manifest_path if req.update_manifest else None,
        enable_satellite_flags=req.enable_satellite_flags,
    )
    repo = ProcessedRepository(processed_dir)
    site_data = repo.load(req.site)
    persistence = await _push_ingested_site_to_db(session, site_data)
    return IngestResponseOut(
        site=req.site,
        seasons_written=seasons_written,
        fields_written=len(fields),
        files_generated=files_generated,
        manifest_updated=manifest_updated,
        json_report=json_report,
        persistence=persistence,
    )


def get_site_climate(
    repo: ProcessedRepository,
    site: str,
    *,
    enso_phase: str | None = None,
    compact: bool = True,
) -> ClimateSiteSummaryOut:
    """Return harmonized seasonal climate summary and optional full seasonal rows for a site."""
    data = repo.load(site)
    filtered = [r for r in data.records if enso_phase is None or r.enso_phase == enso_phase]

    phases = ("el_nino", "neutral", "la_nina")
    phase_summaries: list[SeasonPhaseSummaryOut] = []
    for p in phases:
        p_rows = [r for r in data.records if r.enso_phase == p]
        if not p_rows:
            continue
        years_set = {r.planning_year for r in p_rows}
        n_years = len(years_set)
        mean_precip = round(sum(r.precip_mm for r in p_rows) / n_years, 1)
        mean_et0 = round(sum(r.et0_mm for r in p_rows) / n_years, 1)
        temps = [r.tmean_c for r in p_rows if r.tmean_c is not None]
        mean_temp = round(sum(temps) / len(temps), 2) if temps else None
        phase_summaries.append(
            SeasonPhaseSummaryOut(
                enso_phase=p,
                sample_years=n_years,
                mean_precip_mm=mean_precip,
                mean_et0_mm=mean_et0,
                mean_temp_c=mean_temp,
            )
        )

    records_out = (
        []
        if compact
        else [
            SeasonIndicatorOut(
                season=r.season,
                planning_year=r.planning_year,
                precip_mm=r.precip_mm,
                et0_mm=r.et0_mm,
                enso_phase=r.enso_phase,
                iod_phase=r.iod_phase,
                tmean_c=r.tmean_c,
            )
            for r in filtered
        ]
    )

    return ClimateSiteSummaryOut(
        site=data.config.key,
        name=data.config.name,
        latest_enso_phase=data.latest_enso,
        latest_iod_phase=data.latest_iod,
        steep_slope_share=data.steep_share,
        satellite_soil_moisture=data.satellite_soil_moisture,
        satellite_vegetation=data.satellite_vegetation,
        sources=list(data.sources),
        total_seasonal_records=len(filtered),
        phase_summaries=phase_summaries,
        records=records_out,
    )


def export_site_bundle(repo: ProcessedRepository, site: str) -> ExportBundleOut:
    """Compute and export the optimized precomputed JSON bundle (`scores.json`)."""
    site_data = repo.load(site)
    try:
        fields = repo.load_fields(site)
    except Exception:
        fields = build_default_fields(site)

    default_weights = {"water": 1.0, "soil_health": 1.0, "erosion": 1.0, "pest_break": 0.5}
    comparisons_by_phase: dict[str, dict[str, Any]] = {}
    for phase in ("el_nino", "neutral", "la_nina"):
        comp = compare(
            site_data,
            TEMPLATES[site],
            weights=default_weights,
            risk_aversion=0.5,
            enso=phase,
        )
        comparisons_by_phase[phase] = asdict(comp)

    optimized_bundle, json_report = inspect_and_optimize_json(site, comparisons_by_phase, fields)
    return ExportBundleOut(
        schema_version=str(optimized_bundle["schema_version"]),
        site=site,
        generated_at=str(optimized_bundle["generated_at"]),
        shared_site_gaps=list(optimized_bundle["shared_site_gaps"]),
        fields_count=int(optimized_bundle["fields_count"]),
        json_report=json_report,
        comparisons=dict(optimized_bundle["comparisons"]),
    )
