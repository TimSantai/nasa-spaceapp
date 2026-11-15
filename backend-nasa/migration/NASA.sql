CREATE TYPE "parcel_kind" AS ENUM (
  'field_parcel',
  'village'
);

CREATE TYPE "objective_type" AS ENUM (
  'relative_yield',
  'irrigation_water_demand',
  'water_stress_days',
  'soil_health_estimate',
  'bare_soil_days'
);

CREATE TYPE "approach_type" AS ENUM (
  'observational_matching',
  'ml_stress_baseline',
  'water_balance'
);

CREATE TYPE "confidence_level" AS ENUM (
  'high',
  'medium',
  'low'
);

CREATE TYPE "strategy_origin" AS ENUM (
  'current_rotation',
  'common_in_region',
  'extension_suggested'
);

CREATE TYPE "source_status" AS ENUM (
  'used',
  'optional',
  'not_used'
);

CREATE TABLE "regions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(30) UNIQUE NOT NULL,
  "name" varchar(150) NOT NULL,
  "country_code" char(2) NOT NULL,
  "has_field_data" boolean NOT NULL DEFAULT false,
  "has_rotation_history" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "parcels" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "region_id" uuid NOT NULL,
  "kind" parcel_kind NOT NULL,
  "external_id" varchar(100) NOT NULL,
  "name" varchar(150),
  "boundary" "geometry(MultiPolygon, 4326)" NOT NULL,
  "centroid" "geometry(Point, 4326)",
  "area_hectares" numeric(12,2),
  "slope_mean_deg" numeric(5,2),
  "slope_max_deg" numeric(5,2),
  "erosion_risk" varchar(20),
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "crops" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(50) UNIQUE NOT NULL,
  "name" varchar(100) NOT NULL,
  "name_id" varchar(100),
  "cdl_code" int UNIQUE,
  "family" varchar(100),
  "is_legume" boolean NOT NULL DEFAULT false,
  "growth_duration_days" int,
  "n_fixation_coef" numeric(6,2),
  "n_fixation_source" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "crop_requirements" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "crop_id" uuid UNIQUE NOT NULL,
  "min_ph" numeric(4,2),
  "max_ph" numeric(4,2),
  "min_temp_c" numeric(5,2),
  "max_temp_c" numeric(5,2),
  "min_rainfall_mm" numeric(8,2),
  "max_rainfall_mm" numeric(8,2),
  "suitability_source" varchar(100) DEFAULT 'FAO GAEZ v4',
  "nutrient_notes" jsonb
);

CREATE TABLE "parcel_crop_history" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid NOT NULL,
  "year" int NOT NULL,
  "crop_id" uuid NOT NULL,
  "source" varchar(50) DEFAULT 'USDA CSB/CDL'
);

CREATE TABLE "parcel_soil_properties" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid UNIQUE NOT NULL,
  "texture_class" varchar(50),
  "organic_matter_pct" numeric(5,2),
  "awc_mm" numeric(7,2),
  "ph" numeric(4,2),
  "erosion_class" varchar(30),
  "source" varchar(50) NOT NULL,
  "resolution_m" int,
  "p05_p95_range" jsonb
);

CREATE TABLE "parcel_calendar" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid NOT NULL,
  "season_year" int NOT NULL,
  "season_label" varchar(50),
  "planting_date" date,
  "harvest_date" date,
  "fallow_days" int,
  "stress_season" boolean DEFAULT false,
  "source" varchar(100) DEFAULT 'HLS NDVI gap-filled, ECOSTRESS ESI'
);

CREATE TABLE "data_sources" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(100) UNIQUE NOT NULL,
  "provider" varchar(100) DEFAULT 'NASA',
  "product_version" varchar(50),
  "spatial_resolution" varchar(50),
  "temporal_resolution" varchar(50),
  "is_nasa" boolean NOT NULL DEFAULT true,
  "status" source_status NOT NULL DEFAULT 'used',
  "url" text,
  "note" text
);

CREATE TABLE "observations" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid NOT NULL,
  "data_source_id" uuid NOT NULL,
  "variable" varchar(50) NOT NULL,
  "observed_at" date NOT NULL,
  "value" numeric(14,4),
  "unit" varchar(30),
  "spatial_resolution_m" int,
  "context_only" boolean NOT NULL DEFAULT false
);

CREATE TABLE "climate_indices" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "index_name" varchar(20) NOT NULL,
  "year" int NOT NULL,
  "month" int NOT NULL,
  "value" numeric(6,3) NOT NULL
);

CREATE TABLE "climate_year_labels" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "region_id" uuid NOT NULL,
  "year" int NOT NULL,
  "enso_phase" varchar(20),
  "iod_phase" varchar(20),
  "drought_percentile" numeric(5,2)
);

CREATE TABLE "model_versions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(100) NOT NULL,
  "version" varchar(50) NOT NULL,
  "approach" approach_type NOT NULL,
  "artifact_path" text,
  "metrics" jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "strategies" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid NOT NULL,
  "name" varchar(150) NOT NULL,
  "is_baseline" boolean NOT NULL DEFAULT false,
  "origin" strategy_origin NOT NULL,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "strategy_items" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "strategy_id" uuid NOT NULL,
  "crop_id" uuid NOT NULL,
  "sequence_order" int NOT NULL,
  "season_label" varchar(50)
);

CREATE TABLE "scenario_outcomes" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "strategy_id" uuid NOT NULL,
  "year" int NOT NULL,
  "objective" objective_type NOT NULL,
  "value" numeric(14,4) NOT NULL,
  "approach" approach_type NOT NULL,
  "model_version_id" uuid
);

CREATE TABLE "rotation_evidence" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid NOT NULL,
  "from_crop_id" uuid NOT NULL,
  "to_crop_id" uuid NOT NULL,
  "metric" varchar(30) NOT NULL,
  "n_matched_parcels" int NOT NULL,
  "mean_value" numeric(14,4),
  "p25_value" numeric(14,4),
  "p75_value" numeric(14,4),
  "is_association_only" boolean NOT NULL DEFAULT true
);

CREATE TABLE "evidence_cards" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "strategy_id" uuid UNIQUE NOT NULL,
  "reason" text,
  "evidence" jsonb,
  "benefits" jsonb,
  "gaps" jsonb,
  "risks_to_check" jsonb,
  "confidence" confidence_level NOT NULL,
  "confidence_reasons" jsonb NOT NULL,
  "provenance" jsonb NOT NULL,
  "generated_by" varchar(20) DEFAULT 'rules',
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "data_gaps" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "parcel_id" uuid NOT NULL,
  "strategy_id" uuid,
  "variable" varchar(100) NOT NULL,
  "reason" text NOT NULL
);

CREATE TABLE "glossary" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "term" varchar(100) UNIQUE NOT NULL,
  "definition_id" text NOT NULL,
  "definition_en" text
);

CREATE INDEX "idx_parcels_boundary_gist" ON "parcels" ("boundary");

CREATE UNIQUE INDEX "uq_parcels_region_external" ON "parcels" ("region_id", "external_id");

CREATE UNIQUE INDEX "uq_history_parcel_year" ON "parcel_crop_history" ("parcel_id", "year");

CREATE INDEX "idx_calendar_parcel_season" ON "parcel_calendar" ("parcel_id", "season_year", "season_label");

CREATE INDEX "idx_obs_parcel_var_time" ON "observations" ("parcel_id", "variable", "observed_at");

CREATE UNIQUE INDEX "uq_climate_index_month" ON "climate_indices" ("index_name", "year", "month");

CREATE UNIQUE INDEX "uq_year_labels_region_year" ON "climate_year_labels" ("region_id", "year");

CREATE INDEX ON "strategies" ("parcel_id");

CREATE UNIQUE INDEX "uq_strategy_items_order" ON "strategy_items" ("strategy_id", "sequence_order");

CREATE UNIQUE INDEX "uq_outcomes_strategy_year_objective" ON "scenario_outcomes" ("strategy_id", "year", "objective");

CREATE INDEX "idx_rotation_evidence_lookup" ON "rotation_evidence" ("parcel_id", "from_crop_id", "to_crop_id", "metric");

COMMENT ON COLUMN "regions"."code" IS 'mis. us_west, banyumas';

COMMENT ON COLUMN "regions"."has_field_data" IS 'False untuk Banyumas: memicu penurunan keyakinan otomatis';

COMMENT ON COLUMN "regions"."has_rotation_history" IS 'True bila CSB/CDL tersedia';

COMMENT ON COLUMN "parcels"."external_id" IS 'ID CSB atau kode desa';

COMMENT ON COLUMN "parcels"."slope_mean_deg" IS 'Dari SRTM, rata-rata zonal';

COMMENT ON COLUMN "parcels"."erosion_risk" IS 'low, medium, high: estimasi dari lereng dan tanah';

COMMENT ON COLUMN "crops"."code" IS 'mis. corn, rice, mung_bean';

COMMENT ON COLUMN "crops"."name_id" IS 'Nama bahasa Indonesia';

COMMENT ON COLUMN "crops"."cdl_code" IS 'Kode kelas USDA CDL untuk pemetaan CSB';

COMMENT ON COLUMN "crops"."family" IS 'Aturan rotasi';

COMMENT ON COLUMN "crops"."n_fixation_coef" IS 'Koefisien kontribusi N dari literatur; ESTIMASI, bukan pengukuran';

COMMENT ON COLUMN "crops"."n_fixation_source" IS 'Referensi literatur untuk koefisien';

COMMENT ON COLUMN "crop_requirements"."suitability_source" IS 'Prior kesesuaian, belum dikalibrasi untuk varietas lokal';

COMMENT ON COLUMN "parcel_soil_properties"."awc_mm" IS 'Kapasitas air tersedia';

COMMENT ON COLUMN "parcel_soil_properties"."source" IS 'SSURGO (AS) atau SoilGrids (ID)';

COMMENT ON COLUMN "parcel_soil_properties"."p05_p95_range" IS 'Rentang ketidakpastian SoilGrids';

COMMENT ON COLUMN "parcel_calendar"."stress_season" IS 'Musim rentan stres dari ESI';

COMMENT ON COLUMN "data_sources"."name" IS 'mis. NASA POWER, GPM IMERG, SMAP L4, HLS, ECOSTRESS ESI';

COMMENT ON COLUMN "observations"."variable" IS 'rainfall_mm, tmax_c, tmin_c, soil_moisture, ndvi, esi, dll';

COMMENT ON COLUMN "observations"."context_only" IS 'True untuk data kasar (SMAP, POWER, GRACE): konteks wilayah, bukan kondisi petak';

COMMENT ON COLUMN "climate_indices"."index_name" IS 'ONI atau DMI';

COMMENT ON COLUMN "climate_year_labels"."enso_phase" IS 'el_nino, neutral, la_nina';

COMMENT ON COLUMN "climate_year_labels"."iod_phase" IS 'positive, neutral, negative';

COMMENT ON COLUMN "climate_year_labels"."drought_percentile" IS 'Persentil kelembapan tanah (AS barat)';

COMMENT ON COLUMN "model_versions"."artifact_path" IS 'Jalur lokal ke artefak model';

COMMENT ON COLUMN "model_versions"."metrics" IS 'Metrik baseline';

COMMENT ON COLUMN "strategies"."name" IS 'mis. Padi-padi-bera';

COMMENT ON COLUMN "strategies"."is_baseline" IS 'Rotasi yang sedang dipakai';

COMMENT ON COLUMN "scenario_outcomes"."year" IS 'Tahun lampau; dikelompokkan lewat climate_year_labels';

COMMENT ON COLUMN "scenario_outcomes"."value" IS 'Relatif terhadap baseline, bukan nilai absolut';

COMMENT ON COLUMN "rotation_evidence"."metric" IS 'et, stress, ndvi';

COMMENT ON COLUMN "rotation_evidence"."is_association_only" IS 'Bukti CSB bersifat asosiasi, bukan sebab-akibat';

COMMENT ON COLUMN "evidence_cards"."provenance" IS 'Sumber, resolusi, pendekatan asal angka';

COMMENT ON COLUMN "evidence_cards"."generated_by" IS 'rules atau llm (LLM hanya merangkai kalimat dari angka)';

COMMENT ON COLUMN "data_gaps"."strategy_id" IS 'Kosong bila celah berlaku untuk seluruh lahan';

COMMENT ON COLUMN "glossary"."term" IS 'ET, NDVI, anomali kelembapan tanah, risiko embun beku, neraca air';

ALTER TABLE "parcels" ADD FOREIGN KEY ("region_id") REFERENCES "regions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "crop_requirements" ADD FOREIGN KEY ("crop_id") REFERENCES "crops" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "parcel_crop_history" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "parcel_crop_history" ADD FOREIGN KEY ("crop_id") REFERENCES "crops" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "parcel_soil_properties" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "parcel_calendar" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "observations" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "observations" ADD FOREIGN KEY ("data_source_id") REFERENCES "data_sources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "climate_year_labels" ADD FOREIGN KEY ("region_id") REFERENCES "regions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "strategies" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "strategy_items" ADD FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "strategy_items" ADD FOREIGN KEY ("crop_id") REFERENCES "crops" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "scenario_outcomes" ADD FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "scenario_outcomes" ADD FOREIGN KEY ("model_version_id") REFERENCES "model_versions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "rotation_evidence" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "rotation_evidence" ADD FOREIGN KEY ("from_crop_id") REFERENCES "crops" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "rotation_evidence" ADD FOREIGN KEY ("to_crop_id") REFERENCES "crops" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "evidence_cards" ADD FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "data_gaps" ADD FOREIGN KEY ("parcel_id") REFERENCES "parcels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "data_gaps" ADD FOREIGN KEY ("strategy_id") REFERENCES "strategies" ("id") DEFERRABLE INITIALLY IMMEDIATE;
