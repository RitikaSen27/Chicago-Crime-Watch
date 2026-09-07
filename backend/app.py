from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": os.getenv("MYSQL_PASSWORD"),
    "database": "chicago_crime"
}

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
CACHE_MINUTES = 30
NEWS_DOMAINS = "chicagotribune.com,suntimes.com,cbsnews.com,nbcchicago.com,abc7chicago.com,blockclubchicago.org"

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def get_latest_date(cursor):
    """
    Returns the most recent crime_date actually present in the data.
    Chicago's open data portal publishes with a lag, so 'today' in the
    real world is not the same as 'today' in this dataset. Anchoring
    all '30 days' / '14 days' windows to this value (instead of NOW())
    keeps every endpoint consistent with what data actually exists.
    """
    cursor.execute("SELECT MAX(crime_date) AS latest FROM crimes")
    return cursor.fetchone()["latest"]

def call_newsapi(query):
    """
    Calls NewsAPI with a given query string, restricted to a whitelist
    of real Chicago news domains. Prints the raw status/error to the
    terminal so a quota issue is visible and distinguishable from a
    genuine zero-result search.
    """
    resp = requests.get("https://newsapi.org/v2/everything", params={
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 5,
        "domains": NEWS_DOMAINS,
        "apiKey": NEWS_API_KEY
    })
    data = resp.json()
    if data.get("status") != "ok":
        print(f"NewsAPI error for query '{query}': "
              f"{data.get('code')} — {data.get('message')}")
    return data.get("articles", [])

@app.route("/api/hotspots")
def hotspots():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    latest = get_latest_date(cursor)
    query = """
        SELECT
            ca.area_name,
            ca.area_number,
            COUNT(*) AS crime_count
        FROM crimes c
        JOIN community_areas ca ON c.community_area = ca.area_number
        WHERE c.crime_date >= %s - INTERVAL 30 DAY
        GROUP BY ca.area_name, ca.area_number
        ORDER BY crime_count DESC
        LIMIT 10
    """
    cursor.execute(query, (latest,))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

@app.route("/api/area/<area_name>/breakdown")
def area_breakdown(area_name):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    latest = get_latest_date(cursor)
    query = """
        SELECT
            c.primary_type,
            COUNT(*) AS type_count
        FROM crimes c
        JOIN community_areas ca ON c.community_area = ca.area_number
        WHERE ca.area_name = %s
          AND c.crime_date >= %s - INTERVAL 30 DAY
        GROUP BY c.primary_type
        ORDER BY type_count DESC
        LIMIT 6
    """
    cursor.execute(query, (area_name, latest))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

@app.route("/api/area/<area_name>/arrests")
def area_arrests(area_name):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    latest = get_latest_date(cursor)
    query = """
        SELECT
            COUNT(*) AS total_crimes,
            SUM(CASE WHEN arrest = 1 THEN 1 ELSE 0 END) AS total_arrests
        FROM crimes c
        JOIN community_areas ca ON c.community_area = ca.area_number
        WHERE ca.area_name = %s
          AND c.crime_date >= %s - INTERVAL 30 DAY
    """
    cursor.execute(query, (area_name, latest))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    total = result["total_crimes"] or 0
    arrests = result["total_arrests"] or 0
    rate = round((arrests / total) * 100, 1) if total > 0 else 0

    return jsonify({
        "area_name": area_name,
        "total_crimes": total,
        "total_arrests": arrests,
        "arrest_rate": rate
    })

@app.route("/api/area/<area_name>/timepattern")
def area_timepattern(area_name):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    latest = get_latest_date(cursor)

    cursor.execute("""
        SELECT
            DAYNAME(crime_date) AS day_name,
            DAYOFWEEK(crime_date) AS day_num,
            COUNT(*) AS count
        FROM crimes c
        JOIN community_areas ca ON c.community_area = ca.area_number
        WHERE ca.area_name = %s
          AND c.crime_date >= %s - INTERVAL 30 DAY
        GROUP BY day_name, day_num
        ORDER BY day_num
    """, (area_name, latest))
    by_day = cursor.fetchall()

    cursor.execute("""
        SELECT
            HOUR(crime_date) AS hour,
            COUNT(*) AS count
        FROM crimes c
        JOIN community_areas ca ON c.community_area = ca.area_number
        WHERE ca.area_name = %s
          AND c.crime_date >= %s - INTERVAL 30 DAY
        GROUP BY hour
        ORDER BY hour
    """, (area_name, latest))
    by_hour = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify({"by_day": by_day, "by_hour": by_hour})

@app.route("/api/area/<area_name>/locations")
def area_locations(area_name):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    latest = get_latest_date(cursor)
    query = """
        SELECT latitude, longitude, primary_type, arrest
        FROM crimes c
        JOIN community_areas ca ON c.community_area = ca.area_number
        WHERE ca.area_name = %s
          AND c.crime_date >= %s - INTERVAL 30 DAY
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
        ORDER BY RAND()
        LIMIT 400
    """
    cursor.execute(query, (area_name, latest))
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

@app.route("/api/news/<area_name>")
def news(area_name):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Check cache first
    cursor.execute("""
        SELECT * FROM news_cache
        WHERE area_name = %s AND fetched_at >= %s
        ORDER BY published_at DESC
    """, (area_name, datetime.now() - timedelta(minutes=CACHE_MINUTES)))
    cached = cursor.fetchall()

    if cached:
        cursor.close()
        conn.close()
        return jsonify(cached)

    # Tier 1: tightly scoped to this specific area
    articles = call_newsapi(f"\"{area_name}\" AND \"Chicago\"")
    is_specific = True

    # Tier 2: if nothing came back, fall back to general Chicago crime
    # coverage instead of showing an empty panel. Smaller neighborhoods
    # are frequently not name-checked in mainstream news even when
    # incident counts are high, so this keeps the News tab useful.
    if not articles:
        print(f"No area-specific results for '{area_name}', "
              f"falling back to general Chicago crime coverage.")
        articles = call_newsapi("Chicago crime")
        is_specific = False

    results = []
    for a in articles:
        cursor.execute("""
            INSERT INTO news_cache (area_name, title, description, url, source_name, published_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            area_name,
            a.get("title"),
            a.get("description"),
            a.get("url"),
            a.get("source", {}).get("name"),
            a.get("publishedAt", "").replace("T", " ").replace("Z", "")
        ))
        item = dict(a)
        item["is_area_specific"] = is_specific
        results.append(item)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(results)

@app.route("/api/summary")
def summary():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    latest = get_latest_date(cursor)

    cursor.execute(
        "SELECT COUNT(*) as total FROM crimes WHERE crime_date >= %s - INTERVAL 30 DAY",
        (latest,)
    )
    total = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT DATE(crime_date) as day, COUNT(*) as count
        FROM crimes
        WHERE crime_date >= %s - INTERVAL 14 DAY
        GROUP BY DATE(crime_date)
        ORDER BY day
    """, (latest,))
    trend = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify({
        "total_30_days": total,
        "trend": trend,
        "latest_data_date": str(latest)
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)