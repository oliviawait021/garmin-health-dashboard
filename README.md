# Garmin Health Dashboard

Personal health data platform: Garmin Connect → Supabase PostgreSQL → dbt → Next.js dashboard.

## Architecture

```
Garmin Connect API
  → GitHub Actions (daily cron)
  → Python ingestion → Supabase raw_garmin / raw_manual (bronze)
  → dbt-core: staging → intermediate → marts (silver/gold)
  → Next.js dashboard (local dev)
```

## Getting started

### 1. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase_setup.sql` to create schemas and tables.
3. Note your **Project URL**, **anon key**, and **DB connection string** (Settings → Database).

### 2. Python ingestion

```bash
cd ingestion
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Copy and fill in credentials
cp ../.env.example ../.env
# Then export them:
export $(grep -v '^#' .env | xargs)

# Fetch yesterday
python garmin_fetch.py

# Backfill last 30 days
python garmin_fetch.py --backfill-days 30
```

> **Note on Garmin auth:** The first run opens an MFA prompt in your terminal. After completing it, session tokens are cached at `GARMIN_TOKEN_PATH` so subsequent runs skip re-auth.

### 3. dbt

```bash
# Install dbt
pip install dbt-core dbt-postgres

# Copy the profile template and fill in your Supabase credentials
cp dbt_project/profiles.yml.example ~/.dbt/profiles.yml

cd dbt_project
dbt deps
dbt build           # runs against dbt_dev schema
dbt build --target prod
```

### 4. Next.js dashboard

```bash
cd dashboard
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
# Open http://localhost:3000
```

### 5. GitHub Actions CI/CD

Add the following secrets to your GitHub repo (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `GARMIN_EMAIL` | Garmin Connect email |
| `GARMIN_PASSWORD` | Garmin Connect password |
| `SUPABASE_DB_URL` | Direct PostgreSQL connection string |
| `DBT_HOST` | Supabase DB host |
| `DBT_PASSWORD` | Supabase DB password |

The **daily-garmin-sync** workflow runs at 7 AM UTC (midnight MST). Trigger it manually via the Actions tab to test.

## Project structure

```
├── supabase_setup.sql          # Run once to create DB schemas + tables
├── ingestion/
│   ├── garmin_fetch.py         # Main ingestion script
│   ├── config.py               # Reads env vars
│   └── requirements.txt
├── dbt_project/
│   ├── models/
│   │   ├── sources.yml
│   │   ├── staging/            # Silver: typed columns from JSONB
│   │   ├── intermediate/       # Joined + enriched
│   │   └── marts/              # Gold: dashboard-ready tables
│   ├── tests/                  # Custom singular tests
│   ├── seeds/                  # activity_types reference data
│   └── models.yml              # Column-level tests
├── dashboard/
│   └── src/
│       ├── app/page.tsx        # Main dashboard page
│       ├── components/         # Chart + UI components
│       └── lib/supabase.ts     # Supabase client + types
└── .github/workflows/
    ├── daily-garmin-sync.yml
    └── dbt-ci.yml
```

## Adding new metrics

1. Add a column to the relevant `raw_garmin.*` table in Supabase.
2. Extract it in the corresponding `stg_garmin__*.sql` staging model.
3. Propagate through `int_daily_health_metrics` → `mart_daily_dashboard`.
4. Add a chart component and drop it into `page.tsx`.
