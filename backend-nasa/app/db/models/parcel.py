from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from typing import TYPE_CHECKING, Any
from uuid import UUID

from geoalchemy2 import Geometry
from geoalchemy2.elements import WKBElement
from sqlalchemy import CHAR, Boolean, Date, DateTime, Index, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import ENUM as PostgreSQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin, immediate_foreign_key

if TYPE_CHECKING:
    from app.db.models.climate import ClimateYearLabel
    from app.db.models.crop import Crop
    from app.db.models.data_source import Observation
    from app.db.models.evidence import DataGap, RotationEvidence
    from app.db.models.strategy import Strategy


class ParcelKind(StrEnum):
    FIELD_PARCEL = "field_parcel"
    VILLAGE = "village"


parcel_kind_enum = PostgreSQLEnum(
    ParcelKind,
    name="parcel_kind",
    values_callable=lambda enum_type: [member.value for member in enum_type],
)


class Region(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "regions"

    code: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False, comment="mis. us_west, banyumas"
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    country_code: Mapped[str] = mapped_column(CHAR(2), nullable=False)
    has_field_data: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="False untuk Banyumas: memicu penurunan keyakinan otomatis",
    )
    has_rotation_history: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
        comment="True bila CSB/CDL tersedia",
    )
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, server_default=text("now()")
    )

    parcels: Mapped[list[Parcel]] = relationship("Parcel", back_populates="region")
    climate_year_labels: Mapped[list[ClimateYearLabel]] = relationship(
        "ClimateYearLabel", back_populates="region"
    )


class Parcel(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "parcels"
    __table_args__ = (
        Index("idx_parcels_boundary_gist", "boundary", postgresql_using="gist"),
        Index("uq_parcels_region_external", "region_id", "external_id", unique=True),
    )

    region_id: Mapped[UUID] = mapped_column(immediate_foreign_key("regions.id"), nullable=False)
    kind: Mapped[ParcelKind] = mapped_column(parcel_kind_enum, nullable=False)
    external_id: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="ID CSB atau kode desa"
    )
    name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    boundary: Mapped[WKBElement] = mapped_column(
        Geometry("MULTIPOLYGON", srid=4326, spatial_index=False), nullable=False
    )
    centroid: Mapped[WKBElement | None] = mapped_column(
        Geometry("POINT", srid=4326, spatial_index=False), nullable=True
    )
    area_hectares: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    slope_mean_deg: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True, comment="Dari SRTM, rata-rata zonal"
    )
    slope_max_deg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    erosion_risk: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="low, medium, high: estimasi dari lereng dan tanah",
    )
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, server_default=text("now()")
    )

    region: Mapped[Region] = relationship("Region", back_populates="parcels")
    crop_history: Mapped[list[ParcelCropHistory]] = relationship(
        "ParcelCropHistory", back_populates="parcel"
    )
    soil_properties: Mapped[ParcelSoilProperty | None] = relationship(
        "ParcelSoilProperty", back_populates="parcel"
    )
    calendar: Mapped[list[ParcelCalendar]] = relationship("ParcelCalendar", back_populates="parcel")
    observations: Mapped[list[Observation]] = relationship("Observation", back_populates="parcel")
    strategies: Mapped[list[Strategy]] = relationship("Strategy", back_populates="parcel")
    rotation_evidence: Mapped[list[RotationEvidence]] = relationship(
        "RotationEvidence", back_populates="parcel"
    )
    data_gaps: Mapped[list[DataGap]] = relationship("DataGap", back_populates="parcel")


class ParcelCropHistory(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "parcel_crop_history"
    __table_args__ = (Index("uq_history_parcel_year", "parcel_id", "year", unique=True),)

    parcel_id: Mapped[UUID] = mapped_column(immediate_foreign_key("parcels.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    crop_id: Mapped[UUID] = mapped_column(immediate_foreign_key("crops.id"), nullable=False)
    source: Mapped[str | None] = mapped_column(
        String(50), nullable=True, server_default=text("'USDA CSB/CDL'")
    )

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="crop_history")
    crop: Mapped[Crop] = relationship("Crop", back_populates="parcel_crop_history")


class ParcelSoilProperty(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "parcel_soil_properties"

    parcel_id: Mapped[UUID] = mapped_column(
        immediate_foreign_key("parcels.id"), unique=True, nullable=False
    )
    texture_class: Mapped[str | None] = mapped_column(String(50), nullable=True)
    organic_matter_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    awc_mm: Mapped[Decimal | None] = mapped_column(
        Numeric(7, 2), nullable=True, comment="Kapasitas air tersedia"
    )
    ph: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    erosion_class: Mapped[str | None] = mapped_column(String(30), nullable=True)
    source: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="SSURGO (AS) atau SoilGrids (ID)"
    )
    resolution_m: Mapped[int | None] = mapped_column(Integer, nullable=True)
    p05_p95_range: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB, nullable=True, comment="Rentang ketidakpastian SoilGrids"
    )

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="soil_properties")


class ParcelCalendar(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "parcel_calendar"
    __table_args__ = (
        Index("idx_calendar_parcel_season", "parcel_id", "season_year", "season_label"),
    )

    parcel_id: Mapped[UUID] = mapped_column(immediate_foreign_key("parcels.id"), nullable=False)
    season_year: Mapped[int] = mapped_column(Integer, nullable=False)
    season_label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    planting_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    harvest_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    fallow_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stress_season: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
        server_default=text("false"),
        comment="Musim rentan stres dari ESI",
    )
    source: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        server_default=text("'HLS NDVI gap-filled, ECOSTRESS ESI'"),
    )

    parcel: Mapped[Parcel] = relationship("Parcel", back_populates="calendar")
