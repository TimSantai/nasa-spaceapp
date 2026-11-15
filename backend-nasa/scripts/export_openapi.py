"""Write the API contract to ../contracts/openapi.json (run after changing any endpoint/schema).

Usage (from backend-nasa/): python -m scripts.export_openapi
The frontend generates TypeScript types from this file: npm run gen:api
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from app.main import create_app

CONTRACT = Path(__file__).resolve().parents[2] / "contracts" / "openapi.json"


def main() -> None:
    CONTRACT.parent.mkdir(parents=True, exist_ok=True)
    spec = create_app().openapi()
    CONTRACT.write_text(
        json.dumps(spec, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    logging.getLogger(__name__).info("wrote %s", CONTRACT)


if __name__ == "__main__":
    main()
