from __future__ import annotations

import contextlib
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.processed import ProcessedRepository, clear_cache
from app.features.climate.schemas import IngestRequest
from app.features.climate.service import _append_manifest_entry, run_ingestion
from app.features.fields.service import load_profiles, sync_fields_to_db
from app.features.rotations.schemas import CompareRequest
from app.features.rotations.service import run_comparison_and_persist
from tests.rotation_fixtures import write_all, write_fields

pytestmark = pytest.mark.anyio


def _mock_async_session() -> AsyncMock:
    session = AsyncMock(spec=AsyncSession)
    added_objects: list[object] = []

    def _add(obj: object) -> None:
        if getattr(obj, "id", None) is None:
            with contextlib.suppress(AttributeError):
                obj.id = uuid4()
        added_objects.append(obj)

    session.add = MagicMock(side_effect=_add)

    async def _execute(_stmt: object) -> MagicMock:
        res = MagicMock()
        res.scalar_one_or_none.return_value = None
        scalars_mock = MagicMock()
        scalars_mock.all.return_value = []
        scalars_mock.first.return_value = None
        res.scalars.return_value = scalars_mock
        return res

    session.execute = AsyncMock(side_effect=_execute)
    session.flush = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    return session


async def test_rotation_compare_pushes_to_db_and_populates_summary(tmp_path: Path) -> None:
    clear_cache()
    base = write_all(tmp_path)
    write_fields(base)
    repo = ProcessedRepository(base)
    session = _mock_async_session()

    req = CompareRequest(
        site="banyumas",
        field_id="banyumas-karangrau-01",
        enso_phase="el_nino",
        compact=True,
    )
    out = await run_comparison_and_persist(req, repo, session)

    assert out.persistence is not None
    assert out.persistence.pushed is True
    assert out.persistence.status == "persisted"
    assert out.persistence.records_synced > 0
    assert out.summary is not None
    assert out.summary.analog_years_count > 0
    assert len(out.shared_site_gaps) > 0
    assert out.strategies[0].scores_100 is not None
    assert 0 <= out.strategies[0].scores_100.mean.overall <= 100
    assert out.strategies[0].pareto_status in ("Optimal", "Tradeoff", "Dominated")
    session.commit.assert_awaited_once()


async def test_rotation_compare_graceful_fallback_on_db_error(tmp_path: Path) -> None:
    clear_cache()
    base = write_all(tmp_path)
    repo = ProcessedRepository(base)
    session = _mock_async_session()
    session.execute = AsyncMock(side_effect=SQLAlchemyError("db connection lost"))

    req = CompareRequest(site="banyumas")
    out = await run_comparison_and_persist(req, repo, session)

    assert out.persistence is not None
    assert out.persistence.pushed is False
    assert out.persistence.status == "db_error_fallback"
    session.rollback.assert_awaited_once()


async def test_climate_ingest_pushes_to_db_and_updates_manifest(tmp_path: Path) -> None:
    clear_cache()
    manifest = tmp_path / "manifest.yaml"
    session = _mock_async_session()

    req = IngestRequest(site="banyumas", enable_satellite_flags=True, update_manifest=True)
    res = await run_ingestion(req, tmp_path / "processed", manifest, session)

    assert res.manifest_updated is True
    assert manifest.is_file()
    assert "nasa_harmonized_banyumas" in manifest.read_text(encoding="utf-8")
    assert res.persistence.pushed is True
    assert res.persistence.records_synced > 0
    # Second call on same day does not duplicate manifest entry
    assert _append_manifest_entry(manifest, "banyumas", 10) is False


async def test_sync_fields_to_db_handles_active_and_failing_sessions(tmp_path: Path) -> None:
    clear_cache()
    write_fields(tmp_path)
    repo = ProcessedRepository(tmp_path)
    profiles = load_profiles(repo, "banyumas")

    session = _mock_async_session()
    await sync_fields_to_db(session, "banyumas", profiles)
    session.commit.assert_awaited_once()

    failing_session = _mock_async_session()
    failing_session.execute = AsyncMock(side_effect=SQLAlchemyError("offline"))
    await sync_fields_to_db(failing_session, "banyumas", profiles)
    failing_session.rollback.assert_awaited_once()
