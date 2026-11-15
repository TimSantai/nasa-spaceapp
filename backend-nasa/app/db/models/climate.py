from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Index, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin, immediate_foreign_key

if TYPE_CHECKING:
    from app.db.models.parcel import Region


class ClimateIndex(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "climate_indices"
    __table_args__ = (Index("uq_climate_index_month", "index_name", "year", "month", unique=True),)

    index_name: Mapped[str] = mapped_column(String(20), nullable=False, comment="ONI atau DMI")
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(6, 3), nullable=False)


class ClimateYearLabel(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "climate_year_labels"
    __table_args__ = (Index("uq_year_labels_region_year", "region_id", "year", unique=True),)

    region_id: Mapped[UUID] = mapped_column(immediate_foreign_key("regions.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    enso_phase: Mapped[str | None] = mapped_column(
        String(20), nullable=True, comment="el_nino, neutral, la_nina"
    )
    iod_phase: Mapped[str | None] = mapped_column(
        String(20), nullable=True, comment="positive, neutral, negative"
    )
    drought_percentile: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2), nullable=True, comment="Persentil kelembapan tanah (AS barat)"
    )

    region: Mapped[Region] = relationship("Region", back_populates="climate_year_labels")
