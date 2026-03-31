"""
Configuration — all values come from environment variables.
Copy .env.example to .env at the repo root and fill in your credentials.
Never commit actual secrets.
"""
import os

GARMIN_EMAIL = os.environ["GARMIN_EMAIL"]
GARMIN_PASSWORD = os.environ["GARMIN_PASSWORD"]
SUPABASE_DB_URL = os.environ["SUPABASE_DB_URL"]

# Optional: path to a file where garminconnect can cache session tokens.
# This avoids full re-auth on every run and is important for GitHub Actions.
GARMIN_TOKEN_PATH = os.environ.get("GARMIN_TOKEN_PATH", "/tmp/garmin_tokens")
