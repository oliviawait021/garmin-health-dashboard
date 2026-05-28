"""
Apple Health Export → Supabase ingestion script.

Imports from Apple Health XML export:
  - Body weight         → raw_manual.weight          (Renpho, any scale)
  - Body composition    → raw_manual.body_composition (fat %, BMI, lean mass)

Usage:
    python import_apple_health.py /path/to/export.xml
    python import_apple_health.py /path/to/export.zip   # zip also accepted
"""

import argparse
import logging
import os
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree.ElementTree import iterparse

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

DB_URL = os.environ["SUPABASE_DB_URL"]

# Apple Health record types we care about
WEIGHT_TYPE      = "HKQuantityTypeIdentifierBodyMass"
FAT_TYPE         = "HKQuantityTypeIdentifierBodyFatPercentage"
BMI_TYPE         = "HKQuantityTypeIdentifierBodyMassIndex"
LEAN_MASS_TYPE   = "HKQuantityTypeIdentifierLeanBodyMass"

WANTED_TYPES = {WEIGHT_TYPE, FAT_TYPE, BMI_TYPE, LEAN_MASS_TYPE}

KG_TO_LBS = 2.20462


def parse_date(ts: str) -> str:
    """Parse Apple Health timestamp like '2026-05-28 08:00:00 -0700' → 'YYYY-MM-DD'."""
    return ts[:10]


def kg_or_lbs_to_lbs(value: float, unit: str) -> float:
    if unit in ("kg",):
        return round(value * KG_TO_LBS, 1)
    return round(value, 1)


def kg_or_lbs_to_lbs_precise(value: float, unit: str) -> float:
    if unit in ("kg",):
        return round(value * KG_TO_LBS, 2)
    return round(value, 2)


def parse_records(xml_path: str):
    """Stream-parse export.xml; yield (type, date, value, unit, source) tuples."""
    log.info("Parsing %s …", xml_path)
    count = 0
    for _event, elem in iterparse(xml_path, events=("end",)):
        if elem.tag != "Record":
            elem.clear()
            continue
        rtype = elem.get("type", "")
        if rtype not in WANTED_TYPES:
            elem.clear()
            continue
        try:
            value  = float(elem.get("value", "0"))
            unit   = elem.get("unit", "")
            date   = parse_date(elem.get("startDate", ""))
            source = elem.get("sourceName", "Unknown")
            yield rtype, date, value, unit, source
            count += 1
        except (ValueError, TypeError):
            pass
        elem.clear()
    log.info("Extracted %d relevant records from XML", count)


def open_xml(path: str):
    """Return the XML file path, extracting from zip if needed."""
    p = Path(path)
    if p.suffix.lower() == ".zip":
        log.info("Extracting export.xml from zip …")
        extract_dir = p.parent / "apple_health_extract"
        with zipfile.ZipFile(p) as zf:
            # Apple Health zips contain apple_health_export/export.xml
            xml_members = [m for m in zf.namelist() if m.endswith("export.xml")]
            if not xml_members:
                log.error("No export.xml found inside zip")
                sys.exit(1)
            zf.extract(xml_members[0], extract_dir)
        return str(extract_dir / xml_members[0])
    return str(p)


def load_records(xml_path: str):
    """Return dicts of {date: best_value} for each metric, keeping one value per day."""
    weights: dict[str, tuple[float, str]] = {}          # date → (lbs, source)
    fat:     dict[str, float] = {}                       # date → pct
    bmi:     dict[str, float] = {}
    lean:    dict[str, tuple[float, str]] = {}           # date → (lbs, source)

    for rtype, date, value, unit, source in parse_records(xml_path):
        if rtype == WEIGHT_TYPE:
            lbs = kg_or_lbs_to_lbs(value, unit)
            # Keep first reading of the day (Apple Health is ordered chronologically)
            if date not in weights:
                weights[date] = (lbs, source)
        elif rtype == FAT_TYPE:
            pct = round(value * 100, 2) if value <= 1.0 else round(value, 2)
            if date not in fat:
                fat[date] = pct
        elif rtype == BMI_TYPE:
            if date not in bmi:
                bmi[date] = round(value, 2)
        elif rtype == LEAN_MASS_TYPE:
            lbs = kg_or_lbs_to_lbs_precise(value, unit)
            if date not in lean:
                lean[date] = (lbs, source)

    return weights, fat, bmi, lean


def upsert_weights(cur, weights: dict):
    if not weights:
        log.info("No weight records to import")
        return
    rows = [
        (date, lbs, f"Apple Health / {source}")
        for date, (lbs, source) in sorted(weights.items())
        if lbs <= 155  # exclude husband's data
    ]
    psycopg2.extras.execute_batch(
        cur,
        """
        INSERT INTO raw_manual.weight (weigh_date, weight_lbs, notes)
        VALUES (%s, %s, %s)
        ON CONFLICT (weigh_date) DO UPDATE
            SET weight_lbs  = EXCLUDED.weight_lbs,
                notes       = EXCLUDED.notes,
                entered_at  = NOW()
        """,
        rows,
    )
    log.info("Upserted %d weight records", len(rows))


def upsert_body_composition(cur, fat, bmi, lean):
    all_dates = set(fat) | set(bmi) | set(lean)
    if not all_dates:
        log.info("No body composition records to import")
        return
    rows = []
    for date in sorted(all_dates):
        lean_lbs, source = lean.get(date, (None, None))
        rows.append((
            date,
            fat.get(date),
            bmi.get(date),
            lean_lbs,
            source,
        ))
    psycopg2.extras.execute_batch(
        cur,
        """
        INSERT INTO raw_manual.body_composition
            (entry_date, body_fat_pct, bmi, lean_body_mass_lbs, source_name)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (entry_date) DO UPDATE
            SET body_fat_pct        = EXCLUDED.body_fat_pct,
                bmi                 = EXCLUDED.bmi,
                lean_body_mass_lbs  = EXCLUDED.lean_body_mass_lbs,
                source_name         = EXCLUDED.source_name,
                entered_at          = NOW()
        """,
        rows,
    )
    log.info("Upserted %d body composition records", len(rows))


def main():
    parser = argparse.ArgumentParser(description="Import Apple Health export into Supabase")
    parser.add_argument("path", help="Path to export.xml or export.zip")
    args = parser.parse_args()

    xml_path = open_xml(args.path)
    weights, fat, bmi, lean = load_records(xml_path)

    log.info(
        "Found: %d weight | %d body fat | %d BMI | %d lean mass records",
        len(weights), len(fat), len(bmi), len(lean),
    )

    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor() as cur:
            upsert_weights(cur, weights)
            upsert_body_composition(cur, fat, bmi, lean)
        conn.commit()
    finally:
        conn.close()

    log.info("Done. Run  dbt run --profiles-dir ~/.dbt  to refresh the mart tables.")


if __name__ == "__main__":
    main()
