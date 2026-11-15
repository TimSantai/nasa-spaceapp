"""FastAPI application factory."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_v1
from app.core.config import Settings, get_settings
from app.core.errors import register_error_handlers
from app.core.logging import configure_logging
from app.core.rate_limit import RateLimitMiddleware
from app.db.config import get_database_config
from app.db.connection import create_database_engine
from app.db.health import is_database_healthy
from app.db.session import create_session_factory
from app.features.health.router import router as health_router

logger = logging.getLogger(__name__)

OPENAPI_DESCRIPTION = """
**Field Shift API** — Decision-support backend for comparing crop rotation strategies using
NASA Earth observations, local soil and terrain data, and climate-conditioned risk scoring.

### Key Capabilities
- **Climate-Conditioned Rotation Engine (`/api/v1/rotations`)**: Evaluates baseline and alternative
  crop rotations across historical analog years matching the forecasted **ENSO** (`el_nino`,
  `la_nina`, `neutral`) and **IOD** (`positive`, `negative`, `neutral`) phases. Computes mean and
  worst-20% (**CVaR20**) irrigation demand, soil health heuristics, RUSLE slope erosion exposure,
  Pareto dominance, and pre-normalized `0-100` scores (`scores_100`).
- **Automatic AI-to-Database Persistence (`PostGIS`)**: Every AI comparison and NASA dataset
  ingestion automatically upserts structured records (`regions`, `parcels`, `crops`, `strategies`,
  `strategy_items`, `scenario_outcomes`, `evidence_cards`, `data_gaps`, `climate_year_labels`)
  into PostgreSQL/PostGIS when `DATABASE_URL` is configured, with graceful fallback in offline mode.
- **Agricultural Field Profiles (`/api/v1/fields`)**: Serves harmonized field profiles combining
  **NASA SRTM 30m** slope, **SoilGrids 250m / USDA SSURGO** soil properties, **NASA POWER** monthly
  normals, and **NASA HLS 30m NDVI** phenology curves.
- **NASA Data Ingestion, Zonal Harmonization & JSON Export (`/api/v1/climate`)**: Runs the A2
  pipeline to harmonize NASA POWER, GPM IMERG, SRTM, NOAA ONI/DMI, and HLS NDVI data, updates
  `datasets/manifest.yaml`, and exports optimized `scores.json` bundles with duplicate site-level
  gaps hoisted out.

### Response Envelope
Every endpoint returns a consistent `ApiResponse[T]` envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": null
}
```
"""

OPENAPI_TAGS = [
    {
        "name": "health",
        "description": "Service liveness and environment readiness probe.",
    },
    {
        "name": "rotations",
        "description": (
            "AI crop rotation comparison engine conditioned on ENSO/IOD analog years, "
            "CVaR20 tail-risk scoring, Pareto front classification, and PostGIS persistence."
        ),
    },
    {
        "name": "fields",
        "description": (
            "Harmonized agricultural plot and village profiles (SRTM slope, SoilGrids/SSURGO AWC, "
            "NASA POWER climate normals, and HLS 30m NDVI phenology)."
        ),
    },
    {
        "name": "climate",
        "description": (
            "A2 NASA data ingestion, zonal harmonization, seasonal climate summaries, "
            "and optimized JSON export (`scores.json`) with payload size diagnostics."
        ),
    },
]


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level, settings.log_format)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        if settings.database_url is None:
            logger.warning("DATABASE_URL is not configured; skipping database initialization")
            yield
            return

        config = get_database_config(settings)
        engine = create_database_engine(config)
        session_factory = create_session_factory(engine)
        app.state.db_engine = engine
        app.state.db_session_factory = session_factory

        try:
            connected = await is_database_healthy(engine)
            if connected:
                logger.info("database connection check succeeded")
            else:
                logger.warning("database is unreachable; continuing application startup")
            yield
        finally:
            await engine.dispose()

    app = FastAPI(
        title="Field Shift API",
        summary="NASA Space Apps 2026 — Crop Rotation Decision-Support & Data Harmonization API",
        description=OPENAPI_DESCRIPTION,
        version="0.1.0",
        openapi_tags=OPENAPI_TAGS,
        contact={
            "name": "Field Shift Team (A2 Data & Backend Engineering)",
            "url": "https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/",
        },
        license_info={
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT",
        },
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    app.add_middleware(RateLimitMiddleware, limit=settings.rate_limit_default)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    register_error_handlers(app)
    app.include_router(health_router)
    app.include_router(api_v1)
    return app


app = create_app()
