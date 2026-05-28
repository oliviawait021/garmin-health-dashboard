"""
One-shot Garmin re-authentication script.

Run this when garmin_fetch.py fails with a token-expired or 429 error.
Best run from a different network (e.g. mobile hotspot) if your home IP is rate-limited.

Usage:
    python reauth.py
"""

import os
import shutil
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

GARMIN_EMAIL = os.environ["GARMIN_EMAIL"]
GARMIN_PASSWORD = os.environ["GARMIN_PASSWORD"]
TOKEN_PATH = os.environ.get("GARMIN_TOKEN_PATH", "/tmp/garmin_tokens")


def main():
    from garminconnect import Garmin

    token_path = Path(TOKEN_PATH)

    # Wipe any stale tokens so we start clean
    if token_path.exists():
        shutil.rmtree(token_path)
        print(f"Cleared old tokens at {token_path}")

    print(f"Authenticating as {GARMIN_EMAIL} ...")
    try:
        client = Garmin(email=GARMIN_EMAIL, password=GARMIN_PASSWORD)
        client.login()
    except Exception as exc:
        if "429" in str(exc) or "Too Many Requests" in str(exc):
            print(
                "\nERROR: Garmin rate-limited this IP (HTTP 429).\n"
                "Switch to a different network (mobile hotspot) and run this script again.\n"
                "Once the token is saved you can switch back to your normal network."
            )
        else:
            print(f"\nERROR: {type(exc).__name__}: {exc}")
        raise SystemExit(1)

    token_path.mkdir(parents=True, exist_ok=True)
    client.garth.dump(str(token_path))
    print(f"\nSuccess! Token saved to {token_path}")
    print("garmin_fetch.py will now use this token — no re-auth needed until it expires (~90 days).")


if __name__ == "__main__":
    main()
