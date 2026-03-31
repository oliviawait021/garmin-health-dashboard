-- =============================================================
-- Supabase / PostgreSQL setup script
-- Run this once in the Supabase SQL editor to create all schemas
-- and raw (bronze) tables.
-- =============================================================

-- ── Schemas ──────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS raw_garmin;
CREATE SCHEMA IF NOT EXISTS raw_manual;
CREATE SCHEMA IF NOT EXISTS dbt_dev;
CREATE SCHEMA IF NOT EXISTS dbt_prod;

-- ── Bronze tables: raw Garmin data ───────────────────────────

CREATE TABLE IF NOT EXISTS raw_garmin.daily_summary (
    id            BIGSERIAL PRIMARY KEY,
    summary_date  DATE        NOT NULL,
    raw_data      JSONB       NOT NULL,
    ingested_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (summary_date)
);

CREATE TABLE IF NOT EXISTS raw_garmin.sleep (
    id           BIGSERIAL PRIMARY KEY,
    sleep_date   DATE        NOT NULL,
    raw_data     JSONB       NOT NULL,
    ingested_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (sleep_date)
);

CREATE TABLE IF NOT EXISTS raw_garmin.heart_rate (
    id          BIGSERIAL PRIMARY KEY,
    hr_date     DATE        NOT NULL,
    raw_data    JSONB       NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (hr_date)
);

CREATE TABLE IF NOT EXISTS raw_garmin.stress (
    id          BIGSERIAL PRIMARY KEY,
    stress_date DATE        NOT NULL,
    raw_data    JSONB       NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (stress_date)
);

CREATE TABLE IF NOT EXISTS raw_garmin.activities (
    id            BIGSERIAL PRIMARY KEY,
    activity_id   BIGINT      NOT NULL,
    activity_date DATE        NOT NULL,
    raw_data      JSONB       NOT NULL,
    ingested_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (activity_id)
);

CREATE TABLE IF NOT EXISTS raw_garmin.steps (
    id          BIGSERIAL PRIMARY KEY,
    steps_date  DATE        NOT NULL,
    raw_data    JSONB       NOT NULL,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (steps_date)
);

-- ── Manual entry table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS raw_manual.weight (
    id           BIGSERIAL PRIMARY KEY,
    weigh_date   DATE           NOT NULL,
    weight_lbs   NUMERIC(5, 1)  NOT NULL,
    notes        TEXT,
    entered_at   TIMESTAMPTZ    DEFAULT NOW(),
    UNIQUE (weigh_date)
);

-- ── Indexes for common query patterns ────────────────────────

CREATE INDEX IF NOT EXISTS idx_daily_summary_date  ON raw_garmin.daily_summary (summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_date          ON raw_garmin.sleep          (sleep_date DESC);
CREATE INDEX IF NOT EXISTS idx_hr_date             ON raw_garmin.heart_rate     (hr_date DESC);
CREATE INDEX IF NOT EXISTS idx_stress_date         ON raw_garmin.stress         (stress_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_date     ON raw_garmin.activities     (activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_steps_date          ON raw_garmin.steps          (steps_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_date         ON raw_manual.weight         (weigh_date DESC);

SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname IN ('raw_garmin', 'raw_manual')
ORDER BY schemaname, tablename;

CREATE SCHEMA IF NOT EXISTS dbt_dev;
CREATE SCHEMA IF NOT EXISTS dbt_prod;

-- Verify all 4
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('raw_garmin', 'raw_manual', 'dbt_dev', 'dbt_prod');