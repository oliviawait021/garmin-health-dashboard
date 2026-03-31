"""
Garmin Connect → Supabase PostgreSQL ingestion script.

Usage:
  python garmin_fetch.py                    # fetch yesterday (default)
  python garmin_fetch.py --date 2025-03-28  # fetch a specific date
  python garmin_fetch.py --backfill-days 30 # backfill last N days
"""

import argparse
import json
import logging
import sys
from datetime import date, timedelta
from pathlib import Path

import psycopg2
import psycopg2.extras
from garminconnect import Garmin, GarminConnectAuthenticationError

from config import GARMIN_EMAIL, GARMIN_PASSWORD, SUPABASE_DB_URL, GARMIN_TOKEN_PATH

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)


# ── Auth ──────────────────────────────────────────────────────────────────────

def get_garmin_client() -> Garmin:
    """Return an authenticated Garmin client, reusing cached tokens when possible."""
    token_path = Path(GARMIN_TOKEN_PATH)
    client = Garmin()

    if token_path.exists():
        log.info("Loading cached Garmin session tokens from %s", token_path)
        try:
            client.login(str(token_path))
            return client
        except Exception as exc:
            log.warning("Cached token login failed (%s), falling back to password auth", exc)

    log.info("Authenticating with Garmin Connect using email/password")
    try:
        client = Garmin(email=GARMIN_EMAIL, password=GARMIN_PASSWORD)
        client.login()
    except GarminConnectAuthenticationError as exc:
        log.error("Garmin authentication failed: %s", exc)
        raise

    token_path.parent.mkdir(parents=True, exist_ok=True)
    client.garth.dump(str(token_path))
    log.info("Session tokens saved to %s", token_path)
    return client


# ── Fetch helpers ─────────────────────────────────────────────────────────────

def fetch_daily_summary(client: Garmin, date_str: str) -> dict:
    return client.get_stats(date_str)


def fetch_sleep(client: Garmin, date_str: str) -> dict:
    return client.get_sleep_data(date_str)


def fetch_heart_rate(client: Garmin, date_str: str) -> dict:
    return client.get_heart_rates(date_str)


def fetch_stress(client: Garmin, date_str: str) -> dict:
    return client.get_stress_data(date_str)


def fetch_steps(client: Garmin, date_str: str) -> dict:
    return client.get_steps_data(date_str)


def fetch_calories(client: Garmin, date_str: str) -> list[dict]:
    return client.get_daily_calories_data(date_str)


def fetch_activities(client: Garmin, date_str: str) -> list[dict]:
    return client.get_activities_by_date(date_str, date_str)


# ── DB upsert helpers ─────────────────────────────────────────────────────────

def upsert_daily_summary(cur, date_str: str, data: dict) -> None:
    cur.execute(
        """
        INSERT INTO raw_garmin.daily_summary (summary_date, raw_data)
        VALUES (%s, %s)
        ON CONFLICT (summary_date) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (date_str, json.dumps(data)),
    )


def upsert_sleep(cur, date_str: str, data: dict) -> None:
    cur.execute(
        """
        INSERT INTO raw_garmin.sleep (sleep_date, raw_data)
        VALUES (%s, %s)
        ON CONFLICT (sleep_date) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (date_str, json.dumps(data)),
    )


def upsert_heart_rate(cur, date_str: str, data: dict) -> None:
    cur.execute(
        """
        INSERT INTO raw_garmin.heart_rate (hr_date, raw_data)
        VALUES (%s, %s)
        ON CONFLICT (hr_date) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (date_str, json.dumps(data)),
    )


def upsert_stress(cur, date_str: str, data: dict) -> None:
    cur.execute(
        """
        INSERT INTO raw_garmin.stress (stress_date, raw_data)
        VALUES (%s, %s)
        ON CONFLICT (stress_date) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (date_str, json.dumps(data)),
    )


def upsert_steps(cur, date_str: str, data: dict) -> None:
    cur.execute(
        """
        INSERT INTO raw_garmin.steps (steps_date, raw_data)
        VALUES (%s, %s)
        ON CONFLICT (steps_date) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (date_str, json.dumps(data)),
    )


def upsert_calories(cur, date_str: str, data: list) -> None:
    cur.execute(
        """
        INSERT INTO raw_garmin.calories (calories_date, raw_data)
        VALUES (%s, %s)
        ON CONFLICT (calories_date) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (date_str, json.dumps(data)),
    )


def upsert_activity(cur, activity: dict) -> None:
    activity_id = activity.get("activityId")
    activity_date = (activity.get("startTimeLocal") or "")[:10]
    cur.execute(
        """
        INSERT INTO raw_garmin.activities (activity_id, activity_date, raw_data)
        VALUES (%s, %s, %s)
        ON CONFLICT (activity_id) DO UPDATE
            SET raw_data    = EXCLUDED.raw_data,
                ingested_at = NOW()
        """,
        (activity_id, activity_date, json.dumps(activity)),
    )


# ── Per-date sync ─────────────────────────────────────────────────────────────

FETCHERS = [
    ("daily_summary", fetch_daily_summary, upsert_daily_summary),
    ("sleep",         fetch_sleep,         upsert_sleep),
    ("heart_rate",    fetch_heart_rate,    upsert_heart_rate),
    ("stress",        fetch_stress,        upsert_stress),
    ("steps",         fetch_steps,         upsert_steps),
    ("calories",      fetch_calories,      upsert_calories),
]


def sync_date(client: Garmin, conn, target_date: date) -> list[str]:
    """Sync all data types for a single date. Returns list of failed data types."""
    date_str = target_date.isoformat()
    log.info("─── Syncing %s ───", date_str)
    failures = []

    with conn.cursor() as cur:
        # Scalar data types
        for name, fetcher, upserter in FETCHERS:
            try:
                data = fetcher(client, date_str)
                if data:
                    upserter(cur, date_str, data)
                    log.info("  ✓ %s", name)
                else:
                    log.info("  – %s (no data returned)", name)
            except Exception as exc:
                log.error("  ✗ %s: %s", name, exc)
                failures.append(f"{date_str}/{name}")

        # Activities (list)
        try:
            activities = fetch_activities(client, date_str)
            for act in activities:
                upsert_activity(cur, act)
            log.info("  ✓ activities (%d records)", len(activities))
        except Exception as exc:
            log.error("  ✗ activities: %s", exc)
            failures.append(f"{date_str}/activities")

    conn.commit()
    return failures


# ── Entry point ───────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch Garmin data into Supabase")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--date", help="Fetch a specific date (YYYY-MM-DD)")
    group.add_argument("--backfill-days", type=int, help="Backfill last N days")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.date:
        dates = [date.fromisoformat(args.date)]
    elif args.backfill_days:
        today = date.today()
        dates = [today - timedelta(days=i) for i in range(1, args.backfill_days + 1)]
        dates.reverse()  # oldest first
    else:
        dates = [date.today() - timedelta(days=1)]

    log.info("Dates to sync: %s → %s (%d days)", dates[0], dates[-1], len(dates))

    client = get_garmin_client()
    conn = psycopg2.connect(SUPABASE_DB_URL)

    try:
        all_failures: list[str] = []
        for d in dates:
            failures = sync_date(client, conn, d)
            all_failures.extend(failures)
    finally:
        conn.close()

    if all_failures:
        log.error("Completed with %d failure(s): %s", len(all_failures), all_failures)
        sys.exit(1)
    else:
        log.info("All data synced successfully.")


if __name__ == "__main__":
    main()
