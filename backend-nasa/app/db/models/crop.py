from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin, immediate_foreign_key

if TYPE_CHECKING:
    from app.db.models.evidence import RotationEvidence
    from app.db.models.parcel import ParcelCropHistory
    from app.db.models.strategy import StrategyItem


class Crop(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "crops"

    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, comment="mis. corn, rice, mung_bean"
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="Nama bahasa Indonesia"
    )
    cdl_code: Mapped[int | None] = mapped_column(
        Integer, unique=True, nullable=True, comment="Kode kelas USDA CDL untuk pemetaan CSB"
    )
    family: Mapped[str | None] = mapped_column(String(100), nullable=True, comment="Aturan rotasi")
    is_legume: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    growth_duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    n_fixation_coef: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
        comment="Koefisien kontribusi N dari literatur; ESTIMASI, bukan pengukuran",
    )
    n_fixation_source: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="Referensi literatur untuk koefisien"
    )
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        server_default=text("now()"),
    )

    requirement: Mapped[CropRequirement | None] = relationship(
        "CropRequirement", back_populates="crop"
    )
    parcel_crop_history: Mapped[list[ParcelCropHistory]] = relationship(
        "ParcelCropHistory", back_populates="crop"
    )
    strategy_items: Mapped[list[StrategyItem]] = relationship("StrategyItem", back_populates="crop")
    rotation_evidence_as_source: Mapped[list[RotationEvidence]] = relationship(
        "RotationEvidence",
        back_populates="from_crop",
        foreign_keys="RotationEvidence.from_crop_id",
    )
    rotation_evidence_as_target: Mapped[list[RotationEvidence]] = relationship(
        "RotationEvidence",
        back_populates="to_crop",
        foreign_keys="RotationEvidence.to_crop_id",
    )


class CropRequirement(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "crop_requirements"

    crop_id: Mapped[UUID] = mapped_column(
        immediate_foreign_key("crops.id"), unique=True, nullable=False
    )
    min_ph: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    max_ph: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    min_temp_c: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    max_temp_c: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    min_rainfall_mm: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    max_rainfall_mm: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    suitability_source: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        server_default=text("'FAO GAEZ v4'"),
        comment="Prior kesesuaian, belum dikalibrasi untuk varietas lokal",
    )
    nutrient_notes: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    crop: Mapped[Crop] = relationship("Crop", back_populates="requirement")
