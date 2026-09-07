import time
import os
import requests
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# --- CONFIG ---
APP_TOKEN = os.getenv("CHICAGO_APP_TOKEN")
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": os.getenv("MYSQL_PASSWORD"),
    "database": "chicago_crime"
}

API_URL = "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
LIMIT = 5000

# If a previous run got cut off partway through, set this to the offset
# it last printed (e.g. 265000) to resume from there instead of
# starting over. INSERT IGNORE makes re-fetching earlier batches safe
# either way, but resuming is faster.
START_OFFSET = 265000

MAX_RETRIES = 5

def fetch_crimes(offset=0):
    params = {
        "$limit": LIMIT,
        "$offset": offset,
        "$where": "date > '2025-02-01T00:00:00'",
        "$order": "date DESC",
        "$$app_token": APP_TOKEN
    }
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(API_URL, params=params, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except (requests.exceptions.ConnectionError,
                requests.exceptions.Timeout,
                requests.exceptions.HTTPError) as e:
            wait = 2 ** attempt  # exponential backoff: 2s, 4s, 8s, 16s, 32s
            print(f"  Request failed ({e}). Retrying in {wait}s "
                  f"(attempt {attempt}/{MAX_RETRIES})...")
            time.sleep(wait)
    raise RuntimeError(f"Failed to fetch offset {offset} after {MAX_RETRIES} retries")

def insert_crimes(records, cursor):
    sql = """
    INSERT IGNORE INTO crimes
    (id, case_number, crime_date, primary_type, description,
     location_description, arrest, domestic, community_area, latitude, longitude)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    rows = []
    for r in records:
        try:
            community_area = int(r["community_area"]) if r.get("community_area") else None

            # The Chicago API can return arrest/domestic as the string
            # "true"/"false", or as a real boolean. str(...).lower()
            # normalizes either case so the comparison is reliable.
            is_arrest = str(r.get("arrest", "")).lower() == "true"
            is_domestic = str(r.get("domestic", "")).lower() == "true"

            rows.append((
                r.get("id"),
                r.get("case_number"),
                r.get("date"),
                r.get("primary_type"),
                r.get("description"),
                r.get("location_description"),
                is_arrest,
                is_domestic,
                community_area,
                float(r["latitude"]) if r.get("latitude") else None,
                float(r["longitude"]) if r.get("longitude") else None
            ))
        except Exception as e:
            print("Skipping bad record:", e)
    cursor.executemany(sql, rows)

def main():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    offset = START_OFFSET
    total_inserted = offset  # for display purposes only, if resuming
    while True:
        print(f"Fetching offset {offset}...")
        records = fetch_crimes(offset)
        if not records:
            break
        insert_crimes(records, cursor)
        conn.commit()
        total_inserted += len(records)
        print(f"Inserted batch. Total so far: {total_inserted}")
        offset += LIMIT
        if len(records) < LIMIT:
            break

    cursor.close()
    conn.close()
    print(f"Done. Total records processed: {total_inserted}")

if __name__ == "__main__":
    main()