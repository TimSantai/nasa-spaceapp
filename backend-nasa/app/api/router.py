"""Versioned API router. Feature routers are included here as they are built."""

from __future__ import annotations

from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1")
