from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Index, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import ENUM as PostgreSQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin, immediate_foreign_key

if TYPE_CHECKING:
    from app.db.models.crop import Crop
    from app.db.models.parcel import Parcel
    from app.db.models.strategy import Strategy


class ConfidenceLevel(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


confidence_level_enum = PostgreSQLEnum(
    ConfidenceLevel,
    name="confidence_level",
    values_callable=lambda enum_type: [member.value for member in enum_type],
)


class RotationEvidence(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "rotation_evidence"
    __table_args__ = (
        Index(
            "idx_rotation_evidence_lookup",
            "parcel_id",
            "from_crop_id",
            "to_crop_id",
            "metric",
        ),
    )

    parcel_id: Mapped[UUID] = mapped_column(immediate_foreign_key("parcels.id"), nullable=False)
    from_crop_id: Mapped[UUID] = mapped_column(immediate_foreign_key("crops.id"), nullable=False)
    to_crop_id: Mapped[UUID] = mapped_column(immediate_foreign_key("crops.id"), nullable=False)
    metric: Mapped[str] = mapped_column(String(30), nullable=False, comment="et, stress, ndvi")
    n_matched_parcels: Mapped[int] = mapped_column(Integer, nullable=False)
    mean_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    p25_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    p75_value: Mapped[Decimal | None] = mapped_column(Numeric(14, 4), nullable=True)
    is_association_only: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("true"),
        comment="Bukti CSB bersifat asosiasi, bukan sebab-akibat",
    )

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="rotation_evidence")
    from_crop: Mapped[Crop] = relationship(
        "Crop",
        back_populates="rotation_evidence_as_source",
        foreign_keys=[from_crop_id],
    )
    to_crop: Mapped[Crop] = relationship(
        "Crop",
        back_populates="rotation_evidence_as_target",
        foreign_keys=[to_crop_id],
    )


class EvidenceCard(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "evidence_cards"

    strategy_id: Mapped[UUID] = mapped_column(
        immediate_foreign_key("strategies.id"), unique=True, nullable=False
    )
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    benefits: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    gaps: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    risks_to_check: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[ConfidenceLevel] = mapped_column(confidence_level_enum, nullable=False)
    confidence_reasons: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    provenance: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        comment="Sumber, resolusi, pendekatan asal angka",
    )
    generated_by: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        server_default=text("'rules'"),
        comment="rules atau llm (LLM hanya merangkai kalimat dari angka)",
    )
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, server_default=text("now()")
    )

    strategy: Mapped[Strategy] = relationship("Strategy", back_populates="evidence_card")


class DataGap(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "data_gaps"

    parcel_id: Mapped[UUID] = mapped_column(immediate_foreign_key("parcels.id"), nullable=False)
    strategy_id: Mapped[UUID | None] = mapped_column(
        immediate_foreign_key("strategies.id"),
        nullable=True,
        comment="Kosong bila celah berlaku untuk seluruh lahan",
    )
    variable: Mapped[str] = mapped_column(String(100), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="data_gaps")
    strategy: Mapped[Strategy | None] = relationship("Strategy", back_populates="data_gaps")


class Glossary(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "glossary"

    term: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        comment="ET, NDVI, anomali kelembapan tanah, risiko embun beku, neraca air",
    )
    definition_id: Mapped[str] = mapped_column(Text, nullable=False)
    definition_en: Mapped[str | None] = mapped_column(Text, nullable=True)
