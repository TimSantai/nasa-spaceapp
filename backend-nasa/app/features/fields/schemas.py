"""Field profile schemas. Serialised in camelCase to match frontend-nasa/src/types/domain.ts."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, frozen=True)


class FieldSoil(CamelModel):
    type: str
    texture: str
    organic_matter: str
    awc: float = Field(ge=0, description="Available water capacity, mm per m of soil")
    slope: float = Field(ge=0, description="Slope, percent rise")
    erosion_risk: Literal["Low", "Moderate", "High"]


class ClimateMonth(CamelModel):
    month: str
    rainfall: float = Field(description="Mean monthly rainfall 1991-2020, mm")
    temp_min: float
    temp_max: float
    soil_moisture: float = Field(ge=0, le=1, description="Root-zone soil wetness, 0-1")


class NdviPoint(CamelModel):
    month: str
    ndvi: float = Field(ge=-1, le=1)
    phase: Literal["Land Prep", "Vegetative", "Reproductive", "Fallow (Bera)"]
    observations: int = Field(ge=0)


class DataAvailability(CamelModel):
    has_observed_rotation: bool
    has_field_soil_survey: bool
    has_satellite_ndvi: bool
    has_daily_precipitation: bool
    overall_confidence: Literal["HIGH", "MODERATE", "LOW"]
    missing_data_notes: list[str]


class Provenance(CamelModel):
    elevation_slope: str
    soil: str
    climate: str
    ndvi: str | None = None


class FieldProfileOut(CamelModel):
    id: str
    name: str
    regency: str
    district: str
    village: str
    coordinates: list[float] = Field(min_length=2, max_length=2, description="[lat, lng]")
    elevation_meters: int
    area_hectares: float | None = None
    current_rotation: list[str]
    soil: FieldSoil
    climate_history: list[ClimateMonth]
    ndvi_time_series: list[NdviPoint]
    data_availability: DataAvailability
    provenance: Provenance
