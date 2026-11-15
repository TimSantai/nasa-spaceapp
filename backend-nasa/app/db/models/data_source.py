from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import Boolean, Date, DateTime, Index, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import ENUM as PostgreSQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin, immediate_foreign_key

if TYPE_CHECKING:
    from app.db.models.parcel import Parcel
    from app.db.models.strategy import ScenarioOutcome


def _enum_values(enum_type: type[StrEnum]) -> list[str]:
    return [member.value for member in enum_type]


class SourceStatus(StrEnum):
    USED = "used"
    OPTIONAL = "optional"
    NOT_USED = "not_used"


class ApproachType(StrEnum):
    OBSERVATIONAL_MATCHING = "observational_matching"
    ML_STRESS_BASELINE = "ml_stress_baseline"
    WATER_BALANCE = "water_balance"


source_status_enum = PostgreSQLEnum(
    SourceStatus, name="source_status", values_callable=_enum_values
)
approach_type_enum = PostgreSQLEnum(
    ApproachType, name="approach_type", values_callable=_enum_values
)


class DataSource(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "data_sources"

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        comment="mis. NASA POWER, GPM IMERG, SMAP L4, HLS, ECOSTRESS ESI",
    )
    provider: Mapped[str | None] = mapped_column(
        String(100), nullable=True, server_default=text("'NASA'")
    )
    product_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    spatial_resolution: Mapped[str | None] = mapped_column(String(50), nullable=True)
    temporal_resolution: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_nasa: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    status: Mapped[SourceStatus] = mapped_column(
        source_status_enum,
        nullable=False,
        server_default=text("'used'"),
    )
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    observations: Mapped[list[Observation]] = relationship(
        "Observation", back_populates="data_source"
    )


class Observation(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "observations"
    __table_args__ = (Index("idx_obs_parcel_var_time", "parcel_id", "variable", "observed_at"),)

    parcel_id: Mapped[UUID] = mapped_column(immediate_foreign_key("parcels.id"), nullable=False)
    data_source_id: Mapped[UUID] = mapped_column(
        immediate_foreign_key("data_sources.id"), nullable=False
    )
    variable: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="rainfall_mm, tmax_c, tmin_c, soil_moisture, ndvi, esi, dll",
    )
    observed_at: Mapped[date] = mapped_column(Date, nullable=False)
    value: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
    spatial_resolution_m: Mapped[int | None] = mapped_column(Integer, nullable=True)
    context_only: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment=(
            "True untuk data kasar (SMAP, POWER, GRACE): konteks wilayah, " "bukan kondisi petak"
        ),
    )

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="observations")
    data_source: Mapped[DataSource] = relationship("DataSource", back_populates="observations")


class ModelVersion(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "model_versions"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    approach: Mapped[ApproachType] = mapped_column(approach_type_enum, nullable=False)
    artifact_path: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="Jalur lokal ke artefak model"
    )
    metrics: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB, nullable=True, comment="Metrik baseline"
    )
    is_active: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True, server_default=text("true")
    )
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, server_default=text("now()")
    )

    scenario_outcomes: Mapped[list[ScenarioOutcome]] = relationship(
        "ScenarioOutcome", back_populates="model_version"
    )
