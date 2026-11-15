from __future__ import annotations

from sqlalchemy.orm import configure_mappers

from app.db.base import Base
from app.db.models import (
    ApproachType,
    ConfidenceLevel,
    ObjectiveType,
    ParcelKind,
    SourceStatus,
    StrategyOrigin,
)

EXPECTED_TABLES = {
    "climate_indices",
    "climate_year_labels",
    "crop_requirements",
    "crops",
    "data_gaps",
    "data_sources",
    "evidence_cards",
    "glossary",
    "model_versions",
    "observations",
    "parcel_calendar",
    "parcel_crop_history",
    "parcel_soil_properties",
    "parcels",
    "regions",
    "rotation_evidence",
    "scenario_outcomes",
    "strategies",
    "strategy_items",
}


def test_models_register_complete_nasa_schema() -> None:
    configure_mappers()
    assert set(Base.metadata.tables) == EXPECTED_TABLES


def test_database_enums_preserve_sql_values() -> None:
    assert [value.value for value in ParcelKind] == ["field_parcel", "village"]
    assert [value.value for value in SourceStatus] == ["used", "optional", "not_used"]
    assert [value.value for value in ApproachType] == [
        "observational_matching",
        "ml_stress_baseline",
        "water_balance",
    ]
    assert [value.value for value in ObjectiveType] == [
        "relative_yield",
        "irrigation_water_demand",
        "water_stress_days",
        "soil_health_estimate",
        "bare_soil_days",
    ]
    assert [value.value for value in StrategyOrigin] == [
        "current_rotation",
        "common_in_region",
        "extension_suggested",
    ]
    assert [value.value for value in ConfidenceLevel] == ["high", "medium", "low"]


def test_schema_preserves_foreign_keys_and_named_indexes() -> None:
    foreign_keys = [
        foreign_key for table in Base.metadata.tables.values() for foreign_key in table.foreign_keys
    ]
    assert len(foreign_keys) == 20
    assert all(foreign_key.deferrable is True for foreign_key in foreign_keys)
    assert all(foreign_key.initially == "IMMEDIATE" for foreign_key in foreign_keys)

    index_names = {index.name for table in Base.metadata.tables.values() for index in table.indexes}
    assert {
        "idx_calendar_parcel_season",
        "idx_obs_parcel_var_time",
        "idx_parcels_boundary_gist",
        "idx_rotation_evidence_lookup",
        "uq_climate_index_month",
        "uq_history_parcel_year",
        "uq_outcomes_strategy_year_objective",
        "uq_parcels_region_external",
        "uq_strategy_items_order",
        "uq_year_labels_region_year",
    } <= index_names

    spatial_index = next(
        index
        for index in Base.metadata.tables["parcels"].indexes
        if index.name == "idx_parcels_boundary_gist"
    )
    assert spatial_index.dialect_options["postgresql"]["using"] == "gist"
