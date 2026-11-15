# ADR 0004: Rotation comparison engine (climate analogs + transparent indicators)

- Status: accepted (hackathon MVP)
- Date: 2026-11-15

## Context

The challenge asks for at least three rotation strategies, including the current one, each
with why/evidence/benefits/gaps/risks. Satellite soil moisture (SMAP) and NDVI are queued on
AppEEARS and may arrive late; NASA POWER, ENSO/IOD indices, SRTM and CDL are ready in
`fieldshift-data-kit/data/processed`.

## Decision

- `app/ai/rotation` is pure Python (no FastAPI, no pandas): catalog (FAO-56 Table 12 mid-season
  Kc, site seasons, strategy templates), engine (analog selection, metrics, scoring, cards).
- Climate risk uses historical analog years in the same ENSO (and IOD for Indonesia) phase,
  chosen at planning time (Aug-Oct indices, seasons start on or after 1 Nov: no look-ahead).
  The most specific grouping with at least 5 years is used, else a broader one.
- Water objective `J = (1 - lambda) * mean + lambda * CVaR20` of irrigation need,
  `need = max(0, ET0 * Kc_eff - 0.8 * P)`.
- Soil health, erosion exposure and pest-cycle breaks are simple, documented heuristics.
- Objectives are min-max normalised across the compared strategies, weighted by farmer
  priorities; Pareto optimality is reported next to the weighted rank.
- The farmer can replace the default baseline (`baseline` in the request); the Banyumas
  default baseline is an assumption and is marked low confidence.
- `app/data/processed.py` reads the processed folder (`PROCESSED_DIR`), cached per site.

## Consequences

- Fast, explainable, testable (no model training needed for the demo).
- Scores are relative to the strategies compared, not absolute.
- Not modelled: yields, prices, paddy percolation, phenology, nitrogen credit; ET0 is
  Hargreaves-Samani from temperature. These are listed in each evidence card's gaps.
- When SMAP/NDVI arrive, the repository flags switch on; using them in metrics is future work.

## Update 2026-11-15: field context and what-if scenarios

- `field_id` in `/rotations/compare` loads the field's slope and AWC from `fields.json`.
  - Soil water carry-over between seasons: capacity = AWC x 0.6 m rooting depth (assumption).
    This changes strategies differently (dry-season crops benefit), so it affects the ranking.
  - Erosion exposure uses the RUSLE slope-steepness factor S (McCool et al., 1987). A per-field
    factor scales every strategy equally, so it changes absolute erosion (shown in the UI) but
    not the relative ranking.
- `scenario` scales rainfall by (1 + pct/100) and adjusts ET0 with the Hargreaves-Samani
  temperature term (season mean temperature `tmean_c` from the processed climate table).
- The frontend no longer applies its own scenario penalties or climate multipliers; constraint
  conflicts are shown and sorted last instead of being re-scored.
