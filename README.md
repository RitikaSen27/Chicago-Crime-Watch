# Chicago Crime Hotspot Dashboard

A full-stack dashboard that identifies Chicago's current crime hotspots from
real open data, breaks down what kinds of crime are driving each area, shows
arrest rates, time-of-day/week patterns, an incident map, and related local
news coverage.

## Stack

- **Data source:** Chicago Data Portal ("Crimes - 2001 to Present", dataset `ijzp-q8t2`)
- **Database:** MySQL
- **Backend:** Python + Flask (REST API)
- **Frontend:** React
- **News:** NewsAPI.org (free tier)

## Project structure

```
crime-dashboard/
├── backend/
│   ├── app.py              Flask API — all /api/... routes
│   ├── ingest_crimes.py    One-time/periodic script that pulls real
│   │                       crime records from Chicago's API into MySQL
│   ├── schema.sql          Database schema + community area seed data
│   ├── requirements.txt    Python dependencies
│   └── .env.example        Template for secrets (copy to .env, fill in)
└── frontend/
    └── src/
        ├── App.js                    Nav, hero chart, area chips, page router
        ├── App.css                   All styling
        ├── hooks/useDashboardData.js Centralized state + API calls
        ├── components/               Gauge, Ring, TickBar (shared visuals)
        ├── pages/                    One file per dashboard tab
        └── utils/timeAgo.js
```

## First-time setup

### 1. Database

```
mysql -u root -p
```
Then in the MySQL prompt, or via MySQL Workbench, run:
```sql
SOURCE backend/schema.sql;
```
This creates the database, tables, and seeds the 77 Chicago community areas.

### 2. Backend

```
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your real values:
```
MYSQL_PASSWORD=...
CHICAGO_APP_TOKEN=...      (from data.cityofchicago.org → Developer Settings)
NEWS_API_KEY=...           (from newsapi.org, free tier)
```

Pull the real crime data (~350k records, takes a few minutes):
```
python ingest_crimes.py
```

Start the API:
```
python app.py
```
Runs at `http://localhost:5000`.

### 3. Frontend

```
cd frontend
npm install
npm install recharts
npm start
```
Runs at `http://localhost:3000`.

**Both backend and frontend must be running at the same time**, in two
separate terminals, for the dashboard to work.

## Notes on the data

- All "last 30 days" windows are anchored to the **most recent date actually
  in the database**, not today's real-world date — Chicago's open data
  portal publishes with a lag, so this keeps the numbers meaningful.
- News coverage is genuinely sparse for smaller neighborhoods; the backend
  falls back to general Chicago crime coverage when no area-specific
  articles are found, and the frontend labels which kind you're looking at.
- `ingest_crimes.py` uses `INSERT IGNORE`, so re-running it is always safe
  and won't create duplicates.
