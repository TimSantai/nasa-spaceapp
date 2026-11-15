from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Index, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import ENUM as PostgreSQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin, immediate_foreign_key
from app.db.models.data_source import ApproachType, approach_type_enum

if TYPE_CHECKING:
    from app.db.models.crop import Crop
    from app.db.models.data_source import ModelVersion
    from app.db.models.evidence import DataGap, EvidenceCard
    from app.db.models.parcel import Parcel


class ObjectiveType(StrEnum):
    RELATIVE_YIELD = "relative_yield"
    IRRIGATION_WATER_DEMAND = "irrigation_water_demand"
    WATER_STRESS_DAYS = "water_stress_days"
    SOIL_HEALTH_ESTIMATE = "soil_health_estimate"
    BARE_SOIL_DAYS = "bare_soil_days"


class StrategyOrigin(StrEnum):
    CURRENT_ROTATION = "current_rotation"
    COMMON_IN_REGION = "common_in_region"
    EXTENSION_SUGGESTED = "extension_suggested"


objective_type_enum = PostgreSQLEnum(
    ObjectiveType,
    name="objective_type",
    values_callable=lambda enum_type: [member.value for member in enum_type],
)
strategy_origin_enum = PostgreSQLEnum(
    StrategyOrigin,
    name="strategy_origin",
    values_callable=lambda enum_type: [member.value for member in enum_type],
)


class Strategy(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "strategies"
    __table_args__ = (Index("strategies_parcel_id_idx", "parcel_id"),)

    parcel_id: Mapped[UUID] = mapped_column(immediate_foreign_key("parcels.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False, comment="mis. Padi-padi-bera")
    is_baseline: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="Rotasi yang sedang dipakai",
    )
    origin: Mapped[StrategyOrigin] = mapped_column(strategy_origin_enum, nullable=False)
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, server_default=text("now()")
    )

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="strategies")
    items: Mapped[list[StrategyItem]] = relationship("StrategyItem", back_populates="strategy")
    outcomes: Mapped[list[ScenarioOutcome]] = relationship(
        "ScenarioOutcome", back_populates="strategy"
    )
    evidence_card: Mapped[EvidenceCard | None] = relationship(
        "EvidenceCard", back_populates="strategy"
    )
    data_gaps: Mapped[list[DataGap]] = relationship("DataGap", back_populates="strategy")


class StrategyItem(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "strategy_items"
    __table_args__ = (
        Index("uq_strategy_items_order", "strategy_id", "sequence_order", unique=True),
    )

    strategy_id: Mapped[UUID] = mapped_column(
        immediate_foreign_key("strategies.id"), nullable=False
    )
    crop_id: Mapped[UUID] = mapped_column(immediate_foreign_key("crops.id"), nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    season_label: Mapped[str | None] = mapped_column(String(50), nullable=True)

    strategy: Mapped[Strategy] = relationship("Strategy", back_populates="items")
    crop: Mapped[Crop] = relationship("Crop", back_populates="strategy_items")


class ScenarioOutcome(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "scenario_outcomes"
    __table_args__ = (
        Index(
            "uq_outcomes_strategy_year_objective",
            "strategy_id",
            "year",
            "objective",
            unique=True,
        ),
    )

    strategy_id: Mapped[UUID] = mapped_column(
        immediate_foreign_key("strategies.id"), nullable=False
    )
    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Tahun lampau; dikelompokkan lewat climate_year_labels",
    )
    objective: Mapped[ObjectiveType] = mapped_column(objective_type_enum, nullable=False)
    value: Mapped[Decimal] = mapped_column(
        Numeric(14, 4),
        nullable=False,
        comment="Relatif terhadap baseline, bukan nilai absolut",
    )
    approach: Mapped[ApproachType] = mapped_column(approach_type_enum, nullable=False)
    model_version_id: Mapped[UUID | None] = mapped_column(
        immediate_foreign_key("model_versions.id"), nullable=True
    )

    strategy: Mapped[Strategy] = relationship("Strategy", back_populates="outcomes")
    model_version: Mapped[ModelVersion | None] = relationship(
        "ModelVersion", back_populates="scenario_outcomes"
    )
