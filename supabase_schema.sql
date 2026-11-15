-- ==============================================================================
-- NASA Space Apps 2026: Field Shift Database Schema
-- Supabase Project: ljxtsjmlqzuebngrfdyd
-- ==============================================================================

-- 1. Enable PostGIS Extension for geospatial boundary queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS fields CASCADE;

-- 3. Table: fields (Agricultural Plots & Village Boundaries)
CREATE TABLE fields (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    regency TEXT NOT NULL DEFAULT 'Banyumas',
    district TEXT NOT NULL,
    village TEXT NOT NULL,
    coordinates NUMERIC[] NOT NULL, -- [lat, lng]
    elevation_meters NUMERIC NOT NULL,
    area_hectares NUMERIC NOT NULL,
    current_rotation TEXT[] NOT NULL,
    soil JSONB NOT NULL,
    climate_history JSONB NOT NULL,
    ndvi_time_series JSONB NOT NULL,
    data_availability JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: strategies (Crop Rotation Options & Precomputed Risk Scores)
CREATE TABLE strategies (
    id TEXT PRIMARY KEY,
    field_id TEXT REFERENCES fields(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    crop_sequence TEXT[] NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
    pareto_status TEXT NOT NULL CHECK (pareto_status IN ('Optimal', 'Tradeoff', 'Dominated')),
    confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MODERATE', 'LOW')),
    confidence_reason TEXT NOT NULL,
    scores JSONB NOT NULL,
    evidence JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & Grant Public Read Access for Frontend
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on fields" 
ON fields FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read on strategies" 
ON strategies FOR SELECT 
TO anon, authenticated 
USING (true);

-- ==============================================================================
-- 6. Seed Data (Banyumas Pilot Study Area)
-- ==============================================================================

INSERT INTO fields (id, name, regency, district, village, coordinates, elevation_meters, area_hectares, current_rotation, soil, climate_history, ndvi_time_series, data_availability)
VALUES
(
    'banyumas-karangrau-01',
    'Plot Karangrau Block 4B',
    'Banyumas',
    'Banyumas',
    'Karangrau',
    ARRAY[-7.5186, 109.2942],
    48,
    2.4,
    ARRAY['Paddy (Wet Season)', 'Paddy (Dry Season 1)', 'Fallow (Dry Season 2)'],
    '{"type": "Alluvial & Inceptisol", "texture": "Clay Loam (Lempung Berliat)", "organicMatter": "1.8% (Low-Medium)", "awc": 145, "slope": 2.1, "erosionRisk": "Low"}'::jsonb,
    '[
      {"month": "Jan", "rainfall": 380, "tempMin": 22.4, "tempMax": 30.8, "soilMoisture": 0.38},
      {"month": "Feb", "rainfall": 340, "tempMin": 22.6, "tempMax": 31.0, "soilMoisture": 0.36},
      {"month": "Mar", "rainfall": 320, "tempMin": 22.7, "tempMax": 31.4, "soilMoisture": 0.35},
      {"month": "Apr", "rainfall": 260, "tempMin": 23.0, "tempMax": 31.6, "soilMoisture": 0.32},
      {"month": "May", "rainfall": 170, "tempMin": 22.8, "tempMax": 31.5, "soilMoisture": 0.28},
      {"month": "Jun", "rainfall": 110, "tempMin": 21.9, "tempMax": 31.2, "soilMoisture": 0.24},
      {"month": "Jul", "rainfall": 75, "tempMin": 21.2, "tempMax": 30.9, "soilMoisture": 0.19},
      {"month": "Aug", "rainfall": 45, "tempMin": 21.0, "tempMax": 31.1, "soilMoisture": 0.16},
      {"month": "Sep", "rainfall": 80, "tempMin": 21.5, "tempMax": 32.0, "soilMoisture": 0.18},
      {"month": "Oct", "rainfall": 210, "tempMin": 22.3, "tempMax": 32.2, "soilMoisture": 0.26},
      {"month": "Nov", "rainfall": 360, "tempMin": 22.5, "tempMax": 31.2, "soilMoisture": 0.36},
      {"month": "Dec", "rainfall": 395, "tempMin": 22.4, "tempMax": 30.9, "soilMoisture": 0.39}
    ]'::jsonb,
    '[
      {"month": "Nov", "ndvi": 0.28, "phase": "Land Prep"},
      {"month": "Dec", "ndvi": 0.62, "phase": "Vegetative"},
      {"month": "Jan", "ndvi": 0.81, "phase": "Reproductive"},
      {"month": "Feb", "ndvi": 0.45, "phase": "Land Prep"},
      {"month": "Mar", "ndvi": 0.76, "phase": "Vegetative"},
      {"month": "Apr", "ndvi": 0.82, "phase": "Reproductive"},
      {"month": "May", "ndvi": 0.40, "phase": "Land Prep"},
      {"month": "Jun", "ndvi": 0.22, "phase": "Fallow (Bera)"},
      {"month": "Jul", "ndvi": 0.18, "phase": "Fallow (Bera)"},
      {"month": "Aug", "ndvi": 0.16, "phase": "Fallow (Bera)"},
      {"month": "Sep", "ndvi": 0.19, "phase": "Fallow (Bera)"},
      {"month": "Oct", "ndvi": 0.25, "phase": "Land Prep"}
    ]'::jsonb,
    '{"hasObservedRotation": false, "hasFieldSoilSurvey": false, "hasSatelliteNdvi": true, "hasDailyPrecipitation": true, "overallConfidence": "MODERATE", "missingDataNotes": ["No USDA CSB in Indonesia; rotation phenology derived from HLS NDVI.", "Soil data from ISRIC SoilGrids 250m.", "Regional commodity prices from PIHPS."]}'::jsonb
);

-- Seed Strategies for Karangrau Block 4B
INSERT INTO strategies (id, field_id, name, crop_sequence, is_baseline, pareto_status, confidence, confidence_reason, scores, evidence)
VALUES
(
    'strat-baseline',
    'banyumas-karangrau-01',
    'Baseline: Paddy – Paddy – Fallow (Bera)',
    ARRAY['Wet Paddy (Nov-Feb)', 'Gadu Paddy (Mar-Jun)', 'Dry Season Fallow (Jul-Oct)'],
    TRUE,
    'Dominated',
    'MODERATE',
    'Verified by HLS NDVI temporal phenology (2018–2025); high crop failure risk in El Niño years.',
    '{"mean": {"yield": 68, "waterEfficiency": 45, "soilHealth": 40, "coverDays": 52, "laborDemand": 65, "overall": 54}, "worstCase": {"yield": 32, "waterEfficiency": 28, "soilHealth": 35, "coverDays": 45, "laborDemand": 50, "overall": 38}}'::jsonb,
    '{"reasoning": "Current farmer convention in Banyumas irrigation basin. Second paddy crop frequently faces severe hydrological stress if monsoon onset is delayed.", "benefits": ["High domestic rice demand", "Familiar farmer cultivation"], "dataGaps": ["No direct gauge of Serayu canal discharge volume", "Fertilizer rates uncalibrated"], "localChecks": ["Verify P3A irrigation canal water allocation", "Check brown planthopper pest pressure"], "dataSources": [{"id": "hls", "name": "NASA HLS 30m", "role": "Vegetation Phenology", "type": "Satellite", "resolution": "30m / 3 days"}]}'::jsonb
),
(
    'strat-mungbean',
    'banyumas-karangrau-01',
    'Strategy A: Paddy – Paddy – Mung Bean (Kacang Hijau)',
    ARRAY['Wet Paddy (Nov-Feb)', 'Gadu Paddy (Mar-May)', 'Mung Bean (Jun-Aug)', 'Green Manure Cover (Sep-Oct)'],
    FALSE,
    'Optimal',
    'MODERATE',
    'Strong agronomic transferability supported by FAO GAEZ v4 suitability and GPM IMERG dry season water budget.',
    '{"mean": {"yield": 84, "waterEfficiency": 82, "soilHealth": 88, "coverDays": 85, "laborDemand": 74, "overall": 83}, "worstCase": {"yield": 70, "waterEfficiency": 75, "soilHealth": 82, "coverDays": 78, "laborDemand": 68, "overall": 75}}'::jsonb,
    '{"reasoning": "Mung bean requires only 250–350 mm of water throughout its 60-day lifecycle, fitting precisely into residual soil moisture. Biological nitrogen fixation restores soil health.", "benefits": ["+30% resilience in El Niño", "+40 kg N/ha soil nitrogen replenishment", "Eliminates 90 days bare fallow weed proliferation"], "dataGaps": ["Certified Vima seed kiosk availability", "Farmgate price fluctuations"], "localChecks": ["Verify village collector off-taker presence", "Inspect drainage to prevent waterlogging"], "dataSources": [{"id": "smap", "name": "NASA SMAP L4", "role": "Root Zone Soil Moisture", "type": "Satellite", "resolution": "9km"}, {"id": "ecostress", "name": "ECOSTRESS ESI", "role": "Water Stress Anomaly", "type": "Satellite", "resolution": "70m"}]}'::jsonb
),
(
    'strat-soybean-corn',
    'banyumas-karangrau-01',
    'Strategy B: Paddy – Soybean – Corn / Sorghum',
    ARRAY['Wet Paddy (Nov-Feb)', 'Soybean (Mar-Jun)', 'Drought Sorghum (Jul-Oct)'],
    FALSE,
    'Tradeoff',
    'MODERATE',
    'Moderate confidence due to soil moisture sensitivity of soybean flowering stage during anomalous dry spells.',
    '{"mean": {"yield": 78, "waterEfficiency": 79, "soilHealth": 76, "coverDays": 80, "laborDemand": 60, "overall": 75}, "worstCase": {"yield": 58, "waterEfficiency": 72, "soilHealth": 70, "coverDays": 74, "laborDemand": 55, "overall": 66}}'::jsonb,
    '{"reasoning": "Replaces water-intensive dry-season rice with soybean and deep-rooting sorghum. Sorghum exhibits exceptional drought tolerance, safeguarding farm income.", "benefits": ["Diversified cereal/legume cashflow", "Cuts water footprint by 520,000 m3 per 100ha", "Breaks soil compaction layer"], "dataGaps": ["Soybean pod borer satellite risk model missing", "Post-harvest thresher availability"], "localChecks": ["Confirm local PPL IPM monitoring", "Ensure upland planting equipment"], "dataSources": [{"id": "power", "name": "NASA POWER AG", "role": "Solar Radiation & Heat Stress", "type": "Satellite", "resolution": "0.5° Daily"}]}'::jsonb
);
